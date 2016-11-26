'use strict'

var mongoose = require('mongoose')
var robot = require('../service/robot')
var config = require('../../config/config')
var Video = mongoose.model('Video')
var Audio = mongoose.model('Audio')


exports.audio = function *(next) {
  var body = this.request.body
  var audioData = body.audio
  var videoId = body.videoId
  var user = this.session.user

  if (!audioData || !audioData.public_id) {
    this.body = {
      success: false,
      err: '音频没有上传成功'
    }
    return next
  }

  var audio = yield Audio.findOne({
    public_id: audioData.public_id
  }).exec()

  var video = yield Video.findOne({
    _id: videoId
  }).exec()

  if (!audio) {
    var _audio = {
      author: user._id,
      public_id: audioData.public_id,
      detail: audioData
    }

    if (video) {
      _audio.videoId = video._id
    }

    audio = new Audio(_audio)
    audio = yield audio.save()
  }

  this.body = {
    success: true,
    data: audio._id
  }
}

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
