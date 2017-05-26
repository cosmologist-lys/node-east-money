var express = require('express');
var router = express.Router();
let pro = require('../utils/promiseHelper');
const kfg = require('../kfg.js');

const httpHelper = require('../utils/httpHelper');
/*var mongoose = require('mongoose');
var Buck = require('../models/Bucks').Demo;
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/east-money');*/
const cheerio = require('cheerio');


router.use((req,res,next) =>{
	let url = req.url;
	next();
});

router.get('/', function(req, res, next) {
	pro.getPromise(kfg.url).then((ctx)=>{
		let result = pro.getInfo(ctx);
		//result = pro.getDetail(result);
		//console.log(result.update+' '+result.count+' '+result.pages);
		let models = pro.getModel(result);
		res.render('index',{title:'Crawler',ctx:models})
	});
});

module.exports = router;
