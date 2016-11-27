'use strict'

var mongoose = require('mongoose')
var ObjectId = mongoose.Schema.Types.ObjectId
var Mixed = mongoose.Schema.Types.Mixed

var AudioSchema = new mongoose.Schema({
  author: {
    type: ObjectId,
    ref: 'User'
  },
  video: {
    type: ObjectId,
    ref: 'Video'
  },

  qiniu_video: String, // 合并后的七牛地址
  qiniu_thumb: String, // 合并后封面地址
  public_id: String,
  detail: Mixed,
	meta: {
		createAt: {
			type: Date,
			default: Date.now()
		},
		updateAt: {
			type: Date,
			default: Date.now()
		}
	}
})

// 存储前的处理
AudioSchema.pre('save', function(next) {

	if (this.isNew) {
		this.meta.createAt = this.meta.updateAt = Date.now()
	}
	else {
		this.meta.updateAt = Date.now()
	}

	next()
})

module.exports = mongoose.model('Audio',AudioSchema)
