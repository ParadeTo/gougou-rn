'use strict'

var mongoose = require('mongoose')

var UserSchema = new mongoose.Schema({
	phoneNumber: {
		unique:true,
		type:String
	},
	areaCode: String,
	verifyCode: String, // 验证码
	verified: { // 是否验证
		type: Boolean,
		default: false
	},
	accessToken: String,
	nickname: String,
	gender: String,
	breed: String, // 品种
	age: String,
	avatar: String,
	meta: {
		createAt: {
			type: Date,
			default: Date.now()
		},
		updateAt: {
			type: Date,
			default: Date.now()
		}
	}
})

// 存储前的处理
UserSchema.pre('save', function(next) {

	if (this.isNew) {
		this.meta.createAt = this.meta.updateAt = Date.now()
	}
	else {
		this.meta.updateAt = Date.now()
	}

	next()
})

module.exports = mongoose.model('User',UserSchema)