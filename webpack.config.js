const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const ServiceWorkerWebpackPlugin = require('serviceworker-webpack-plugin')

module.exports = {
	mode: 'development',
	entry: {
		'index': './src/index.tsx',
	},
	output: {
		path: `${__dirname}/dist`,
		filename: '[name].[fullhash].js',
	},
	resolve: {
		extensions: ['.tsx', '.ts', '.js'],
	},
	devtool: 'inline-source-map',
	devServer: {
		contentBase: './dist',
		hot: true,
	},
	module: {
		rules: [
			{
				test: /\.(j|t)sx?$/i,
				exclude: /node_modules/,
				loader: 'ts-loader',
			},
			{
				test: /\.css$/i,
				use: [
					{ loader: 'css-loader' },
				],
			},
			{
				test: /\.webmanifest$/i,
				use: [
					{
						loader: 'file-loader',
						options: {
							name: '[name].[ext]',
						},
					},
					{
						loader: 'app-manifest-loader',
					},
				],
			},
			{
				test: /\.(png|jpe?g|gif)$/i,
				use: {
					loader: 'file-loader',
					options: {
						name: '[name].[hash].[ext]',
						esModule: false,
					},
				},
			},
		],
	},
	plugins: [
		new CleanWebpackPlugin(),
		new HtmlWebpackPlugin({
			template: './resources/index.html',
			favicon: './resources/icon.png',
		}),
		new ServiceWorkerWebpackPlugin({
			entry: `${__dirname}/src/sw.js`,
		}),
		new webpack.HotModuleReplacementPlugin(),
	],
}
