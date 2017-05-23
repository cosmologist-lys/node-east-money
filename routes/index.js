var express = require('express');
var router = express.Router();
let pro = require('../utils/promiseHelper');
const kfg = require('../kfg.js');
let Crawler = require('crawler');
const httpHelper = require('../utils/httpHelper');
var mongoose = require('mongoose');
var Buck = require('../models/Bucks').Demo;
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/east-money');


router.use((req,res,next) =>{
	let url = req.url;
	if (url != '/') res.redirect('/');
	next();
});


function crawler(selector,url) {
	return new Promise( (resolved,reject) =>{
		let c = new Crawler({
			maxConnections : 10,
			callback : function (error, res, done) {
				if(error){
					reject(error);
				}else{
					let $ = res.$;
					//let ctx = $(selector).text().trim();
					let ctx = $(selector).children().html();
					resolved(ctx);
				}
				done();
			}
		});
		c.queue(url);
	})
}

router.get('/', function(req, res, next) {
	pro.getPromise(kfg.url).then((ctx)=>{
		const result = pro.parseHTML(ctx);
		res.render('index',{title:'Crawler',ctx:result})
	});

});

module.exports = router;
