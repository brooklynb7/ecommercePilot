var crypto = require('crypto');
var _ = require('underscore');
var config = require('../config').config;

Date.prototype.Format = function(fmt) {
	var o = {
		"M+": this.getMonth() + 1,
		"d+": this.getDate(),
		"h+": this.getHours(),
		"m+": this.getMinutes(),
		"s+": this.getSeconds(),
		"q+": Math.floor((this.getMonth() + 3) / 3),
		"S": this.getMilliseconds()
	};
	if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
	for (var k in o)
		if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
	return fmt;
};
Date.prototype.Format1 = function() {
	return this.Format("yyyy-MM-dd hh:mm");
};
Date.prototype.Format2 = function() {
	return this.Format("yyyy-MM-dd hh:mm:ss");
};
Date.prototype.Format3 = function() {
	return this.Format("MM-dd");
};
Date.prototype.Format4 = function() {
	return this.Format("MM-dd hh:mm");
};
Date.prototype.Format5 = function(){
	return this.Format("yyyy-MM-dd");
};
Date.prototype.Format6 = function(){
	return this.Format("yyyy/MM/dd hh:mm");
};

Date.prototype.last5days = function(){
	return this.valueOf() - 60*60*24*5*1000;
};

String.prototype.filterRegString = function(){
	return this.replace(/[^a-zA-Z0-9-_]/g, "");
};

exports.md5 = function(text) {
	return crypto.createHash('md5').update(text).digest('hex');
};

exports.sha1 = function(text) {
	return crypto.createHash('sha1').update(text).digest('hex');
};

exports.random = function(upper, floor){
	var upper = typeof upper == 'number' ? upper : 100;
	var floor = typeof floor == 'number' ? floor : 0;
	return parseInt(Math.random() * (upper - floor + 1) + floor);
};

exports.responseNoResult = function(req, res){
	req.flash('errorMsg', res.__("noSearchResult"));
	res.redirect('/index');
};

exports.sendSysError = function(statueCode, error, response){
	response.statusCode = statueCode;
	response.send(error);
};

exports.handleDaoCallback = exports.handleAsyncCallback = function(err, res, callback) {
	if (err) {
		this.sendSysError(500, err, res);
	} else {
		callback();
	}
};

exports.handleWeixinCallback = function(err, res, callback){
	if(err){
		res.reply("操作失败");
	} else {
		callback();
	}
};

exports.handleWeixinOrderCheck = function(order, res, pass_function){
	if(order){
		pass_function()
	} else {
		res.reply("订单不存在或无此订单权限");
	}
};

exports.handleParameterCheck = function(parameterList, res, pass_function) {
	if (_.every(parameterList)) {
		pass_function();
	} else {
		this.sendSysError(500, 'Miss parameters', res);
	}
};

var FINAL = 6378137.0
/**
* 求某个经纬度的值的角度值
* @param {Object} d
*/
function calcDegree(d) {
	return d * Math.PI / 180.0;
}

/**
 * 根据两点经纬度值，获取两地的实际相差的距离
 * @param {Object} f	第一点的坐标位置[latitude,longitude]
 * @param {Object} t	第二点的坐标位置[latitude,longitude]
 */
exports.calcDistance = function(f, t) {
	var flat = calcDegree(f[0]);
	var flng = calcDegree(f[1]);
	var tlat = calcDegree(t[0]);
	var tlng = calcDegree(t[1]);

	var result = Math.sin(flat) * Math.sin(tlat);
	result += Math.cos(flat) * Math.cos(tlat) * Math.cos(flng - tlng);
	return Math.acos(result) * FINAL;
};

exports.setI18NCookieForWeixin = function(res){
	res.cookie('i18nlocale', 'zh', {path: '/weixin', maxAge: 900000, httpOnly: true });
};

exports.generateBatchId = function(prefix){
	return prefix + "_" + new Date().Format("yyyyMMddhhmmss");
};

exports.getRandomNum = function() {
	var temp = Math.floor(Math.random() * 10000);
	temp = String(temp);

	if (temp.length != 4) {
		var templen = 4 - temp.length;
		for (var i = 0; i < templen; i++) {
			temp += "0";
		}
	}
	return parseInt(temp);
};

exports.checkImgFileType = function(str) {
	var pos = str.lastIndexOf(".");
	var lastname = str.substring(pos, str.length);
	if (lastname.toLowerCase() != ".jpg" && lastname.toLowerCase() != ".gif" && 
		lastname.toLowerCase() != ".png" && lastname.toLowerCase() != ".bmp" && lastname.toLowerCase() != ".jpeg") {
		return false;
	} else {
		return true;
	}
};

exports.checkPassword = function(pwd){
	return pwd.match(/(?=^.{8,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/g);
};

exports.getPhantomOrderRstUrl = function(sysId){
	return "http://localhost:" + config.port + "/phantom/orderRst?_id=" + sysId;
}