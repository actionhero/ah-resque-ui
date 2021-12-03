# AH-RESQUE-UI

A resque administration website for actionhero

[![Build Status](https://circleci.com/gh/actionhero/ah-resque-ui.png)](https://circleci.com/gh/actionhero/ah-resque-ui)
[![NPM Version](https://img.shields.io/npm/v/ah-resque-ui.svg?style=flat-square)](https://www.npmjs.com/package/ah-resque-ui)

![https://raw.githubusercontent.com/evantahler/ah-resque-ui/master/images/overview.png](https://raw.githubusercontent.com/evantahler/ah-resque-ui/master/images/overview.png)
![https://raw.githubusercontent.com/evantahler/ah-resque-ui/master/images/workers.png](https://raw.githubusercontent.com/evantahler/ah-resque-ui/master/images/workers.png)
![https://raw.githubusercontent.com/evantahler/ah-resque-ui/master/images/failed.png](https://raw.githubusercontent.com/evantahler/ah-resque-ui/master/images/failed.png)
![https://raw.githubusercontent.com/evantahler/ah-resque-ui/master/images/delayed.png](https://raw.githubusercontent.com/evantahler/ah-resque-ui/master/images/delayed.png)

## Setup for ActionHero v28+

1. install

```bash
npm install --save ah-resque-ui
```

2. Add this plugin to your `./config/plugins.ts`

```ts
export const DEFAULT = {
  plugins: () => {
    return {
      "ah-resque-ui": { path: __dirname + "/../../node_modules/ah-resque-ui" },
    };
  },
};
```

3. Create a new config file, `./src/config/ah-resque-ui.ts`

```ts
const namespace = "ah-resque-ui";

declare module "actionhero" {
  export interface ActionheroConfigInterface {
    [namespace]: ReturnType<typeof DEFAULT[typeof namespace]>;
  }
}

export const DEFAULT = {
  [namespace]: () => {
    return {
      // the name of the middleware(s) which will protect all actions in this plugin
      // ie middleware: ['logged-in-session', 'role-admin']
      middleware: [] as string[],
    };
  },
};
```

4. visit `http://localhost:8080/resque`

## Routes

This plugin will inject routes into your application. The routes are equivalent to:

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
```

## Authentication Via Middleware

This package exposes some potentially dangerous actions which would allow folks to see user data (if you keep such in your task params), and modify your task queues. To protect these actions, you should configure this package to use [action middleware](http://www.actionherojs.com/docs/#action-middleware) which would restrict these actions to only certain clients.

The most basic middleware would be one to enforce a Basic Auth Password:

`npm install basic-auth --save`

```js
// File: src/initializers/basic-auth-middleware.js
import { Initializer, api, action } from "actionhero";
import auth from "basic-auth";

export class BasicAuthInitializer extends Initializer {
  constructor() {
    super();
    this.name = "basic-auth";
  }

  async initialize() {
    const correctPassword = process.env.BASIC_AUTH_PASSWORD;
    const middleware = {
      name: "basic-auth",
      global: false,
      priority: 1000,
      preProcessor: (data) => {
        if (!correctPassword) {
          throw "basic auth password not set up in BASIC_AUTH_PASSWORD env";
        }
        const { res, req } = connection.rawConnection;
        const credentials = auth(req);
        if (!credentials || credentials.pass !== correctPassword) {
          res.statusCode = 401;
          res.setHeader("WWW-Authenticate", 'Basic realm="Admin Access"');
          res.end("Access denied");
          data.toRender = false;
        }
      },
    };

    action.addMiddleware(middleware);
  }
}
```

Now you can apply the `basic-auth` middleware to your actions to protect them.

To inform ah-resque-ui to use a middleware determined elsewhere like this, set `api.config.ah-resque-ui.middleware = ['basic-auth']` in the provided configuration file.

## Testing & Developing

You will need 2 terminals:

- Start the actionhero server
  - `npm run dev`
- In another shell, run the webpack to regenerate your changes
  - `npm run ui:watch`

Now visit `http://localhost:8080/resque` in your browser

## Thanks

- [Theme](https://bootswatch.com)
- [React](https://facebook.github.io/react/)
- [Delicious Hat](https://www.delicioushat.com)
- [TaskRabbit](https://www.taskrabbit.com)
- [node-resque](https://github.com/taskrabbit/node-resque)
- [resque-web](https://github.com/resque/resque-web)
