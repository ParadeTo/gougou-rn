'use strict'
var config = require('./config.js')

// 视频缩略图
exports.thumb = function(key) {
  if (key.indexOf('http') > -1) {
    return key
  }
  return config.qiniu.videoUrl + key
}

// 头像
exports.avatar = function(key) {
  if (key.indexOf('http') > -1) {
    return key
  }
  if (key.indexOf('data:image') > -1) {
    return key
  }
  if (key.indexOf('avatar/') > -1) {
    return config.cloudinary.base + '/image/upload/' + key
  }
  return config.qiniu.avatarUrl + key
}

// 视频
exports.video = function(key) {
  if (key.indexOf('http') > -1) {
    return key
  }
  if (key.indexOf('video/') > -1) {
    return config.cloudinary.base + '/video/upload/' + key
  }
  return config.qiniu.videoUrl + key
}
