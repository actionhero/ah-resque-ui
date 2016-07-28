exports.default = {
  routes: function(api){
    return {
      get: [
        { path: '/resque/packageDetails', action:  'resque:packageDetails' },
        { path: '/resque/resqueDetails', action: 'resque:resqueDetails' }, 
        { path: '/resque/queued', action: 'resque:queued' }, 
        { path: '/resque/loadWorkerQueues', action: 'resque:loadWorkerQueues' }, 
        { path: '/resque/resqueFailedCount', action: 'resque:resqueFailedCount' }, 
        { path: '/resque/resqueFailed', action: 'resque:resqueFailed' }, 
        { path: '/resque/delayedjobs', action: 'resque:delayedjobs' }, 
        { path: '/resque/locks', action: 'resque:locks' }
      ],
      post: [
        { path: '/resque/removeFailed', action: 'resque:removeFailed' },
        { path: '/resque/retryAndRemoveFailed', action: 'resque:retryAndRemoveFailed' },
        { path: '/resque/removeAllFailed', action: 'resque:removeAllFailed' },
        { path: '/resque/retryAndRemoveAllFailed', action: 'resque:retryAndRemoveAllFailed' },
        { path: '/resque/forceCleanWorker', action: 'resque:forceCleanWorker' },
        { path: '/resque/delQueue', action: 'resque:delQueue' },
        { path: '/resque/delDelayed', action: 'resque:delDelayed' },
        { path: '/resque/runDelayed', action: 'resque:runDelayed' },
        { path: '/resque/delLock', action: 'resque:delLock' }
      ]

    }
  }
}
