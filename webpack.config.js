const glob = require('glob');
const ExtendScriptPlugin = require('./webpack-extend-script/webpack-extend-script');

const entries = {};
const tsFiles = glob.sync("./root/**/*.ts");
for (const ts of tsFiles) {
    entries[ts.slice(0, -3)] = ts;
}
console.log(tsFiles);

module.exports =
{
    mode: "development",
    entry: entries,
    output: {
        path: __dirname,
        filename: "[name].js"
    },
    resolve: {
        extensions: [".ts"]
    },
    devtool: false,
    target: ['web', 'es3'],
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: "ts-loader",
                exclude: /(node_modules)/
            }
        ],
    },
    plugins: [
        new ExtendScriptPlugin()
    ]
};
