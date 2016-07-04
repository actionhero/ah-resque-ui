# AH-RESQUE-UI
A resque administration website for actionhero

## Setup

- `npm install --save ah-resque-ui`
- `npm run actionhero -- link --name ah-resque-ui`
- set up the required routes in your project

```js
exports.default = {
  routes: function(api){
    return {
      get: [
        { path: '/resque/packageDetails',       action: 'resque:packageDetails'    },
        { path: '/resque/resqueDetails',        action: 'resque:resqueDetails'     },
        { path: '/resque/loadWorkerQueues',     action: 'resque:loadWorkerQueues'  },
        { path: '/resque/resqueFailedCount',    action: 'resque:resqueFailedCount' },
        { path: '/resque/resqueFailed',         action: 'resque:resqueFailed'      },
        { path: '/resque/delayedjobs',          action: 'resque:delayedjobs'       },
      ],

      post: [
        { path: '/resque/removeFailed',            action: 'resque:removeFailed'            },
        { path: '/resque/retryAndRemoveFailed',    action: 'resque:retryAndRemoveFailed'    },
        { path: '/resque/removeAllFailed',         action: 'resque:removeAllFailed'         },
        { path: '/resque/retryAndRemoveAllFailed', action: 'resque:retryAndRemoveAllFailed' },
        { path: '/resque/forceCleanWorker',        action: 'resque:forceCleanWorker'        },
        { path: '/resque/delDelayed',              action: 'resque:delDelayed'              },
        { path: '/resque/runDelayed',              action: 'resque:runDelayed'              },
      ]
    }
  }
};
```

## Authentication Via Middleware
TODO:
