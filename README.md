# AH-RESQUE-UI
A resque administration website for actionhero

[![Build Status](https://circleci.com/gh/actionhero/ah-resque-ui.png)](https://circleci.com/gh/actionhero/ah-resque-ui.png)
[![NPM Version](https://img.shields.io/npm/v/ah-resque-ui.svg?style=flat-square)](https://www.npmjs.com/package/ah-resque-ui)

![https://raw.githubusercontent.com/evantahler/ah-resque-ui/master/images/overview.png](https://raw.githubusercontent.com/evantahler/ah-resque-ui/master/images/overview.png)
![https://raw.githubusercontent.com/evantahler/ah-resque-ui/master/images/workers.png](https://raw.githubusercontent.com/evantahler/ah-resque-ui/master/images/workers.png)
![https://raw.githubusercontent.com/evantahler/ah-resque-ui/master/images/failed.png](https://raw.githubusercontent.com/evantahler/ah-resque-ui/master/images/failed.png)
![https://raw.githubusercontent.com/evantahler/ah-resque-ui/master/images/delayed.png](https://raw.githubusercontent.com/evantahler/ah-resque-ui/master/images/delayed.png)

## Setup for ActionHero v18+

1. install

```bash
npm install --save ah-resque-ui
```

2. Add this plugin to your `./config/plugins.js`

```js
exports['default'] = {
  plugins: (api) => {
    return {
      'ah-resque-ui': { path: __dirname + '/../node_modules/ah-resque-ui' }
    }
  }
}
```

3. Create a new config file, `./config/ah-resque-ui.js`

```js
exports.default = {
  'ah-resque-ui': (api) => {
    return {
      // the name of the middleware(s) which will protect all actions in this plugin
      // ie middleware: ['logged-in-session', 'role-admin']
      middleware: null
    }
  }
}
```

4. visit `http://localhost:8080/resque`

## Routes

This plugin will inject routes into your application.  The routes are equivalent to:

```js

get: [
  { path: '/resque/packageDetails',       action: 'resque:packageDetails'    },
  { path: '/resque/redisInfo',            action: 'resque:redisInfo'         },
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
**Version 0.3+ of ah-resque-ui only work with ActionHero v18+!**

This package exposes some potentially dangerous actions which would allow folks to see user data (if you keep such in your task params), and modify your task queues.  To protect these actions, you should configure this package to use [action middleware](http://www.actionherojs.com/docs/#action-middleware) which would restrict these actions to only certain clients.

An example middleware would be one which requires a valid user to be logged in:

```js
// from initializers/session
const {api, Initializer} from 'actionhero'

module.exports =  new class SessionInitializer extends Initializer {
  constructor () {
    this.name = 'sessionInitializer'
  }

  initialize () {
    const redis = api.redis.clients.client

    api.session = {
      prefix: 'session:',
      ttl: 60 * 60 * 24, // 1 day

      async load: (connection) => {
        const key = api.session.prefix + connection.fingerprint
        const data = await redis.get(key)
        if (!data) { return false }
        return JSON.parse(data)
      },

      async create (connection, user) => {
        const key = api.session.prefix + connection.fingerprint
        const sessionData = {
          userId:          user.id,
          status:          user.status,
          sesionCreatedAt: new Date().getTime()
        };

        await redis.set(key, JSON.stringify(sessionData))
        await redis.expire(key, api.session.ttl)
      },

      middleware: {
        // These actions are restricted to the website (and you need a CSRF token)
        'logged-in-session': {
          name: 'logged-in-session',
          global: false,
          priority: 1000,
          preProcessor: (data) => {
            const sessionData = await api.session.load(data.connection)
            if (!sessionData) { throw new Error('Please log in to continue') }

            data.session = sessionData
            const key = api.session.prefix + data.connection.fingerprint
            await redis.expire(key, api.session.ttl)
          }
        }
      }
    }

    api.actions.addMiddleware(api.session.middleware['logged-in-session']);
  }
};
```

Now you can apply the `logged-in-session` middleware to your actions to protect them.  

To inform ah-resque-ui to use a middleware determined elsewhere like this, set `api.config.ah-resque-ui.middleware = ['logged-in-session']` in the provided configuration file.

## React

This project is build using React and contains various components you might want to include into your own project. These components can be loaded from `public-src`, ie: `include WorkersList from '/node-modules/ah-resque-ui/public-src/workers.jsx'`

The main point of configuration will be the React client's `baseRoute` which is where you enter in the API server's URL. Simply set `this.props.baseRoute` on any component which uses the client and it should be passed down.  `window.location.origin` is the default, but that may not be appropriate for all use cases.

The client can be assigned a `notify(errorMessage, severity)` to plug into your error reporters for failed requests.

## Testing & Developing
* Create a new ActionHero project
  * (in a new directory)
  * `npm install actionhero`
  * `./node_modules/.bin/actionhero generate`
  * `npm install`
  * Alternativley, you can use the `npm link` workflow https://docs.npmjs.com/cli/link
* Creae a symlink to this project inside of the new ActionHero project's `node_modules` folder
  * `cd node_modules && link -s ../../ah-resque-ui/ .`
* Link the ActionHero plugin in `./config/plugins.js`
* Start this ActionHero server
  * `npm start`
* In another shell, run the webpack to regenerate your changes
  * (in this project)
  * `npm run ui:watch`

## Thanks
- [Theme](https://bootswatch.com)
- [HighCharts](http://www.highcharts.com/)
- [React](https://facebook.github.io/react/)
- [Delicious Hat](https://www.delicioushat.com)
- [TaskRabbit](https://www.taskrabbit.com)
- [node-resque](https://github.com/taskrabbit/node-resque)
