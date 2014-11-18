var db = require('../config').db;
var _ = require('underscore');
var util = require('../util');
db.bind('user');

exports.saveUser = function(userObj, callback) {
	this.checkUserByName(userObj.name, function(err, rst) {
		if (err) {
			callback(err, rst);
		} else {
			if (!rst) {
				db.user.save({
					name: userObj.name,
					password: userObj.pwd,
					role: (userObj.group || config.role.USER),
					access: userObj.access || [],
					client_access: userObj.clientAccess || [],
					source: 'website'
				}, function(err, user){
					equipDao.getClients(function(err, clients){
						if (err) {
							callback(err, user);
						} else {
							user.client_access_name = _generateClientAccessName(user.client_access, clients);
							callback(err, user);
						}
					});
				});
			} else {
				rst.exsited = true;
				callback(err, rst);
			}
		}
	});
};

exports.checkUserByName = function(name, callback) {
	db.user.findOne({
		name: name
	}, callback);
};