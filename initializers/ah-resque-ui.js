const {Initializer, api} = require('actionhero')

module.exports = class AHResqueUI extends Initializer {
  constructor () {
    super()
    this.name = 'ah-resque-ui'
    this.loadPriority = 99999999
  }

  async initialize () {
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

    const middleware = {
      'ah-resque-ui-proxy-middleware': {
        name: 'ah-resque-ui-proxy-middleware',
        global: false,
        preProcessor: () => { },
        postProcessor: () => { }
      }
    }

    if (api.config['ah-resque-ui'].middleware && api.config['ah-resque-ui'].middleware.length > 0) {
      middleware['ah-resque-ui-proxy-middleware'].preProcessor = async (data) => {
        for (let i in api.config['ah-resque-ui'].middleware) {
          let middleware = api.config['ah-resque-ui'].middleware[i]
          if (typeof middleware.preProcessor === 'function') {
            await middleware.preProcessor(data)
          }
        }
      }

      middleware['ah-resque-ui-proxy-middleware'].postProcessor = async (data) => {
        for (let i in api.config['ah-resque-ui'].middleware) {
          let middleware = api.config['ah-resque-ui'].middleware[i]
          if (typeof middleware.postProcessor === 'function') {
            await middleware.postProcessor(data)
          }
        }
      }
    }

    api.actions.addMiddleware(middleware['ah-resque-ui-proxy-middleware'])
  }
}
