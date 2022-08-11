module.exports = {
  presets: [
    "@babel/preset-env",
    "@babel/preset-typescript",
    "@babel/preset-react",
  ],
  plugins: [
    "babel-plugin-styled-components",
    "@babel/plugin-proposal-class-properties",
    [
      "import",
      {
        libraryName: "antd",
        libraryDirectory: "lib",
        css: true,
      },
    ],
  ],
};
