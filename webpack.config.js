const path = require("path");

module.exports = {
  devtool: "source-map",
  node: false,
  mode: process.env.NODE_ENV || "development",
  entry: {
    background: "./background_scripts/background.js",
    popup: "./popup/popup.js"
  },
  output: {
    path: path.resolve(__dirname, "build"),
    filename: "[name]/index.js"
  }
};
