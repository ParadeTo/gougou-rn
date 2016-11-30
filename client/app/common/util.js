'use strict'

exports.thumb = function(key) {
  if (key.indexOf('http') > -1) {
    return key
  }
  return config.qiniu.url + key
}
