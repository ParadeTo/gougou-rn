'use strict'

var mongoose = require('mongoose')
var robot = require('../service/robot')
var config = require('../../config/config')
var Video = mongoose.model('Video')

// 视频先在客户端上传到七牛，然后同步到服务器，服务器中会同步到cloudinary
exports.video = function *(next) {
  var body = this.request.body
  var videoData = body.video
  var user = this.session.user

  if (!videoData || !videoData.key) {
    this.body = {
      success: false,
      err: '视频没有上传成功'
    }
    return next
  }

  var video = yield Video.findOne({
    qiniu_key: videoData.key
  })
  .exec()

  if (!video) {
    video = new Video({
      author: user._id,
      qiniu_key: videoData.key,
      persistentId: videoData.persistentId
    })
    video = yield video.save()
  }

  // 七牛视频同步到cloudinary
  var url = config.qiniu.video + video.qiniu_key
  console.log(url)
  robot.uploadToCloudinary(url)
    .then(function(data) {
      if (data && data.public_id) {
        video.public_id = data.public_id
        video.detail = data
        video.save()
      }
    })

  this.body = {
    success: true,
    data: video._id
  }
}
