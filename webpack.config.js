const path = require('path')

module.exports = {
  entry: {
    app: path.join(__dirname, 'public-src', 'app.jsx')
  },
  output: {
    filename: '[name].bundle.min.js',
    path: path.join(__dirname, 'public', 'resque', 'js')
  },

  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: { loader: 'babel-loader' }
      }
    ]
  }
}
