var mongoose = require('mongoose');

var campGround = new mongoose.Schema({
    name : String,
    image : String,
    location : String,
    lat : Number,
    lng : Number,
    description : String,
    price   : String,
    comments :[
    		{
    			type : mongoose.Schema.Types.ObjectId,
    			ref :  'Comment'
    		}
    ],
    
    author	:{
    			id : {
    					type :mongoose.Schema.Types.ObjectId,
    					ref : 'User'
					 },
				username : String
    		 },

    createdDate  :{
            type   : Date,
            default : Date.now
        }

});

module.exports = mongoose.model("Campground",campGround);