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
        { path: '/ah-resque-ui/packageDetails',       action: 'ah-resque-ui:packageDetails'       },
        { path: '/ah-resque-ui/resqueDetails',        action: 'ah-resque-ui:resqueDetails'        },
        { path: '/ah-resque-ui/resqueFailedCount',    action: 'ah-resque-ui:resqueFailedCount'    },
        { path: '/ah-resque-ui/resqueFailed',         action: 'ah-resque-ui:resqueFailed'         },
      ],

      post: [
        { path: '/ah-resque-ui/removeFailed',            action: 'ah-resque-ui:removeFailed'            },
        { path: '/ah-resque-ui/retryAndRemoveFailed',    action: 'ah-resque-ui:retryAndRemoveFailed'    },
        { path: '/ah-resque-ui/removeAllFailed',         action: 'ah-resque-ui:removeAllFailed'         },
        { path: '/ah-resque-ui/retryAndRemoveAllFailed', action: 'ah-resque-ui:retryAndRemoveAllFailed' },
      ]
    }
  }
};
```

## Authentication Via Middleware
TODO:
