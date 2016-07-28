module.exports = function(api){
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
};
