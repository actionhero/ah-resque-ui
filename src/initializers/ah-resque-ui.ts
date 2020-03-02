import { Initializer, route, config, api, action } from "actionhero";

export class AHResqueUIInitializer extends Initializer {
  constructor() {
    super();
    this.name = "ah-resque-ui";
    this.loadPriority = 99999999;
  }

  async initialize() {
    /* ----- Route Injection ----- */
    route.registerRoute(
      "get",
      "/:apiVersion/resque/redisInfo",
      "resque:redisInfo"
    );
    route.registerRoute(
      "get",
      "/:apiVersion/resque/resqueDetails",
      "resque:resqueDetails"
    );
    route.registerRoute("get", "/:apiVersion/resque/queued", "resque:queued");
    route.registerRoute(
      "get",
      "/:apiVersion/resque/loadWorkerQueues",
      "resque:loadWorkerQueues"
    );
    route.registerRoute(
      "get",
      "/:apiVersion/resque/resqueFailedCount",
      "resque:resqueFailedCount"
    );
    route.registerRoute(
      "get",
      "/:apiVersion/resque/resqueFailed",
      "resque:resqueFailed"
    );
    route.registerRoute(
      "get",
      "/:apiVersion/resque/delayedjobs",
      "resque:delayedjobs"
    );
    route.registerRoute("get", "/:apiVersion/resque/locks", "resque:locks");

    route.registerRoute(
      "post",
      "/:apiVersion/resque/removeFailed",
      "resque:removeFailed"
    );
    route.registerRoute(
      "post",
      "/:apiVersion/resque/retryAndRemoveFailed",
      "resque:retryAndRemoveFailed"
    );
    route.registerRoute(
      "post",
      "/:apiVersion/resque/removeAllFailed",
      "resque:removeAllFailed"
    );
    route.registerRoute(
      "post",
      "/:apiVersion/resque/retryAndRemoveAllFailed",
      "resque:retryAndRemoveAllFailed"
    );
    route.registerRoute(
      "post",
      "/:apiVersion/resque/forceCleanWorker",
      "resque:forceCleanWorker"
    );
    route.registerRoute(
      "post",
      "/:apiVersion/resque/delQueue",
      "resque:delQueue"
    );
    route.registerRoute(
      "post",
      "/:apiVersion/resque/delDelayed",
      "resque:delDelayed"
    );
    route.registerRoute(
      "post",
      "/:apiVersion/resque/runDelayed",
      "resque:runDelayed"
    );
    route.registerRoute(
      "post",
      "/:apiVersion/resque/delLock",
      "resque:delLock"
    );

    /* ----- Proxy Middleware ----- */

    const middleware = {
      name: "ah-resque-ui-proxy-middleware",
      global: false,
      preProcessor: async data => {},
      postProcessor: async data => {}
    };

    if (
      config["ah-resque-ui"].middleware &&
      config["ah-resque-ui"].middleware.length > 0
    ) {
      middleware.preProcessor = async data => {
        for (const i in config["ah-resque-ui"].middleware) {
          const middlewareName = config["ah-resque-ui"].middleware[i];
          const middleware = api.actions.middleware[middlewareName];
          if (typeof middleware.preProcessor === "function") {
            await middleware.preProcessor(data);
          }
        }
      };

      middleware.postProcessor = async data => {
        for (const i in config["ah-resque-ui"].middleware) {
          const middlewareName = config["ah-resque-ui"].middleware[i];
          const middleware = api.actions.middleware[middlewareName];
          if (typeof middleware.postProcessor === "function") {
            await middleware.postProcessor(data);
          }
        }
      };
    }

    action.addMiddleware(middleware);
  }
}
