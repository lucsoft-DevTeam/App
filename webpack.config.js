const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
module.exports = {
    entry: {
        app: "./src/modules/app/index.ts",
    },
    target: 'electron-renderer',
    mode: "development",

    resolve: {
        extensions: [ ".js", ".ts" ]
    },

    module: {
        rules: [
            {
                test: /\.ts$/,
                loader: "ts-loader"
            },
            {
                test: /\.css$/i,
                use: [ 'style-loader', 'css-loader' ],
            },
            {
                test: /\.(png|jpe?g|gif|svg)$/i,
                use: [
                  {
                    loader: 'file-loader',
                  },
                ],
              }
        ]
    },

    devServer: {
        contentBase: "./dist"
    },
    plugins: [
        new webpack.DefinePlugin({
            isElectron: JSON.stringify(true)
        }),
        new HtmlWebpackPlugin({
            inject: false,
            template: './src/index.html',
            filename: 'index.html',

            minify: { minifyCSS: true, minifyJS: true, removeComments: true }
        }),
    ]
};