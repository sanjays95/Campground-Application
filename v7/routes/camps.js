var express = require("express"),
    router = express.Router();

//schema setup
var Comment = require('../models/comment'),
    Campground = require('../models/campground');


//===========Camp Routes===========
router.get("/", isLoggedIn, function(req,res){
    Campground.find({},function(err,allcampgrounds){
        if(err){
            console.log("Something went wrong")
        }else{
            res.render("campgrounds/camps", {campLists : allcampgrounds});        
        }
    })
    
})

router.post('/', isLoggedIn, function(req, res){
   var name = req.body.name;
   var image = req.body.image;
   var desc = req.body.description;
   var newCamp = { name : name, image : image, description : desc };
   Campground.create(newCamp, function(err,newcamp){
       if(err){
           console.log("Something went wrong while adding a new camp")
       } else{
           console.log("New camp is added")
           res.redirect('campgrounds/camps')
           
       }
   })
})

//Add new camp
router.get("/new", isLoggedIn, function(req,res){
    res.render('campgrounds/new', {currentUser : req.user});
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