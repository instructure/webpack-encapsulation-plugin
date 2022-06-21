const path = require('path')
const EncapsulationPlugin = require('../../')

module.exports = {
  mode: 'development',
  entry: path.resolve(__dirname, './lib/index.js'),
  context: path.resolve(__dirname),
  resolve: {
    modules: [path.resolve(__dirname, 'packages')],
    alias: {
      'me-in-test': path.resolve(__dirname)
    }
  },
  plugins: [
    new EncapsulationPlugin({
      rules: [
        {
          source: 'lib/**',
          target: 'lib/**',
          specifier: 'relative'
        },
        {
          source: 'packages/*/**',
          target: 'packages/*/**',
          boundary: 0,
          specifier: 'relative',
        },
        {
          source: '**',
          target: 'packages/**',
          specifier: 'package'
        }
      ]
    }),
  ]
}