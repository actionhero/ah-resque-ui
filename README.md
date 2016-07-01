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
        { path: '/ah-resque-ui/packageDetails',    action: 'ah-resque-ui:packageDetails'    },
        { path: '/ah-resque-ui/resqueDetails',     action: 'ah-resque-ui:resqueDetails'     },
        { path: '/ah-resque-ui/resqueFailedCount', action: 'ah-resque-ui:resqueFailedCount' },
        { path: '/ah-resque-ui/resqueFailed',      action: 'ah-resque-ui:resqueFailed'      },
      ]
    }
  }
};
```

## Authentication Via Middleware
TODO:
