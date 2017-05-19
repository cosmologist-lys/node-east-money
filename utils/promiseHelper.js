
let promiseHelper = {
	getPromise : function (value) {
		return new Promise((resolved,reject)=>{
			resolved(value);
		})
	}
};

module.exports = promiseHelper;