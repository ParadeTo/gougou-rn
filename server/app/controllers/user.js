'use strict'

var xss = require('xss')
var mongoose = require('mongoose')
var uuid = require('uuid')
var sms = require('../service/sms')
var User = mongoose.model('User')


exports.signup = function *(next) {
	var phoneNumber = xss(this.request.body.phoneNumber.trim())
	// var phoneNumber = this.query.phoneNumber

	// 查询 
	var user = yield User.findOne({
		phoneNumber:phoneNumber
	}).exec()

	// 验证码
	var verifyCode = sms.getCode()

	// 用户对象 
	// 不存在，生成一个
	if (!user) {
		var accessToken = uuid.v4()
		user = new User({
			nickname: '小狗宝',
			avatar: '',
			phoneNumber:xss(phoneNumber),
			verifyCode:verifyCode,
			accessToken:accessToken
		})
	}
	// 存在，更新验证码
	else {
		user.verifyCode = verifyCode
	}
	
	// 保存
	try {
		user = yield user.save()
	} catch (e) {
		this.body = {
			success: false
		}
		return  next
	}

	// 发送验证码到手机，省略
	// var msg = '您的注册验证码是：' + user.verifyCode

	// 返回
	this.body = {
		success: true
	}
}

// 注册验证
exports.verify = function *(next) {
	var verifyCode = this.request.body.verifyCode
	var phoneNumber = this.request.body.phoneNumber

	if (!verifyCode || !phoneNumber) {
		this.body = {
			success: false,
			err:'验证未通过'
		}
		return next
	}

	// 查找用户
	var user = yield User.findOne({
		phoneNumber: phoneNumber,
		verifyCode: verifyCode
	}).exec()

	if (user) {
		user.verified = true
		user = yield user.save()
		this.body = {
			success: true,
			data: {
				nickname: user.nickname,
				accessToken: user.accessToken,
				avatar: user.avatar,
				_id: user._id
			}
		}
	}
	else {
		this.body = {
			success: false,
			err:'验证未通过'
		}
	}
}

// 更新
exports.update = function *(next) {
	var body = this.request.body
	var user = this.session.user

	// 更新属性
	var fields = 'avatar,gender,age,nickname,breed'.split(',')
	fields.forEach(function(field) {
		if (body[field]) {
			user[field] = xss(body[field].trim())
		}
	})

	user = yield user.save()

	this.body = {
		success: true,
		data: {
			nickname: user.nickname,
			accessToken: user.accessToken,
			avatar: user.avatar,
			age: user.age,
			breed: user.breed,
			gender: user.gender,
			_id: user._id
		}
	}
}

