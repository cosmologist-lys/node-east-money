var express = require('express');
var router = express.Router();
let pro = require('../utils/promiseHelper');
const kfg = require('../kfg.js');
const mu = require('../utils/musicUtil');

router.use((req,res,next) =>{
	let url = req.url;
	return next();
});

router.get('/',function (req, res) {
	const info_sel = kfg.douban_getSinger_Album,
	    rating_sel = kfg.douban_getRating,
	        pl_sel = kfg.douban_getPl,
		douban_url = kfg.doubanMusicTop250Url;
	console.time('总耗时：');
	let allMsc = [],
	    m1,m2,m3;
	for(let i = 0;i<10;i++){
		let page = '?start='+(i*25);
		let url = douban_url+page;
		pro.getCrawler(url)
			.then(($)=>{
				pro.getSinger_Album($,info_sel)
					.then((msc)=>{
						m1 = msc;
					});
				pro.getRating_or_Pl($,pl_sel)
					.then((msc)=>{
						m2 = msc;
					});
				pro.getRating_or_Pl($,rating_sel)
					.then((msc)=>{
						m3 = msc;
					});
			}).then(()=>{
			if (m1!=undefined && m2!=undefined && m3!=undefined){
				let musicBox = mu.packMusic_onePage(m1,m2,m3);
				allMsc.push(musicBox);
				if (allMsc.length == 10){
					let box = mu.packMusic_allPage(allMsc);
					box = mu.bubbleSort(box);
					console.timeEnd('总耗时：');
					res.render('music',{title:'Music Top 250',music:box})
				}
			}
		})
	}
});

module.exports = router;