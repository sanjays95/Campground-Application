var express = require("express");
    router = express.Router({mergeParams : true});

//schema setup
var Comment = require('../models/comment'),
    Campground = require('../models/campground');

function checkCommentOwnership(req, res, next){
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
}
//=============Comment Routes ==============

//New comment route
//This is not required anymore as we dont have to neccesarily go to a new page to add a comment. Solved by adding a form in campground/show page
// router.get('/new', isLoggedIn, function(req,res){
//   Campground.findById(req.params.id,function(err,foundCamp){
//     if(err)
//       console.log("Error discovered");
//     else
//         res.render('comments/new',{camp : foundCamp});
//   });
// })

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

//Edit a comment
router.get('/:comment_id/edit', checkCommentOwnership, function(req,res){
  Comment.findById(req.params.comment_id, function(err,foundComment){
    if(err)
      res.redirect("back");
    else
      {
        res.render("comments/edit", {camp_id : req.params.id, comment : foundComment})
      }

  })
})

//Update the comment 
router.put("/:comment_id", checkCommentOwnership, function(req, res){
  Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err,updatedComment){
    if(err){
      console.log("Error in updating the comment");
      res.redirect("back");
    }
    else
      {
        res.redirect("/camps/" + req.params.id);
      }
  })
})

//Delete  comment

router.delete("/:comment_id", checkCommentOwnership, function(req,res){
  Comment.findByIdAndRemove(req.params.comment_id, function(err, deletedComment){
    if(err)
    {
      console.log("Error in deleting a comment");
      res.redirect("back");
    }
    else
      res.redirect("/camps/" + req.params.id);
  })
})

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