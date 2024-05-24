const { defineConfig } = require("@vue/cli-service");
const CopyPlugin = require('copy-webpack-plugin');

module.exports = defineConfig({
  transpileDependencies: true,
  chainWebpack: config => {
    config.plugin('copy')
      .use(CopyPlugin, [
        { 
          patterns: [
            { from: 'public/index.html', to: '404.html' }
          ]
        }
      ]);
  }
});