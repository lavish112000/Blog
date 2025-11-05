const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: {
    main: "./src/js/main.js",
    blog: "./src/js/blog.js",
    components: "./src/js/components.js",
    "contact-page": "./src/js/contact-page.js",
  },
  output: {
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "dist"),
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(png|jpg|gif|svg|woff|woff2|eot|ttf)$/,
        type: "asset/resource",
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./src/index.html",
      filename: "index.html",
      chunks: ["main", "blog", "components"],
    }),
    new HtmlWebpackPlugin({
      template: "./src/pages/contact.html",
      filename: "pages/contact.html",
      chunks: ["contact-page"],
    }),
    new HtmlWebpackPlugin({
      template: "./src/pages/about.html",
      filename: "pages/about.html",
      chunks: [],
    }),
    new HtmlWebpackPlugin({
      template: "./src/pages/blog.html",
      filename: "pages/blog.html",
      chunks: ["blog"],
    }),
    new HtmlWebpackPlugin({
      template: "./src/pages/business.html",
      filename: "pages/business.html",
      chunks: [],
    }),
    new HtmlWebpackPlugin({
      template: "./src/pages/design.html",
      filename: "pages/design.html",
      chunks: [],
    }),
    new HtmlWebpackPlugin({
      template: "./src/pages/lifestyle.html",
      filename: "pages/lifestyle.html",
      chunks: [],
    }),
    new HtmlWebpackPlugin({
      template: "./src/pages/technology.html",
      filename: "pages/technology.html",
      chunks: [],
    }),
    new CopyPlugin({
      patterns: [
        { from: "src/css", to: "css" },
        { from: "src/assets", to: "assets" },
        { from: "src/components", to: "components" },
        { from: "src/data", to: "data" },
        { from: "src/manifest.json", to: "manifest.json" },
        { from: "src/sw.js", to: "sw.js" },
      ],
    }),
  ],
  devtool: "source-map",
  devServer: {
    static: "./dist",
    hot: true,
  },
  optimization: {
    splitChunks: {
      chunks: "all",
    },
  },
};
