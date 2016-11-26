'use strict'

var mongoose = require('mongoose')
var robot = require('../service/robot')
var User = mongoose.model('User')

exports.signature = function *(next) {
	var body = this.request.body
	var cloud = body.cloud
	var data

	// 说明是用七牛
	if (cloud === 'qiniu') {
		data = robot.getQiniuToken(body)
	}
	else {
		data = robot.getCloudinaryToken(body)
	}

	this.body = {
		success: true,
		data: data
	}
}

exports.hasBody = function *(next) {
	var body = this.request.body  ||  {}
	if (Object.keys(body).length === 0) {
		this.body = {
			success: false,
			err: '是不是漏了什么'
		}
		return next
	}

	yield next
}

exports.hasToken = function *(next) {
	var accessToken = this.query.accessToken || this.request.body.accessToken

	if (!accessToken) {
		this.body = {
			success: false,
			err: '钥匙丢了'
		}
		return next
	}

	var user = yield User.findOne({
		accessToken: accessToken
	}).exec()

	if (!user) {
		this.body = {
			success: false,
			err: '没登录'
		}
		return next
	}

	this.session = this.session || {}
	this.session.user = user

	yield next
}
