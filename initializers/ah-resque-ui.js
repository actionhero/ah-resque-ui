var path = require('path')
var async = require('async')

module.exports = {
  load: 99999999,
  initialize: function (api, next) {
    /* ----- Route Injection ----- */

    api.routes.registerRoute('get', '/resque/packageDetails', 'resque:packageDetails')
    api.routes.registerRoute('get', '/resque/redisInfo', 'resque:redisInfo')
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
        },
        postProcessor: function (data, callback) {
          return callback()
        }
      }
    }

    if (api.config['ah-resque-ui'].middleware) {
      middleware['ah-resque-ui-proxy-middleware'].preProcessor = function (data, callback) {
        var preJobs = []
        api.config['ah-resque-ui'].middleware.forEach(function (middlewareName) {
          if (api.actions.middleware[middlewareName].preProcessor) {
            preJobs.push(function (done) { api.actions.middleware[middlewareName].preProcessor(data, done) })
          }
        })
        async.series(preJobs, callback)
      }

      middleware['ah-resque-ui-proxy-middleware'].postProcessor = function (data, callback) {
        var postJobs = []
        api.config['ah-resque-ui'].middleware.forEach(function (middlewareName) {
          if (api.actions.middleware[middlewareName].postProcessor) {
            postJobs.push(function (done) { api.actions.middleware[middlewareName].postProcessor(data, done) })
          }
        })
        async.series(postJobs, callback)
      }
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
