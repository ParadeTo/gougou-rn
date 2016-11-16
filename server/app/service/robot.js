'use strict'

var qiniu = require('qiniu')
var sha1 = require('sha1')
var config = require('../../config/config')

qiniu.conf.ACCESS_KEY = config.qiniu.AK
qiniu.conf.SECRET_KEY =  config.qiniu.SK

//要上传的空间
bucket = 'gougouavatar';

//构建上传策略函数
function uptoken(bucket, key) {
  var putPolicy = new qiniu.rs.PutPolicy(bucket + ":" + key);
  // 文件上传后，齐牛会将下面的数据post到下面的地址
  // putPolicy.callbackUrl = 'http://your.domain.com/callback';
  // putPolicy.callbackBody = 'filename=$(fname)&filesize=$(fsize)';
  return putPolicy.token();
}

exports.getQiniuToken = function(key) {
	return uptoken(bucket,key)
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
