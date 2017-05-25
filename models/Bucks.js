var mongoose = require('mongoose');
var Schema = mongoose.Schema;


let Buck = new Schema({
	no:String,
	update: Date,
	cat:String,
	flu:String,
	title:String,
	rat:String,
	ratc:String,
	org:String
})
;

exports.Demo = mongoose.model('Buck', Buck);
