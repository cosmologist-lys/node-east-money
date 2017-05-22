var express = require('express');
var router = express.Router();
let pro = require('../utils/promiseHelper');
const kfg = require('../kfg.js');
let Crawler = require('crawler');

const http = require('http');
const urlHelper = require('url');
var iconv = require('iconv-lite');
var BufferHelper = require('bufferhelper');

router.use((req,res,next) =>{
	let url = req.url;
	if (url != '/') res.redirect('/');
	next();
});


function prom(url) {
	return new Promise((resolved,reject)=>{
		http.get(url,(res)=>{
			let buf = new BufferHelper();
			res.on('data',(data)=>{
				buf.concat(data);
			});
			res.on('end',()=>{
				if (undefined!=buf && null!=buf){
					let ctx = iconv.decode(buf.toBuffer(),'GBK');
					resolved(ctx);
				}
			})
		})
	})
}

function crawler(selector,url) {
	return new Promise( (resolved,reject) =>{
		let c = new Crawler({
			maxConnections : 10,
			callback : function (error, res, done) {
				if(error){
					reject(error);
				}else{
					let $ = res.$;
					let ctx = $(selector).text().trim();
					resolved(ctx);
				}
				done();
			}
		});
		c.queue(url);
	})
}

router.get('/', function(req, res, next) {
	let selector = "#dt_1";
	crawler(selector,kfg.url).then((ctx)=>{
		res.render('index', { title: 'Crawler',ctx:ctx});
	})
});

module.exports = router;
