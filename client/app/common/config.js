'use strict'
var debug = false
module.exports = {
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
    comments:'api/comments',
    signup:'api/u/signup',
    verify:'api/u/verify',
    update:'api/u/update',
    signature:'api/signature',
  },
  qiniu:{
    upload:'http://upload.qiniu.com/',
    url: 'http://ofafv8os7.bkt.clouddn.com/'
  },
 CLOUDINARY: {
    'cloud_name': 'dis869jhd',
    'api_key': '541635888437885',
    'api_secret': 'g6rM2H_GFBiL1-IRpX82NyD8uc8',
    'base': 'http://res.cloudinary.com/dis869jhd ',
    'image': 'https://api.cloudinary.com/v1_1/dis869jhd/image/upload',
    'video':   'https://api.cloudinary.com/v1_1/dis869jhd/video/upload',
    'audio':   'https://api.cloudinary.com/v1_1/dis869jhd/raw/upload'
  }
}
