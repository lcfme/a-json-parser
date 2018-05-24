var path = require('path');
module.exports = {
    entry: {
        index: path.resolve(__dirname, './index'),
    },
    output: {
        path: path.resolve(__dirname),
        filename: 'jsondecode.min.js',
        libraryTarget: 'umd',
        library: 'JSONParse',
    }
};