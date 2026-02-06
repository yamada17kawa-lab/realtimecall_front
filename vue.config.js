const { defineConfig } = require('@vue/cli-service')
const config = require('./src/config')

module.exports = defineConfig({
  transpileDependencies: true,
  devServer: {
    proxy: config.baseUrl
  }
})
