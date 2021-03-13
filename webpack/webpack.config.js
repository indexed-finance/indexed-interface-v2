const path = require("path");
const webpack = require("webpack");
const PnpWebpackPlugin = require(`pnp-webpack-plugin`);

module.exports = {
  mode: "development",
  node: {
    global: true,
  },
  target: "node",
  entry: path.resolve(__dirname, "../src/sockets/server"),
  output: {
    path: path.resolve(__dirname, "server"),
    filename: "server.js",
  },
  resolve: {
    modules: [path.resolve(__dirname, "../src"), "node_modules"],
    extensions: [".js", ".json", ".ts", ".tsx", ".d.ts"],
    plugins: [PnpWebpackPlugin],
  },
  resolveLoader: {
    plugins: [PnpWebpackPlugin.moduleLoader(module)],
  },
  plugins: [
    new webpack.ProvidePlugin({
      btoa: path.resolve(__dirname, "./btoa.js"),
      window: path.resolve(__dirname, "./window.js"),
    }),
  ],
  module: {
    rules: [
      {
        test: /\.ts(x?)$/,
        exclude: /node_modules|\.d\.ts$/,
        use: ["babel-loader", "ts-loader"],
      },
      {
        test: /\.d\.ts$/,
        loader: "ignore-loader",
      },
      {
        test: /\.less$/,
        loader: "ignore-loader",
      },
    ],
  },
};
