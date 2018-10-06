var express = require("express");
    router = express.Router();
    passport = require("passport");

var User = require('../models/user');

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
      console.log(err)
      return res.render('/register');
    }
    res.redirect("/login")
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
  res.redirect('/');
}) 

module.exports = router;