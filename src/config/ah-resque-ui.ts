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
