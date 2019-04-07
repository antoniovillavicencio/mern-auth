const path = require('path');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');
const CURRENT_WORKING_DIR = process.cwd();

const config = {
  name: "server",
  entry: [path.join(CURRENT_WORKING_DIR, "/server/server.js")],
  target: "node",
  output: {
    path: path.join(CURRENT_WORKING_DIR, "/dist/"),
    filename: "server.generated.js",
    publicPath: "/dist/"
  },
  externals: [nodeExternals()],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ["babel-loader"]
      },
      {
        test: /\.scss$/,
        use: ["style-loader", "css-loader", "sass-loader"]
      },
      {
        test: /\.(ttf|eot|svg|gif|jpg|png)(\?[\s\S]+)?$/,
        use: "file-loader"
      }
    ]
  }
};

module.exports = config;