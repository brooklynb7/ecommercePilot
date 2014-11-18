var _ = require('underscore');
var async = require("async");
var util = require('../../util');
var User = require('../../models/user');

// on routes that end in /users
var users = function(router){
	var route = router.route('/users');

	route.post(function(req, res) {		
		var user = new User();
		user.username = req.body.username;
		user.email = req.body.email;
		user.password = req.body.password;
		user.type = req.body.type;
		user.profile = {
			address: "",
			phone: "",
			approval: "C"
		};
		// save the bear and check for errors
		user.save(function(err) {
			if (err) res.send(err);
			req.session.user = user;
			res.json(user);
		});
	});
};


// on routes that end in /users/current
var currentUser = function(router){
	var route = router.route('/users/current');

	route.get(function(req, res) {		
		if(req.session.user){
			res.json(req.session.user);
		} else {
			res.json(null);
		}
	});
};

module.exports = function(router) {
	users(router);
};