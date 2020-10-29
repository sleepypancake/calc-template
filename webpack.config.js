const fs = require('fs');
const path = require('path');
const HtmlWebPackPlugin = require("html-webpack-plugin");
const globImporter = require('node-sass-glob-importer');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const SpriteLoaderPlugin = require('svg-sprite-loader/plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const autoprefixer = require('autoprefixer');
const ImageminPlugin = require('imagemin-webpack-plugin').default;
const ServiceWorkerWebpackPlugin = require( 'serviceworker-webpack-plugin');
const TerserPlugin = require("terser-webpack-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");


let plugins = [];
let page;
let links = [];

const dataPugLoader = {
  header: require('./src/data/header.json'),
}

fs.readdirSync('./src/').forEach(file => {
  if(String(file).endsWith('.pug')){
    page = new HtmlWebPackPlugin({
      template: `./src/${path.basename(file, '.pug')}.pug`,
      filename: `./${path.basename(file, '.pug')}.html`,
      minify: true,
      hash: true
    });
    links.push({
      link: `./${path.basename(file, '.pug')}.html`,
      title: path.basename(file, '.pug')
    });
    plugins.push(page)
  }
});

plugins.push(
  new HtmlWebPackPlugin({
    template: `./src/list-template/${path.basename('list.pug', '.pug')}.pug`,
    filename: `${path.basename('list.pug', '.pug')}.html`,
    minify: true,
    hash: true,
  })
);
plugins.push(new MiniCssExtractPlugin({
  filename: "[name].css",
  chunkFilename: "[id].css"
}));
plugins.push(new SpriteLoaderPlugin());
plugins.push(new SpriteLoaderPlugin(new CopyWebpackPlugin([
  {from: 'src/public', to: './'}
])));

plugins.push( new ServiceWorkerWebpackPlugin({
  entry: path.join(__dirname, 'src/sw/service-worker.js'),
}),);

const prodConfig = {
  devServer: {
    host: '0.0.0.0',
    port: '8080',
    disableHostCheck: true,
    open: false,
    hot: true,
    openPage: 'list.html'
  },
  module: {
    rules: [
      {
        enforce: "pre",
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "eslint-loader",
        options: {
          cache: true,
          fix: true,
        }
      },
      {
        test: /\.js$/,
        exclude: /node_modules[\/\\](?!(swiper|dom7)[\/\\])/,
        use: [
          'cache-loader',
          'thread-loader',
          {
          loader: "babel-loader",
          options: { 
            presets: ['@babel/preset-env' ],
            cacheDirectory: true,
          }
        }]
      },
      {
        test: /\.pug$/,
        use: [
          {
            loader: "html-loader",
            options: {
              attrs: ['img:src', 'link:href', 'image:xlink:href', ':srcset']
            },
          },
          {
            loader: 'pug-html-loader',
            query: {
              data: {
                linkslist: links,
                ...dataPugLoader,
              },
              pretty: true
            }
          }
        ]
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          'cache-loader',
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
            }
          },
          {
            loader: 'postcss-loader',
            options: {
              plugins: [
                autoprefixer({
                  browsers: ['ie >= 11', 'last 8 version']
                })
              ],
              sourceMap: true
            }
          },
          {
            loader: 'sass-loader',
            options: {
              importer: globImporter()
            }
          }
        ]
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        exclude: [
          path.resolve(__dirname, "./src/assets/icons")
        ],
        use: [
          'cache-loader',
          {
            loader: 'file-loader',
            options: {
              name() {
                return 'assets/images/[name].[ext]';
              },
            }
          }
        ]
      },
      {
        test: /\.(eot|ttf|woff|woff2|)$/,
        use: [
          'cache-loader',
          {
            loader: 'file-loader',
            options: {
              name(file) {
                if (process.env.NODE_ENV === 'development') {
                  return 'assets/fonts/[hash].[ext]';
                }

                return 'assets/fonts/[name].[ext]';
              },
            }
          }
        ]
      },
      {
        test: /\.svg$/,
        exclude: [
          path.resolve(__dirname, "./src/public")
        ],
        use: [
          {loader: 'svg-sprite-loader', options: {symbolId: filePath => path.basename(filePath, '.svg')}},
          'svg-fill-loader',
          'svgo-loader'
        ]
      }
    ]
  },
  resolve: {
    extensions: [ '.js' ]
  },
  plugins: [
    new ImageminPlugin({
      pngquant: {
        quality: '95-100'
      }
    }),
    ...plugins],
  optimization: {
    minimizer: [
      new OptimizeCSSAssetsPlugin(),
      new TerserPlugin({
        test: /\.js(\?.*)?$/i,
        parallel: true,
        terserOptions: {
            output: {
              comments: false,
            },
        },
      }),
    ]
  }
};

const devConfig =  {
  devServer: {
    host: '0.0.0.0',
    port: '8080',
    disableHostCheck: true,
    open: false,
    hot: true,
    openPage: 'list.html'
  },
  module: {
    rules: [
      {
        enforce: "pre",
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "eslint-loader",
        options: {
          cache: true,
          fix: true,
        }
      },
      {
        test: /\.js$/,
        exclude: /node_modules[\/\\](?!(swiper|dom7)[\/\\])/,
        use: [
          'cache-loader',
          'thread-loader',
          {
          loader: "babel-loader",
          options: { 
            presets: ['@babel/preset-env' ],
            cacheDirectory: true,
          }
        }]
      },
      {
        test: /\.pug$/,
        use: [
          {
            loader: "html-loader",
            options: {
              attrs: ['img:src', 'link:href', 'image:xlink:href', ':srcset']
            },
          },
          {
            loader: 'pug-html-loader',
            query: {
              data: {
                linkslist: links,
                ...dataPugLoader,
              },
              pretty: true
            }
          }
        ]
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          'cache-loader',
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
            }
          },
          {
            loader: 'postcss-loader',
            options: {
              plugins: [
                autoprefixer({
                  browsers: ['ie >= 11', 'last 8 version']
                })
              ],
              sourceMap: true
            }
          },
          {
            loader: 'sass-loader',
            options: {
              importer: globImporter()
            }
          }
        ]
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        exclude: [
          path.resolve(__dirname, "./src/assets/icons")
        ],
        use: [
          'cache-loader',
          {
            loader: 'file-loader',
            options: {
              name() {
                return 'assets/images/[name].[ext]';
              },
            }
          }
        ]
      },
      {
        test: /\.(eot|ttf|woff|woff2|)$/,
        use: [
          'cache-loader',
          {
            loader: 'file-loader',
            options: {
              name(file) {
                return 'assets/fonts/[hash].[ext]';
              },
            }
          }
        ]
      },
      {
        test: /\.svg$/,
        exclude: [
          path.resolve(__dirname, "./src/public")
        ],
        use: [
          {loader: 'svg-sprite-loader', options: {symbolId: filePath => path.basename(filePath, '.svg')}},
          'svg-fill-loader',
        ]
      }
    ]
  },
  resolve: {
    extensions: [ '.js' ]
  },
  plugins: [...plugins],
};

module.exports = (env, argv) => {
  if (argv.mode === 'development') {
    process.env.NODE_ENV = 'development';
    return devConfig;
  }

  if (argv.mode === 'production') {
    process.env.NODE_ENV = 'production';
    return prodConfig;
  }
};