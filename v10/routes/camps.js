var express = require("express"),
    router = express.Router();

//schema setup
var Comment = require('../models/comment'),
    Campground = require('../models/campground');

//middleware setup
var middleware = require('../middleware');   //automatically picks up  index file if no file is mentioned

//===========Camp Routes===========
router.get("/", function(req,res){
    Campground.find({},function(err,allcampgrounds){
        if(err){
            console.log("Something went wrong")
        }else{
            res.render("campgrounds/camps", {campLists : allcampgrounds});        
        }
    })
    
})



//Add new camp
router.get("/new", middleware.isLoggedIn, function(req,res){
    res.render('campgrounds/new', {currentUser : req.user});
})

router.post('/', middleware.isLoggedIn, function(req, res){
   var name = req.body.name;
   var image = req.body.image;
   var desc = req.body.description;
   var author = {
                  id : req.user._id,
                  username : req.user.username
                }

   var newCamp = { name : name, image : image, description : desc, author : author };
   Campground.create(newCamp, function(err,newcamp){
       if(err){
           console.log("Something went wrong while adding a new camp")
       } else{
           console.log("New camp is added")
           res.redirect('/camps')
           
       }
   })
})

//SHOWS MORE INFO ABOUT CAMPGROUND
router.get('/:id', function(req, res){
    Campground.findById(req.params.id).populate('comments').exec(function(err,foundCamp){
        if(err){
            console.log('Finding ID went wrong');
        }
        else{
            res.render('campgrounds/show', {camp : foundCamp});
        }      
    });
})

//EDIT A CAMP
router.get("/:id/edit", middleware.checkCampOwnership, function(req, res){
  Campground.findById(req.params.id, function(err, foundCamp){
    res.render("campgrounds/edit", {camp : foundCamp});
  });
});

//UPDATE the particular CAMP
router.put("/:id", middleware.checkCampOwnership, function(req, res){
  Campground.findByIdAndUpdate(req.params.id,req.body.camp, function(err, updatedCamp){
    if(err){
      console.log("Error in finding a camp for updating")
      res.redirect("/camps");
    }
    else
      res.redirect('/camps/' + updatedCamp._id);
  })
})


//Delete a CAMP
router.delete("/:id", middleware.checkCampOwnership, function(req, res){
  Campground.findByIdAndRemove(req.params.id, function(err, deletedCamp){
    if(err)
      {
        console.log("Error in deleting a camp");
        res.redirect("/camps")  
      }
      else
        res.redirect("/camps");
  });
});


module.exports = router;