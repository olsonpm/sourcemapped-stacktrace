//---------//
// Imports //
//---------//

import FriendlyErrorsPlugin from 'friendly-errors-webpack-plugin'
import nodeExternals from 'webpack-node-externals'
import path from 'path'
import webpack from 'webpack'

//
//------//
// Init //
//------//

const projectRootDirectory = path.resolve(__dirname)

//
//------//
// Main //
//------//

export default {
  mode: 'development',
  entry: path.resolve(projectRootDirectory, 'lib/index.js'),
  target: 'node',
  externals: [nodeExternals()],
  devtool: 'source-map',
  output: {
    libraryTarget: 'commonjs2',
    libraryExport: 'default',
    filename: 'index.js',
    path: path.resolve(projectRootDirectory, 'dist'),
  },
  plugins: [
    new FriendlyErrorsPlugin(),
    new webpack.optimize.ModuleConcatenationPlugin(),
  ],
}
