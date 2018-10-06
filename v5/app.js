var express = require("express");
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/yelp_camp');

//schema setup
var Comment = require('./models/comment');
var Campground = require('./models/campground');

//Clearing DB 
var seedDB = require('./seed');
seedDB();

// Campground.create(
//     {
//         name : "Al Marjan", 
//         image : "https://images.pexels.com/photos/776117/pexels-photo-776117.jpeg?h=350&auto=compress&cs=tinysrgb",
//         description : "This is a camp in RAK beach side island"
//     },
// function(err,campground){
//     if(err){
//         console.log("Something went wrong");
//     }else{
//         console.log("New campground created")
//         console.log(campground);
//     }
// })


app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended : true}));
app.use(express.static(__dirname + "/public"));

app.get("/", function(req,res){
    res.render("landing");
})

app.get("/camps", function(req,res){
    Campground.find({},function(err,allcampgrounds){
        if(err){
            console.log("Something went wrong")
        }else{
            res.render("campgrounds/camps", {campLists : allcampgrounds});        
        }
    })
    
})

app.post('/camps', function(req, res){
   var name = req.body.name;
   var image = req.body.image;
   var desc = req.body.description;
   var newCamp = { name : name, image : image, description : desc };
   Campground.create(newCamp, function(err,newcamp){
       if(err){
           console.log("Something went wrong while adding a new camp")
       } else{
           console.log("New camp is added")
           res.redirect('campgrounds//camps')
           
       }
   })
})

app.get("/camps/new", function(req,res){
    res.render('new')
})
//SHOWS MORE INFO ABOUT CAMPGROUND
app.get('/camps/:id', function(req, res){
    Campground.findById(req.params.id).populate('comments').exec(function(err,foundCamp){
        if(err){
            console.log('Finding ID went wrong');
        }
        else{
            res.render('campgrounds/show', {camp : foundCamp});
        }      
    });
})
//================================Comment Routes ==============

app.get('/camps/:id/comments/new',function(req,res){
  Campground.findById(req.params.id,function(err,foundCamp){
    if(err)
      console.log("Error discovered");
    else
        res.render('comments/new',{camp : foundCamp });
  });
})

app.post('/camps/:id/comments',function(req,res){
  var newComment = req.body.comment;
  Campground.findById(req.params.id,function(err,foundCamp){
    if(err)
      console.log('Error in finding a new camp');
    else{
      Comment.create(newComment,function(err,comment){
        if (err)
          console.log("Error in creating a comment")
        else{
          foundCamp.comments.push(comment);
          foundCamp.save();
          res.redirect('/camps/' + foundCamp._id);         
        }
      }); 
    }
  });

});

app.listen(3000, function(){
    console.log("Server started");
})
