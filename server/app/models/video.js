'use strict'

var mongoose = require('mongoose')
var ObjectId = mongoose.Schema.Types.ObjectId
var Mixed = mongoose.Schema.Types.Mixed

var VideoSchema = new mongoose.Schema({
  author: {
    type:ObjectId,
    ref:'User'
  },
  qiniu_key: String,
  persistentId: String,
  qiniu_final_key:String,
  qiniu_detail: Mixed,
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
VideoSchema.pre('save', function(next) {

	if (this.isNew) {
		this.meta.createAt = this.meta.updateAt = Date.now()
	}
	else {
		this.meta.updateAt = Date.now()
	}

	next()
})

module.exports = mongoose.model('Video',VideoSchema)
