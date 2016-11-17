'use strict'

var qiniu = require('qiniu')
var sha1 = require('sha1')
var config = require('../../config/config')

qiniu.conf.ACCESS_KEY = config.qiniu.AK
qiniu.conf.SECRET_KEY =  config.qiniu.SK

exports.getQiniuToken = function(body) {
	var type = body.type
	var key = uuid.v4()
	var putPolicy
	// 上传视频
	var options = {
		persistentNotifyUrl: config.notify
	}

	if (type === 'avatar') {
	  // 文件上传后，齐牛会将下面的数据post到下面的地址，从而通知已上传
	  // putPolicy.callbackUrl = 'http://your.domain.com/callback';
	  // putPolicy.callbackBody = 'filename=$(fname)&filesize=$(fsize)';
		key += '.jpeg'
		putPolicy = new qiniu.rs.PutPolicy("gougouavatar:" + key);
	}
	else if (type === 'video') {
		options.scope = 'gougouvideo:' + key
		options.persistentOps = 'avthumb/mp4/an/1'
		putPolicy = new qiniu.rs.PutPolicy(options);
		key += '.mp4'
	}
	else if (type === 'audio') {
		
	}
	var token = putPolicy.token()
	return {
		token: token,
		key: key
	}
}

exports.getCloudinaryToken = function(body) {
	var type = body.type
	var timestamp = body.timestamp
	var folder
	var tags

	if (type === 'avatar') {
		folder = 'avatar'
		tags = 'app,avatar'
	}
	else if (type === 'video') {
		folder = 'video'
		tags = 'app,video'
	}
	else if (type === 'audio') {
		folder = 'audio'
		tags = 'app,audio'
	}

	var signature = 'folder=' + folder + '&tags=' + tags + '&timstamp=' + timestamp + config.cloudinary.api_secret
	signature = sha1(signature)

	return signature
}

//生成上传 Token
