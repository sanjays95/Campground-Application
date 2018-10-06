var express = require("express");
    router = express.Router({mergeParams : true});

//schema setup
var Comment = require('../models/comment'),
    Campground = require('../models/campground');

//=============Comment Routes ==============

//New comment route
router.get('/new', isLoggedIn, function(req,res){
  Campground.findById(req.params.id,function(err,foundCamp){
    if(err)
      console.log("Error discovered");
    else
        res.render('comments/new',{camp : foundCamp});
  });
})

//Add new comment
router.post('/', isLoggedIn,function(req,res){
  var newComment = req.body.comment;
  Campground.findById(req.params.id,function(err,foundCamp){
    if(err)
      console.log('Error in finding a new camp');
    else{
      Comment.create(newComment,function(err,comment){
        if (err)
          console.log("Error in creating a comment")
        else{
          comment.author.id = req.user._id;
          comment.author.username = req.user.username;
          comment.save();
          foundCamp.comments.push(comment);
          foundCamp.save();
          res.redirect('/camps/' + foundCamp._id);         
        }
      }); 
    }
  });

});

//Middleware Functions Set up
function isLoggedIn(req, res, next){
  if (req.isAuthenticated()){
    return next();
  }
  res.redirect("/login");
}

function loggedLogin (req,res,next){
  if(req.isAuthenticated()){
    return res.redirect("/camps");
  }
   return next();
}


module.exports = router;