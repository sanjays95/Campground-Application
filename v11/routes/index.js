var express = require("express");
    router = express.Router();
    passport = require("passport");

var User = require('../models/user');

//Middleware Functions Set up
function loggedLogin (req,res,next){
  if(req.isAuthenticated()){
    req.flash("success","You are already logged in");
    return res.redirect("/camps");
  }
   return next();
}

//=================================
//-----------AUTH ROUTES-----------
//=================================

//show sign up page
router.get('/register', function(req, res){
  res.render("register");
})

//handle sign up page
router.post('/register', function(req,res){
  var newUser = new User({username : req.body.username});
  User.register(newUser, req.body.password, function(err, user){
    if(err){
      req.flash("error", err.message);
      return res.redirect('/register');
    }
    //req.flash("success", "Welcome to CampYoWay!");
    //Didnt implement this in the previous version
    passport.authenticate('local')(req, res, function(){
      req.flash('success',"Hi welcome to CampYoWay "+ user.username);
      res.redirect("/camps")
    })
    
  });
});

//show login page
router.get("/login", loggedLogin, function(req,res){
  res.render("login");
});

// handle sign in page
router.post("/login", passport.authenticate('local',{
  successRedirect : "/camps",
  failureRedirect : "/login"
}) , function(req,res){

});

//handle log out 
router.get("/logout", function(req,res){
  req.logout();
  req.flash("success", 'You have successfully logged out');
  res.redirect('/');
}) 

module.exports = router;