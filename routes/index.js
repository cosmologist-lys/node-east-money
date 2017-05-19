var express = require('express');
var router = express.Router();
let pro = require('../utils/promiseHelper');

const http = require('http');
const URL = require('url').parse('http://data.eastmoney.com/report/hyyb.html');
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

router.get('/', function(req, res, next) {
	prom(URL).then((ctx)=>{
		res.render('index', { title: 'Crawler',ctx:ctx});
	});
});

module.exports = router;
