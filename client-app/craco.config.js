const webpack = require("webpack");

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Add polyfills for Node.js modules
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        stream: require.resolve("stream-browserify"),
        http: require.resolve("stream-http"),
        https: require.resolve("https-browserify"),
        zlib: require.resolve("browserify-zlib"),
        url: require.resolve("url"),
        assert: require.resolve("assert"),
        crypto: require.resolve("crypto-browserify"),
        os: require.resolve("os-browserify/browser"),
        path: require.resolve("path-browserify"),
        fs: false,
        net: false,
        tls: false,
        process: require.resolve("process/browser"),
        "process/browser": require.resolve("process/browser"),
      };

      // Add alias for process/browser to handle ESM modules
      webpackConfig.resolve.alias = {
        ...webpackConfig.resolve.alias,
        "process/browser": require.resolve("process/browser"),
        process: require.resolve("process/browser"),
      };

      // Handle ESM module resolution
      webpackConfig.resolve.extensionAlias = {
        ...webpackConfig.resolve.extensionAlias,
        ".js": [".js", ".ts", ".tsx"],
        ".mjs": [".mjs", ".js", ".ts", ".tsx"],
      };

      // Add module rules for ESM handling
      if (!webpackConfig.module) {
        webpackConfig.module = { rules: [] };
      }

      webpackConfig.module.rules.push({
        test: /\.m?js$/,
        resolve: {
          fullySpecified: false,
        },
      });

      // Add global polyfills
      webpackConfig.plugins.push(
        new webpack.ProvidePlugin({
          process: "process/browser",
          Buffer: ["buffer", "Buffer"],
        })
      );

      // Increase memory limit for TypeScript checker
      if (webpackConfig.plugins) {
        const forkTsCheckerIndex = webpackConfig.plugins.findIndex(
          (plugin) => plugin.constructor.name === "ForkTsCheckerWebpackPlugin"
        );
        if (forkTsCheckerIndex !== -1) {
          webpackConfig.plugins[forkTsCheckerIndex].options.memoryLimit = 4096;
        }
      }

      // Suppress source map warnings
      webpackConfig.ignoreWarnings = [
        function ignoreSourcemapsloaderWarnings(warning) {
          return (
            warning.module &&
            warning.module.resource &&
            warning.module.resource.indexOf("node_modules") !== -1 &&
            warning.details &&
            warning.details.indexOf("source-map-loader") !== -1
          );
        },
      ];

      return webpackConfig;
    },
  },
};
