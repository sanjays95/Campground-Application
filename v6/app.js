var express = require("express"),
    app = express(),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    passport = require("passport"),
    localStrategy = require("passport-local"),
    passportLocalMongoose = require("passport-local-mongoose");


mongoose.connect('mongodb://localhost/yelp_camp');

//schema setup
var Comment = require('./models/comment'),
    Campground = require('./models/campground'),
    User = require('./models/user');

//========Clearing DB============ 
var seedDB = require('./seed');
seedDB();

app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended : true}));
app.use(express.static(__dirname + "/public"));

//==================PASSPORT SETUP===================
app.use(require("express-session")({
  secret : "they see me rolling, im hating",
  resave : false,
  saveUninitialized : false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


//Middleware Functions Set up
app.use(function(req,res,next){
  res.locals.currentUser = req.user;
  next();
})

function isLoggedIn(req, res, next){
  if (req.isAuthenticated()){
    return next();
  }
  res.redirect("/login");
}

//==========================================
//BASIC ROUTES
//========================================

app.get("/", function(req,res){
    res.render("landing");
})

app.get("/camps", isLoggedIn, function(req,res){
    Campground.find({},function(err,allcampgrounds){
        if(err){
            console.log("Something went wrong")
        }else{
            console.log(req);
            res.render("campgrounds/camps", {campLists : allcampgrounds});        
        }
    })
    
})

//Add new camp
app.get("/camps/new", isLoggedIn, function(req,res){
    res.render('campgrounds/new', {currentUser : req.user});
})

app.post('/camps', isLoggedIn, function(req, res){
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

//=============Comment Routes ==============
app.get('/camps/:id/comments/new', isLoggedIn, function(req,res){
  Campground.findById(req.params.id,function(err,foundCamp){
    if(err)
      console.log("Error discovered");
    else
        res.render('comments/new',{camp : foundCamp});
  });
})

app.post('/camps/:id/comments', isLoggedIn,function(req,res){
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

//=================================
//-----------AUTH ROUTES-----------
//=================================

//show sign up page
app.get('/register', function(req, res){
  res.render("register");
})

//handle sign up page
app.post('/register', function(req,res){
  var newUser = new User({username : req.body.username});
  User.register(newUser, req.body.password, function(err, user){
    if(err){
      console.log(err)
      return res.render('/register');
    }
    res.redirect("/login")
  });
});

//show login page
app.get("/login", function(req,res){
  res.render("login");
});

// handle sign in page
app.post("/login", passport.authenticate('local',{
  successRedirect : "/camps",
  failureRedirect : "/login"
}) , function(req,res){

});

//handle log out 
app.get("/logout", function(req,res){
  req.logout();
  res.redirect('/');
}) 

//=====================SERVER START UP===============================
app.listen(3000, function(){
    console.log("Server started");
})
