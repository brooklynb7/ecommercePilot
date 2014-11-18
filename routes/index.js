var userAPI = require('./api/user');

module.exports = function(router) {
	router.use(function(req, res, next) {
		next();
	});

	userAPI(router);
};