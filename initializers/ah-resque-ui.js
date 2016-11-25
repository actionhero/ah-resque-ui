var path = require('path')

module.exports = {
  load: 99999999,
  initialize: function (api, next) {
    /* ----- Route Injection ----- */

    api.routes.registerRoute('get', '/resque/packageDetails', 'resque:packageDetails')
    api.routes.registerRoute('get', '/resque/resqueDetails', 'resque:resqueDetails')
    api.routes.registerRoute('get', '/resque/queued', 'resque:queued')
    api.routes.registerRoute('get', '/resque/loadWorkerQueues', 'resque:loadWorkerQueues')
    api.routes.registerRoute('get', '/resque/resqueFailedCount', 'resque:resqueFailedCount')
    api.routes.registerRoute('get', '/resque/resqueFailed', 'resque:resqueFailed')
    api.routes.registerRoute('get', '/resque/delayedjobs', 'resque:delayedjobs')
    api.routes.registerRoute('get', '/resque/locks', 'resque:locks')

    api.routes.registerRoute('post', '/resque/removeFailed', 'resque:removeFailed')
    api.routes.registerRoute('post', '/resque/retryAndRemoveFailed', 'resque:retryAndRemoveFailed')
    api.routes.registerRoute('post', '/resque/removeAllFailed', 'resque:removeAllFailed')
    api.routes.registerRoute('post', '/resque/retryAndRemoveAllFailed', 'resque:retryAndRemoveAllFailed')
    api.routes.registerRoute('post', '/resque/forceCleanWorker', 'resque:forceCleanWorker')
    api.routes.registerRoute('post', '/resque/delQueue', 'resque:delQueue')
    api.routes.registerRoute('post', '/resque/delDelayed', 'resque:delDelayed')
    api.routes.registerRoute('post', '/resque/runDelayed', 'resque:runDelayed')
    api.routes.registerRoute('post', '/resque/delLock', 'resque:delLock')

    /* ----- Proxy Middleware ----- */

    var middleware = {
      'ah-resque-ui-proxy-middleware': {
        name: 'ah-resque-ui-proxy-middleware',
        global: false,
        preProcessor: function (data, callback) {
          return callback()
        }
      }
    }

    if (api.config['ah-resque-ui'].middleware) {
      var sourceMiddleware = api.actions.middleware[api.config['ah-resque-ui'].middleware]
      middleware['ah-resque-ui-proxy-middleware'].preProcessor = sourceMiddleware.preProcessor
      middleware['ah-resque-ui-proxy-middleware'].postProcessor = sourceMiddleware.postProcessor
    }

    api.actions.addMiddleware(middleware['ah-resque-ui-proxy-middleware'])

    var ahVersionSplit = api.actionheroVersion.split('.')
    if (ahVersionSplit.length > 0 && parseInt(ahVersionSplit[0]) <= 12) {
      api.log('[ah-resque-ui] Your ActionHero version (' + api.actionheroVersion + ') does not support all required resque functions. Adding polyfills', 'warning')
      require(path.join(__dirname, '..', 'lib/polyfill.js'))(api)
    }

    next()
  }
}
