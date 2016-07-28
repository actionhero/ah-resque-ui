module.exports = {
  load: 99999999,
  initialize: function (api, next) {

    /* ----- Route Injection ----- */
 
    api.routes.registerRoute('get', '/resque/packageDetails',    'resque:packageDetails');
    api.routes.registerRoute('get', '/resque/resqueDetails',     'resque:resqueDetails');

    api.routes.registerRoute('get', '/resque/queued',            'resque:queued');
    api.routes.registerRoute('get', '/resque/loadWorkerQueues',  'resque:loadWorkerQueues');
    api.routes.registerRoute('get', '/resque/resqueFailedCount', 'resque:resqueFailedCount');
    api.routes.registerRoute('get', '/resque/resqueFailed',      'resque:resqueFailed');
    api.routes.registerRoute('get', '/resque/delayedjobs',       'resque:delayedjobs');
    api.routes.registerRoute('get', '/resque/locks',             'resque:locks');

    api.routes.registerRoute('post', '/resque/removeFailed',            'resque:removeFailed');
    api.routes.registerRoute('post', '/resque/retryAndRemoveFailed',    'resque:retryAndRemoveFailed');
    api.routes.registerRoute('post', '/resque/removeAllFailed',         'resque:removeAllFailed');
    api.routes.registerRoute('post', '/resque/retryAndRemoveAllFailed', 'resque:retryAndRemoveAllFailed');
    api.routes.registerRoute('post', '/resque/forceCleanWorker',        'resque:forceCleanWorker');
    api.routes.registerRoute('post', '/resque/delQueue',                'resque:delQueue');
    api.routes.registerRoute('post', '/resque/delDelayed',              'resque:delDelayed');
    api.routes.registerRoute('post', '/resque/runDelayed',              'resque:runDelayed');
    api.routes.registerRoute('post', '/resque/delLock',                 'resque:delLock');

    /* ----- Proxy Middleware ----- */

    var middleware = {
      'ah-resque-ui-proxy-middleware': {
        name: 'ah-resque-ui-proxy-middleware',
        global: false,
        preProcessor: function(data, callback){
          return callback();
        }
      }
    }

    if(api.config['ah-resque-ui'].middleware){
      var sourceMiddleware = api.actions.middleware[api.config['ah-resque-ui'].middleware];
      middleware['ah-resque-ui-proxy-middleware'].preProcessor  = sourceMiddleware.preProcessor;
      middleware['ah-resque-ui-proxy-middleware'].postProcessor = sourceMiddleware.postProcessor;
    }

    api.actions.addMiddleware(middleware['ah-resque-ui-proxy-middleware']);

    var ahVersionSplit = api.actionheroVersion.split('.');

    if(ahVersionSplit.length > 0 && parseInt(ahVersionSplit[0]) <= 12){
      api.log("[ah-resque-ui] Uh, your ActionHero Version doesn't support all resque functions... adding some polyfills");

      api.tasks.queued = function(q, start, stop, callback){
        var self = this;
        api.resque.queue.connection.redis.lrange(api.resque.queue.connection.key('queue', q), start, stop, function(err, items){
          var tasks = items.map(function(i){
            return JSON.parse(i);
          });
          callback(err, tasks);
        });
      };

      api.tasks.locks = function(callback){
        var self = this;
        var keys = [];
        var data = {};

        api.resque.queue.connection.redis.keys(api.resque.queue.connection.key('lock:*'), function(err, _keys){
          if(err){ return callback(err); }
          keys = keys.concat(_keys);
          api.resque.queue.connection.redis.keys(api.resque.queue.connection.key('workerslock:*'), function(err, _keys){
            if(err){ return callback(err); }
            keys = keys.concat(_keys);

            if(keys.length === 0){ return callback(null, data); }

            api.resque.queue.connection.redis.mget(keys, function(err, values){
              if(err){return callback(err); }
              for (var i = 0; i < keys.length; i++){
                var k = keys[i];
                k = k.replace(api.resque.queue.connection.key(''), '');
                data[k] = values[i];
              }
              callback(null, data);
            });

          });
        });
      };

      api.tasks.delLock = function(key, callback){
        api.resque.queue.connection.redis.del(api.resque.queue.connection.key(key), callback);
      };

      api.tasks.delQueue = function(q, callback){
        api.resque.queue.connection.redis.del(api.resque.queue.connection.key('queue', q), function(err){
          if(err) return callback(err);
          api.resque.queue.connection.redis.srem(api.resque.queue.connection.key('queues'), q, callback);
        });
      };
    }

    next();
  }
};
