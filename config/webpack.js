//---------//
// Imports //
//---------//

const babelConfig = require('./babel'),
  FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin'),
  path = require('path')

//
//------//
// Init //
//------//

const projectRootDir = path.resolve(__dirname, '..')

//
//------//
// Main //
//------//

module.exports = {
  mode: 'development',
  entry: path.resolve(__dirname, '../sourcemapped-stacktrace.js'),
  target: 'node',
  devtool: 'source-map',
  output: {
    libraryTarget: 'commonjs2',
    filename: 'index.js',
    path: path.resolve(projectRootDir, 'dist'),
  },
  plugins: [new FriendlyErrorsPlugin()],
  module: {
    rules: [
      {
        loader: 'babel-loader',
        options: babelConfig,
        test: /.js$/,
      },
    ],
  },
}
