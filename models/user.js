var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
	name: String,
	username: String,
	email: String,
	password: String,
	type: String,
	profile: {
		address: String,
		phone: String,
		approval: String
	}
});

module.exports = mongoose.model('User', UserSchema);