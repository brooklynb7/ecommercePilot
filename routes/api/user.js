var _ = require('underscore');
var async = require("async");
var config = require('../../config').config;
var util = require('../../util');
var userDao = require('../../dao/user');

exports.signUp = function(req, res) {
	var username = req.body.username;
	var email = req.body.email;

};