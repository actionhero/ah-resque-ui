const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: {
    app: path.join(__dirname, 'public-src', 'app.jsx'),
  },
  output: {
    filename: '[name].bundle.js',
    path: path.join(__dirname, 'public', 'resque', 'js')
  },
  // plugins: [
  //   new webpack.DefinePlugin({
  //     'process.env': {
  //       'NODE_ENV': JSON.stringify('production')
  //     }
  //   })
  // ],
  module:{
    loaders: [
      { test: /\.css$/, loader: 'style!css' },
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel',
        query: {
          cacheDirectory: true,
          plugins: ['transform-runtime']
        }
      },
      {
        test: /\.(html|json)$/,
        loader: 'file?name=[name].[ext]',
      }
    ]
  }
};
