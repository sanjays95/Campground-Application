var Campground = require("../models/campground"),
	Comment = require("../models/comment");

var middlewareObject = {
	checkCampOwnership : function(req, res,next){
	  if(req.isAuthenticated()){
	    Campground.findById(req.params.id, function(err, foundCamp){
	    if(err)
	      res.redirect("back")
	    else
	      {
	        if(foundCamp.author.id.equals(req.user._id))           //comparing object and strings
	          next()
	        else
	          res.redirect("back");
	      }
	    })
	  }
	  else{
	    res.redirect("back");
	  }
	},

	checkCommentOwnership : function(req, res, next){
	  if (req.isAuthenticated())
	  {
	    Comment.findById(req.params.comment_id, function(err, foundComment){
	      if(err)
	        res.redirect("back")
	      else
	      {
	        //does user own the comment
	        if(foundComment.author.id.equals(req.user._id))
	          next();
	        else
	          res.redirect("back");
	      }
	    });
	  }
	  else
	    res.redirect("back");
	},

	isLoggedIn: function(req, res, next){
	  if (req.isAuthenticated()){
	    return next();
	  }
	  res.redirect("/login");
	}
}

module.exports = middlewareObject;