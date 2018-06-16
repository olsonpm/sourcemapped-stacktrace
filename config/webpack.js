//---------//
// Imports //
//---------//

import babelConfig from './babel'
import FriendlyErrorsPlugin from 'friendly-errors-webpack-plugin'
import path from 'path'
import webpack from 'webpack'

//
//------//
// Init //
//------//

const projectRootDir = path.resolve(__dirname, '..')

//
//------//
// Main //
//------//

export default {
  mode: 'development',
  entry: path.resolve(__dirname, '../sourcemapped-stacktrace.js'),
  target: 'node',
  devtool: 'source-map',
  output: {
    libraryTarget: 'commonjs2',
    libraryExport: 'default',
    filename: 'index.js',
    path: path.resolve(projectRootDir, 'dist'),
  },
  plugins: [
    new FriendlyErrorsPlugin(),
    new webpack.optimize.ModuleConcatenationPlugin(),
  ],
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
