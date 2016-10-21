'use strict'

module.exports = {
  header : {
    method: 'POST',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    }
  },
  api:{
    base:'http://rap.taobao.org/mockjs/8417/',
    creations:'api/creations',
    up:'api/up',
    comments:'api/comments',
    signup:'api/u/signup',
    verify:'api/u/verify'
  }
}
