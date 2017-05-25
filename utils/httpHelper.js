const http = require('http');

  const httpHelper = {
	getHttp : function (url) {
		let ctx;
		http.get(url,(res)=>{
			res.on('data',(data)=>{
				ctx += data;
			});
			res.on('end',()=>{
				console.log(ctx);
			})
		})
	}
 };

module.exports = httpHelper;