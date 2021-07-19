const path = require("path");
const { override, fixBabelImports, addLessLoader } = require("customize-cra");
const FilterWarningsPlugin = require("webpack-filter-warnings-plugin");

// filter out warning to prevent CI build failing
const filterWarningsPlugin = (config) => {
  config.plugins.push(
    new FilterWarningsPlugin({
      exclude: /mini-css-extract-plugin/,
    })
  );

  config.module.rules.push({
    test: /\.md$/,
    use: "raw-loader",
  });

  return config;
};

module.exports = override(
  filterWarningsPlugin,
  fixBabelImports("lodash", {
    libraryName: "lodash",
    libraryDirectory: "",
    camel2DashComponentName: false,
  }),
  fixBabelImports("ant-design-pro", {
    libraryName: "ant-design-pro",
    libraryDirectory: "lib",
    style: true,
    camel2DashComponentName: false,
  }),
  addLessLoader({
    lessOptions: {
      javascriptEnabled: true,
    },
  })
);
