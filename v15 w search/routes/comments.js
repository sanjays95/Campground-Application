var express = require("express");
    router = express.Router({mergeParams : true});

//schema setup
var Comment = require('../models/comment'),
    Campground = require('../models/campground'),
    middleware = require('../middleware');

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
router.post('/', middleware.isLoggedIn,function(req,res){
  var newComment = req.body.comment;
  Campground.findById(req.params.id,function(err,foundCamp){
    if(err){
      req.flash("error", "Campground not found");
      console.log('Error in finding a new camp');
    }
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
          req.flash("success", "Successfully created comment");
          res.redirect('/camps/' + foundCamp._id);         
        }
      }); 
    }
  });
});

//Edit a comment
router.get('/:comment_id/edit', middleware.checkCommentOwnership, function(req,res){
  Campground.findById(req.params.id, function(err, foundCamp){
    if(err || !foundCamp){
      req.flash("error", "Campground not found");
      res.redirect("back");
    } else{
      Comment.findById(req.params.comment_id, function(err,foundComment){
      if(err)
        res.redirect("back");
      else
        {
          res.render("comments/edit", {camp_id : req.params.id, comment : foundComment});
        }
      })
    }
  })
})

//Update the comment 
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res){
  Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err,updatedComment){
    if(err){
      console.log("Error in updating the comment");
      res.redirect("back");
    }
    else
      {
        req.flash("success","Successfully edited comment");
        res.redirect("/camps/" + req.params.id);
      }
  })
})

//Delete  comment

router.delete("/:comment_id", middleware.checkCommentOwnership, function(req,res){
  Comment.findByIdAndRemove(req.params.comment_id, function(err, deletedComment){
    if(err)
    {
      console.log("Error in deleting a comment");
      res.redirect("back");
    }
    else{
      req.flash("success","Successfully deleted comment");
      res.redirect("/camps/" + req.params.id);
    }
  })
})

module.exports = router;