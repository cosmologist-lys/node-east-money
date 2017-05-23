const http = require('http');
const iconv = require('iconv-lite');
const BufferHelper = require('bufferhelper');
const cheerio = require('cheerio');
//const Bucks = require('../models/Bucks');


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
	parseHTML: function (ctx) {
		let $ = cheerio.load(ctx);
		let result = $.text().split('rr.firstInit(')[1];
		result = result.split(' .content')[0].trim();
		result = result.split(');')[0];
		let bigInfo = result.toString();//包含前后的string
		let info = bigInfo.split('[')[1].split(']');
		let onlyInfo = info[0];//仅信息
		let dataInfo = info[1];//数据总数日期页数等
		let onlyInfoSplit = onlyInfo.split('\","');
		for(let o in onlyInfoSplit){
			console.log(onlyInfoSplit[o]);
		}
		console.log(onlyInfoSplit.length);
		//let result = $.text().replace(/[ ]+/g,' ');
		return onlyInfo;
	},

	pack : function (info) {
		if (info == undefined) throw new Error('pack function cannot take undefined params');

	}
};

module.exports = promiseHelper;