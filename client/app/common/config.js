'use strict'
// true 表示使用阿里的rap接口
var debug = false
module.exports = {
  debug: debug,
  header : {
    method: 'POST',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    }
  },
  api:{
    base:debug?'http://rap.taobao.org/mockjs/8417/':'http://localhost:1234/',
    creations:'api/creations',
    up:'api/up',
    video:'api/creations/video',
    audio:'api/creations/audio',
    comments:'api/comments',
    signup:'api/u/signup',
    verify:'api/u/verify',
    update:'api/u/update',
    signature:'api/signature',
  },
  qiniu:{
    upload:'http://upload.qiniu.com/',
    videoUrl: 'http://ogx55myfx.bkt.clouddn.com/', // 视频存储空间,包括视频缩略图
    avatarUrl: 'http://ofafv8os7.bkt.clouddn.com/' // 头像存储空间
  },
  cloudinary: {
    'cloud_name': 'dis869jhd',
    'api_key': '541635888437885',
    'api_secret': 'g6rM2H_GFBiL1-IRpX82NyD8uc8',
    'base': 'http://res.cloudinary.com/dis869jhd ',
    'image': 'https://api.cloudinary.com/v1_1/dis869jhd/image/upload',
    'video':   'https://api.cloudinary.com/v1_1/dis869jhd/video/upload',
    'audio':   'https://api.cloudinary.com/v1_1/dis869jhd/raw/upload'
  }
}
