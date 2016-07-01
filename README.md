# AH-RESQUE-UI
A resque administration website for actionhero

## Routes

```js
exports.default = {
  routes: function(api){
    return {
      get: [
        { path: '/ah-resque-ui/packageDetails', action: 'ah-resque-ui:packageDetails' },
        { path: '/ah-resque-ui/resqueDetails',  action: 'ah-resque-ui:resqueDetails' },
      ]
    }
  }
};
```
