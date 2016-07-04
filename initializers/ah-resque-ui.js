module.exports = {
  load: 99999999,
  initialize: function (api, next) {

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

    next();
  }
};
