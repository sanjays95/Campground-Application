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
      req.flash("error", err.message);   //Message already exist in the err object
      return res.redirect('/register');
    }
    
    passport.authenticate('local')(req, res, function(){  
      if(req.body.isadmin === "Secretcode123"){
        user.isAdmin = true;
        user.save();
        req.flash('success',"Hi welcome Administrator "+ user.username);
        res.redirect("/camps");
      }else{
        req.flash('success',"Hi welcome to CampYoWay "+ user.username);
        res.redirect("/camps");
      }      
    })   
  });
});

//show login page
router.get("/login", loggedLogin, function(req,res){
  res.render("login");
});

// handle sign in page
router.post("/login", function(req,res,next){ 
  passport.authenticate('local',{
      successRedirect : "/camps",
      failureRedirect : "/login",
      failureFlash: true,
      successFlash : "Welcome Back " + req.body.username
    }) (req,res);
  
}); 
//handle log out 
router.get("/logout", function(req,res){
  req.logout();
  req.flash("success", 'You have successfully logged out');
  res.redirect('/camps');
}) 

module.exports = router;