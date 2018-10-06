//For Google Maps Api's
require('dotenv').config();

var express = require("express"),
    app = express(),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    mongoose = require('mongoose'),
    flash    = require("connect-flash"),
    passport = require("passport"),
    localStrategy = require("passport-local"),
    passportLocalMongoose = require("passport-local-mongoose"),
    moment = require('moment');
    
 
var campRoutes = require("./routes/camps"),
    commentRoutes = require("./routes/comments"),
    indexRoutes = require("./routes/index");



mongoose.connect('mongodb://localhost/yelp_camp_v2');

//schema setup
var Comment = require('./models/comment'),
    Campground = require('./models/campground'),
    User = require('./models/user');

//========Clearing DB============ 
// var seedDB = require('./seed');
// seedDB();

app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended : true}));
app.use(express.static(__dirname + "/public"));
app.use(methodOverride('_method'));

//Flash Message Setup
app.use(flash());

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

//Middleware Functions to store the user info 
app.use(function(req,res,next){
  res.locals.currentUser = req.user;
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  res.locals.moment = moment;
  next();
})

app.use("/camps",campRoutes);
app.use("/camps/:id/comments",commentRoutes);
app.use(indexRoutes);

//==========================================
//BASIC ROUTES
//========================================

app.get("/", function(req,res){
    res.render("landing");
})

//=====================SERVER START UP===============================
app.listen(3000, function(){
    console.log("Server started");
})
