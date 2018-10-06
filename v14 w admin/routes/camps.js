var express = require("express"),
    router = express.Router(),
    request = require('request');

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
   var  name = req.body.name,
        image = req.body.image,
        desc = req.body.description,
        price = req.body.price,
        author = {
                  id : req.user._id,
                  username : req.user.username
                },
        url = "https://maps.googleapis.com/maps/api/geocode/json?address="+ req.body.location + "&key=" + process.env.GEOCODER_API_KEY;
        
        // geocoder.geocode(req.body.location, function(err, data) {
        //   if (err || !data.length){
        //     req.flash("error", "No location has been found");
        //     res.redirect("back");
        //   }
        request(url, function(error, response, body){
          if(error || !body.length){
            req.flash("error", "Invalid location");
            res.redirect("back");
          }
          data = JSON.parse(body);
          var lat = data.results[0].geometry.location.lat;
          var lng = data.results[0].geometry.location.lng;
          var location = data.results[0].formatted_address;
          var newCamp = { name : name, image : image, location : location, lat : lat, lng : lng, description : desc, price : price, author : author };

          Campground.create(newCamp, function(err,newcamp){
            if(err){
              console.log("Something went wrong while adding a new camp")
            } else{
              req.flash("success","Successfully added new camp ");
              res.redirect('/camps')    
            }
          });
        });
});

   

//SHOWS MORE INFO ABOUT CAMPGROUND
router.get('/:id', function(req, res){
    Campground.findById(req.params.id).populate('comments').exec(function(err,foundCamp){
        if(err || !foundCamp ){
            req.flash("error",'Campground and comment not found');
            res.redirect("/camps");
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
  // geocoder.geocode(req.body.camp.location, function(err, data){
  //   if(err || !data.length){
  //     req.flash("error","Invalid address format");
  //     res.redirect("back");
  //   }
  url = "https://maps.googleapis.com/maps/api/geocode/json?address="+ req.body.camp.location + "&key=" + process.env.GEOCODER_API_KEY;
  request(url, function(error, response, body){
    if(error || !body.length){
            req.flash("error", "Invalid location");
            res.redirect("back");
        }
    data = JSON.parse(body);  
    req.body.camp.lat = data.results[0].geometry.location.lat;
    req.body.camp.lng = data.results[0].geometry.location.lng;
    req.body.camp.location = data.results[0].formatted_address; 
    Campground.findByIdAndUpdate(req.params.id,req.body.camp, function(err, updatedCamp){
      if(err){
        console.log("Error in finding a camp for updating")
        res.redirect("/camps");
      }
    else{
      req.flash("success","Successfully updated camp");
      res.redirect('/camps/' + updatedCamp._id);
      }
    });
  });
});


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