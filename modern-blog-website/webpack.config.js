const path = require("path");

module.exports = {
  entry: {
    main: "./src/js/main.js",
    blog: "./src/js/blog.js",
    components: "./src/js/components.js",
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
