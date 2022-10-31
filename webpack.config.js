import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const config = {
  devtool: "source-map",
  node: false,
  mode: process.env.NODE_ENV || "development",
  entry: {
    background: "./background_scripts/background.js",
    popup: "./popup/popup.js",
    options: "./options/options.js"
  },
  output: {
    path: path.resolve(__dirname, "build"),
    filename: "[name]/index.js"
  }
};

export default config;
