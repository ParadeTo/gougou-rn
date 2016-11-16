'use strict'

// 短信验证码，没钱买，模拟一个

exports.getCode = function() {
	return 1234; 
}

exports.send = function(phoneNumber,msg) {
	return new Promise(function(resolve,reject) {
		if (!phoneNumber) {
			return reject(new Error('手机号为空了!'))
		}
		resolve({error:0})
	})
}
