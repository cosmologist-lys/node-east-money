
const getCipher = {
	getPage : function (page,fmt = 'base64') {
		let ci = 'tp=0&cg=0&dt=4&page='+page;
		const pageCipher = new Buffer(ci, fmt).toString();
		return pageCipher;
	}
};

module.exports = getCipher;