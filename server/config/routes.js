'use strict'

var Router = require('koa-router')
var User = require('../app/controllers/user.js')
var App = require('../app/controllers/app.js')
var Creation = require('../app/controllers/creation.js')

module.exports = function() {
	var router = new Router({
		prefix: '/api'
	})

	// user
	router.post('/u/signup',App.hasBody,User.signup)
	router.post('/u/verify',App.hasBody,User.verify)
	router.post('/u/update',App.hasBody,App.hasToken,User.update)

	// app
	router.post('/signature',App.hasBody,App.signature)
	router.post('/creations/video',App.hasBody,App.hasToken,Creation.video)
	router.post('/creations/audio',App.hasBody,App.hasToken,Creation.audio)


	return router;
}
