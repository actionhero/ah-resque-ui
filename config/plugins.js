const path = require('path')

exports.default = {
  plugins: (api) => {
    return {
      'ah-resque-ui': { path: path.join(__dirname, '..', 'node_modules', 'ah-resque-ui') }
    }
  }
}
