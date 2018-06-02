'use strict'
var webpack = require('webpack')
var LodashModuleReplacementPlugin = require('lodash-webpack-plugin')
const CompressionPlugin = require('compression-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const path = require('path')

var env = process.env.NODE_ENV

var config = {
    mode: 'production',
    entry: './src/index.js',
    module: {
        rules: [
            { test: /\.jsx$/, loaders: ['babel-loader'], exclude: /node_modules/ },
            { test: /\.js$/, loaders: ['babel-loader'], exclude: /node_modules/ },
        ],
    },
    output: {
        filename: 'index.js',
        path: path.resolve(__dirname, 'lib'),
        library: {
            root: 'MobxRestForm',
            amd: 'mobx-rest-form',
            commonjs: 'mobx-rest-form',
        },
        libraryTarget: 'umd',
    },

    plugins: [
        new LodashModuleReplacementPlugin(),
        new webpack.optimize.ModuleConcatenationPlugin(),
        new UglifyJsPlugin({
            parallel: true,
        }),
        new CompressionPlugin({
            asset: '[path].gz[query]',
            algorithm: 'gzip',
            test: /\.(js|html)$/,
            threshold: 10240,
            minRatio: 0.8,
        }),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(env),
        }),
    ],
}

module.exports = config
