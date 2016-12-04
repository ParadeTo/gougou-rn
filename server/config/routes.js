'use strict'

var Router = require('koa-router');
var User = require('../app/controllers/user.js');
var App = require('../app/controllers/app.js');
var Creation = require('../app/controllers/creation.js');
var Comment = require('../app/controllers/comment.js');

module.exports = function() {
	var router = new Router({
		prefix: '/api'
	});

	// user
	router.post('/u/signup',App.hasBody,User.signup);
	router.post('/u/verify',App.hasBody,User.verify);
	router.post('/u/update',App.hasBody,App.hasToken,User.update);

	// app
	router.post('/signature',App.hasBody,App.signature);

	// creations
	router.get('/creations', App.hasToken,Creation.find);
	router.post('/creations',App.hasBody,App.hasToken,Creation.save);
	router.post('/creations/video',App.hasBody,App.hasToken,Creation.video);
	router.post('/creations/audio',App.hasBody,App.hasToken,Creation.audio);

	// comments
	router.get('/comments', App.hasToken,Comment.find);
	router.post('/comments',App.hasBody,App.hasToken,Comment.save);

	// votes
	router.post('/up', App.hasBody, App.hasToken, Creation.up);
	return router;
}
