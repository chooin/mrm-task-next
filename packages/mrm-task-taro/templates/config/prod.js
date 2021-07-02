import dotenv from 'dotenv'
import path from "path";

const config = dotenv.config({
  path: '.env.prod',
}).parsed
const env = Object.create(null);
Object.keys(config).forEach((key) => {
  if (config[key] === 'true') {
    env[key] = true
  } else if (config[key] === 'false') {
    env[key] = false
  } else {
    env[key] = '"' + config[key] + '"'
  }
});

module.exports = {
  env: Object.assign({
    NODE_ENV: '"production"'
  }, env),
  alias: {
    '@': path.resolve(__dirname, '..', 'src'),
  },
  defineConstants: {},
  mini: {},
  h5: {
    /**
     * 如果h5端编译后体积过大，可以使用webpack-bundle-analyzer插件对打包体积进行分析。
     * 参考代码如下：
     * webpackChain (chain) {
     *   chain.plugin('analyzer')
     *     .use(require('webpack-bundle-analyzer').BundleAnalyzerPlugin, [])
     * }
     */
  }
}
