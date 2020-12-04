const path = require('path');

module.exports = {
    entry: ['./public/src/ts/main.ts','./public/src/css/site.scss'],
    devtool: 'source-map',
    output: {
        filename: 'js/taiko-web.js',
        path: path.resolve(__dirname, 'public/src/')
    },
    module: {
        rules: [
          { test: /\.tsx?$/i, use: 'ts-loader', exclude: /node_modules/ },
          { test: /\.s[ac]ss$/i, use: [
            {
              loader: 'file-loader',
              options: {
                name: 'css/[name].css'
              }
            },
            {
                          loader: 'extract-loader'
                      },
                      {
                          loader: 'css-loader?-url'
                      },
            {
              loader: 'sass-loader',
              options: {
                implementation: require('sass'),
                sourceMap: true
              }
            }
          ]}
        ],
      },
      resolve: {
        extensions: [ '.tsx', '.ts', '.js' ],
      },
      optimization: {
        minimize: false
      },
      plugins: []
}