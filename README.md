# AH-RESQUE-UI
A resque administration website for actionhero

[![Build Status](https://travis-ci.org/evantahler/ah-resque-ui.svg?branch=master)](https://travis-ci.org/evantahler/ah-resque-ui)
[![NPM Version](https://img.shields.io/npm/v/ah-resque-ui.svg?style=flat-square)](https://www.npmjs.com/package/ah-resque-ui)

![https://raw.githubusercontent.com/evantahler/ah-resque-ui/master/images/overview.png](https://raw.githubusercontent.com/evantahler/ah-resque-ui/master/images/overview.png)
![https://raw.githubusercontent.com/evantahler/ah-resque-ui/master/images/workers.png](https://raw.githubusercontent.com/evantahler/ah-resque-ui/master/images/workers.png)
![https://raw.githubusercontent.com/evantahler/ah-resque-ui/master/images/failed.png](https://raw.githubusercontent.com/evantahler/ah-resque-ui/master/images/failed.png)
![https://raw.githubusercontent.com/evantahler/ah-resque-ui/master/images/delayed.png](https://raw.githubusercontent.com/evantahler/ah-resque-ui/master/images/delayed.png)

## Setup for ActionHero 13.X+

- `npm install --save ah-resque-ui`
- `npm run actionhero -- link --name ah-resque-ui`
- visit `http://localhost:8080/resque`

## Setup for ActionHero 12.X

- `npm install --save ah-resque-ui`
- insert `ah-resque-ui` in your plugins.js to include the application
- visit `http://localhost:8080/resque`

ActionHero version 12 or higher is required.

## Routes

This plugin will inject routes into your application.  The routes are equivalent to:

```js

get: [
  { path: '/resque/packageDetails',       action: 'resque:packageDetails'    },
  { path: '/resque/resqueDetails',        action: 'resque:resqueDetails'     },
  { path: '/resque/queued',               action: 'resque:queued'            },
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
  { path: '/resque/delQueue',                action: 'resque:delQueue'                },
  { path: '/resque/delDelayed',              action: 'resque:delDelayed'              },
  { path: '/resque/runDelayed',              action: 'resque:runDelayed'              },
]

};
```

## Authentication Via Middleware
This package exposes some potentially dangerous actions which would allow folks to see user data (if you keep such in your task params), and modify your task queues.  To protect these actions, you should configure this package to use [action middleware](http://www.actionherojs.com/docs/#action-middleware) which would restrict these actions to only certain clients.

An example middleware would be one which requires a valid user to be logged in:

```js
// from initializers/session

module.exports = {
  initialize: function (api, next) {

    var redis = api.redis.clients.client;

    api.session = {
      prefix: 'session:',
      ttl: 60 * 60 * 24, // 1 day

      load: function(connection, callback){
        var key = api.session.prefix + connection.fingerprint;

        redis.get(key, function(error, data){
          if(error){     return callback(error);       }
          else if(data){ return callback(null, JSON.parse(data));  }
          else{          return callback(null, false); }
        });
      },

      create: function(connection, user, callback){
        var key = api.session.prefix + connection.fingerprint;

        var sessionData = {
          userId:          user.id,
          status:          user.status,
          sesionCreatedAt: new Date().getTime()
        };

        redis.set(key, JSON.stringify(sessionData), function(error, data){
          if(error){ return callback(error); }
          redis.expire(key, api.session.ttl, function(error){
            callback(error, sessionData);
          });
        });
      },

      middleware: {
        // These actions are restricted to the website (and you need a CSRF token)
        'logged-in-session': {
          name: 'logged-in-session',
          global: false,
          priority: 1000,
          preProcessor: function(data, callback){
            api.session.load(data.connection, function(error, sessionData){
              if(error){ return callback(error); }
              else if(!sessionData){
                return callback(new Error('Please log in to continue'));
              }else{
                data.session = sessionData;
                var key = api.session.prefix + data.connection.fingerprint;
                redis.expire(key, api.session.ttl, callback);
              }
            });
          }
        }

      }
    };

    api.actions.addMiddleware(api.session.middleware['logged-in-session']);

    next();
  }
};
```

Now you can apply the `logged-in-session` middleware to your actions to protect them.  

To inform ah-resque-ui to use a middleware determined elsewhere like this, set `api.config.ah-resque-ui.middleware = 'logged-in-session'` in the provided configuration file.

## React

This project is build using React and contains various components you might want to include into your own project. These components can be loaded from `public-src`, ie: `include WorkersList from '/node-modules/ah-resque-ui/public-src/workers.jsx'`

The main point of configuration will be the React client's `baseRoute` which is where you enter in the API server's URL. Simply set `this.props.baseRoute` on any component which uses the client and it should be passed down.  `window.location.origin` is the default, but that may not be appropriate for all use cases.

The client can be assigned a `notify(errorMessage, severity)` to plug into your error reporters for failed requests.

## Thanks
- [Theme](https://bootswatch.com)
- [HighCharts](http://www.highcharts.com/)
- [React](https://facebook.github.io/react/)
- [Delicious Hat](https://www.delicioushat.com)
- [TaskRabbit](https://www.taskrabbit.com)
- [node-resque](https://github.com/taskrabbit/node-resque)
