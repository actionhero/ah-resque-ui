const path = require("path");
require("babel-polyfill");

module.exports = {
  entry: {
    app: ["babel-polyfill", path.join(__dirname, "public-src", "index.jsx")]
  },
  output: {
    filename: "[name].bundle.min.js",
    path: path.join(__dirname, "public", "resque", "js")
  },

  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: { loader: "babel-loader" }
      }
    ]
  },
  resolve: {
    extensions: [".js", ".jsx"]
  }
};
