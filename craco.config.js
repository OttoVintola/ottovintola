const path = require('path');
const webpack = require('webpack'); // Import webpack

module.exports = {
  webpack: {
    configure: (webpackConfig, { env, paths }) => { // Added { env, paths } for context if needed later
      // --- Buffer Polyfill Configuration --- 
      // Ensure plugins array exists
      webpackConfig.plugins = webpackConfig.plugins || [];
      // Add the ProvidePlugin for Buffer
      webpackConfig.plugins.push(
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
        })
      );

      // Ensure resolve.fallback object exists
      webpackConfig.resolve.fallback = webpackConfig.resolve.fallback || {};
      // Add fallback for buffer
      webpackConfig.resolve.fallback.buffer = require.resolve("buffer/");
      // --- End Buffer Polyfill Configuration ---

      // --- Markdown Loader Configuration ---
      // Add a rule for .md files using asset/source
      // This adds the rule without modifying the existing rules array directly
      webpackConfig.module.rules.push({
        test: /\.md$/,
        type: 'asset/source',
      });
      // --- CSL Loader Configuration ---
      // Import citation style files (e.g. .csl) as raw text
      webpackConfig.module.rules.push({
        test: /\.csl$/,
        type: 'asset/source',
      });
      // --- End Markdown Loader Configuration ---

      // Ensure the modified config is returned
      return webpackConfig;
    },
  },
};