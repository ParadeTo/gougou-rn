'use strict'

var fs = require('fs')
var path = require('path')
var mongoose = require('mongoose')
var koa = require('koa')
var logger = require('koa-logger')
var session = require('koa-session')
var bodyParser = require('koa-bodyparser')

// mongodb 设置了、连接及model引入
var db = 'mongodb://localhost/rn-app'
mongoose.Promise = require('bluebird')
mongoose.connect(db)
var models_path = path.join(__dirname,'/app/models')
var walk = function(modelPath) {
	fs
		.readdirSync(modelPath)
		.forEach(function(file) {
			var filePath = path.join(modelPath,'/' + file)
			var stat = fs.statSync(filePath)
			if (stat.isFile()) {
				if (/(.*)\.(js|coffee)/.test(file)) {
					require(filePath)
				}
			}
			else if (stat.isDirectory()) {
				walk(filePath)
			}
		})
}
walk(models_path)

// 应用配置、启动
var app = koa()

app.keys = ['rn']
app.use(logger())
app.use(session(app))
app.use(bodyParser())

var router = require('./config/routes')()

app
	.use(router.routes())
	.use(router.allowedMethods())

app.listen(1234)
console.log('listen on 1234')
