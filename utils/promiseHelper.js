const http = require('http');
const iconv = require('iconv-lite');
const BufferHelper = require('bufferhelper');
const cheerio = require('cheerio');
//const Bucks = require('../models/Bucks');
let Crawler = require('crawler');


let promiseHelper = {
	getPromise: function (url) {
		return new Promise((resolved, reject) => {
			http.get(url, (res) => {
				let buf = new BufferHelper();
				res.on('data', (data) => {
					buf.concat(data);
				});
				res.on('end', () => {
					if (undefined != buf && null != buf) {
						let ctx = iconv.decode(buf.toBuffer(), 'GBK');
						resolved(ctx);
					}
				})
			})
		})
	},
	getInfo : function (info) {//得到所有信息
		let $ = cheerio.load(info);
		let result =
			$.text().split('rr.firstInit(')[1]
				.split(' .content')[0].trim()
				.split(');')[0];
		let ctx = result
			.toString()
			.split('[')[1]
			.split(']');
		delete result;
		return ctx;
	},
	getDetail : function (info) {//得到页面个数总数日期等信息
		const detailBox = [];
		if (info!= undefined && info!=null && info.length>0){
			let detailStr = info[1];
			//,"pages":"774","update":"2017-05-25","count":"38673"}
			detailStr = detailStr.split('\":"');
			let pages = detailStr[1]
				.split('\","')[0].toString();
			let update = detailStr[2]
				.split('\","')[0].toString();
			let count = detailStr[3]
				.split('\"')[0].toString();
			const detail = {
				'pages':pages,
				'update':update,
				'count':count
			};
			return detail ;
		}else return null;
	},
	getModel: function (info,str) {//得到每个对象
		let onlyInfo = info[0];
		let onlyInfoSplit = onlyInfo.split('\","');
		console.error(onlyInfoSplit)
		let list = [];
		for(let o in onlyInfoSplit){
			let model =[];
			let stock = onlyInfoSplit[o].split(',');
			let len = stock.length;
			if (len == 12){
				model = {
					'no':stock[3],
					'update': stock[1],
					'cat':stock[10],
					'flu':stock[11].replace('\"',''),
					'title':stock[9],
					'rat':stock[7],
					'ratc':stock[0].replace('\"',''),
					'org':stock[4],
					'trend':stock[8]
				};
			}
			list.push(model);
		}
		console.log(onlyInfoSplit.length);
		//let result = $.text().replace(/[ ]+/g,' ');
		return list;
	},

	pack : function (info) {
		if (info == undefined) throw new Error('pack function cannot take undefined params');

	},
	getCrawler : function (selector,url) {
	return new Promise( (resolved,reject) =>{
		let c = new Crawler({
			maxConnections : 10,
			callback : function (error, res, done) {
				if(error){
					reject(error);
				}else{
					//let A = res.$;
					const $ = cheerio.load(res.$.text());
					console.log($.html());
					let ctx = $(selector).html();
					resolved(ctx);
				}
				done();
			}
		});
		c.queue(url);
	})
}
};

module.exports = promiseHelper;