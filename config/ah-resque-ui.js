exports.default = {
  'ah-resque-ui': (api) => {
    return {
      // the name of the middleware(s) which will protect all actions in this plugin
      // ie middleware: ['logged-in-session', 'role-admin']
      middleware: null
    }
  }
}
