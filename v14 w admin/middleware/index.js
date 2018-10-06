var Campground = require("../models/campground"),
	Comment = require("../models/comment");

var middlewareObject = {
	checkCampOwnership : function(req, res,next){
	  if(req.isAuthenticated()){
	    Campground.findById(req.params.id, function(err, foundCamp){
	    if(err || !foundCamp){
	    		req.flash("error","Campground not found");
	    		res.redirect("back");
	    }
	    else
	      {
	        if(foundCamp.author.id.equals(req.user._id) || req.user.isAdmin)           //comparing object and strings
	          next()
	        else{
	        	req.flash("error", "You are not authorised");
	          	res.redirect("back");
	        }
	      }
	    })
	  }
	  else{
	  	req.flash("error", "You need to be logged in")
	    res.redirect("back");
	  }
	},

	checkCommentOwnership : function(req, res, next){
	  if (req.isAuthenticated())
	  {
	    Comment.findById(req.params.comment_id, function(err, foundComment){
	      if(err || !foundComment){
	      	req.flash("error","Comment not found");
	    	res.redirect("back");
	      }
	      else
	      {
	        //does user own the comment
	        if(foundComment.author.id.equals(req.user._id) || req.user.isAdmin)
	          next();
	        else
	          res.redirect("back");
	      }
	    });
	  }
	  else{
	    req.flash("error",'You need to be logged in');
	    res.redirect("back");
		}
	},

	isLoggedIn: function(req, res, next){
	  if (req.isAuthenticated()){
	    return next();
	  }
	  req.flash("error",'You need to be logged in');
	  res.redirect("/login");
	}
}

module.exports = middlewareObject;