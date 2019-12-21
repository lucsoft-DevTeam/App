const ForkTsCheckerWebpackPlugin = require("fork-ts-checker-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = (env = "development") => ({
    mode: env,
    entry: {
        homesysapp: './src/modules/app/index.ts'
    },

    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: "ts-loader",
                options: {
                    transpileOnly: true
                }
            },
            {
                test: /\.css$/i,
                use: [ 'style-loader', 'css-loader' ],
            }
        ]
    },
    resolve: {
        extensions: [ ".ts", ".js", ".json", ".html" ]
    },
    plugins: [
        new ForkTsCheckerWebpackPlugin({ async: env === "production" }),
        new HtmlWebpackPlugin({
            inject: false,
            hash: true,
            favicon: './res/favicon.ico',
            template: './src/index.html',
            filename: 'index.html'
        }),
    ]
});