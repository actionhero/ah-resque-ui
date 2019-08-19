exports['default'] = {
  plugins: (api) => {
    return {
      'ah-resque-ui': { path: __dirname + '/../node_modules/ah-resque-ui' }
    }
  }
}
