const path = require("path");

module.exports = {
    entry: "./src/modules/app/index.ts",
    mode: "development",
    output: {
        path: path.join(__dirname, "dist3"),
        filename: "[name].bundle.js",
        chunkFilename: "[name].chunk.js"
    },

    resolve: {
        extensions: [ ".js", ".ts" ]
    },

    module: {
        rules: [
            {
                test: /\.ts$/,
                include: path.join(__dirname, "src"),
                loader: "ts-loader"
            },
            {
                test: /\.css$/i,
                use: [ 'style-loader', 'css-loader' ],
            }
        ]
    },

    devServer: {
        contentBase: "./dist"
    }
};