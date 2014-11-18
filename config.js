var config = {
	port: 9010,
	dbConnection: "localhost:27017/poc"
};

/*var mongoskin = require('mongoskin');
var db = mongoskin.db(config.dbConnection);*/

var mongoose = require('mongoose');
mongoose.connect('mongodb://' + config.dbConnection);

exports.config = config;