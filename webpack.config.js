'use strict'

var path = require('path')

var webpack = require('webpack')
var HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
  entry: {
    app: './src/main.js',
    vendor: [
      'vue',
      'vue-router'
    ]
  },
  output: {
    path: path.resolve(__dirname, './docs'),
    filename: '[name].js'
  },
  resolve: {
    extensions: ['.js', '.vue'],
    alias: {
      'src': path.resolve(__dirname, './src'),
    }
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: path.resolve(__dirname, './'),
        exclude: /node_modules/
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'index.html',
      inject: true,
      favicon: ''
    })
  ],
}
