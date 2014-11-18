var userAPI = require('./api/user');

module.exports = function(app) {
	app.post('/api/signup', userAPI.signUp);
};