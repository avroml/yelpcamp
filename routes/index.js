const express = require("express");
const router = express.Router();
const passport = require("passport");
const async = require("async");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const Campground = require("../models/campground");
const User = require("../models/user");
const Comment = require("../models/comment");

router.get("/", (req, res) =>{
    res.render("home");
});

// auth routes
router.get("/register", (req, res) => {
    res.render("register", {page: 'register'});
});

router.post("/register", (req, res) => {
    let newUser = new User({
            username: req.body.username,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            avatar: req.body.avatar
        });
    if(req.body.adminCode === "SureWhyNot!") {
        newUser.isAdmin = true;
    }
    User.register(newUser, req.body.password, (err, user) => {
        if(err){
        console.log(err);
        return res.render("register", {error: err.message});
        }
        passport.authenticate("local")(req, res, () => {
            if(newUser.isAdmin) {
                req.flash("success", "Welcome master " +user.username+"! You're an admin on this page!")
            } else {
                req.flash("success", "You're registered and logged in. Welcome, " + user.username + "!");
            }
            res.redirect("campgrounds");
        });
    });
});
//login routes
router.get("/login", (req, res) => {
    res.render("login", {page: 'login'});
});

router.post("/login", passport.authenticate('local', {
    successRedirect: '/campgrounds',
    failureRedirect: '/login'
}), (req, res) => {});
//logout route
router.get("/logout", (req, res) => {
    req.logout();
    req.flash("success", "You're logged out now. See ya!");
    res.redirect("/");
});
// user profile
router.get("/users/:id", (req, res) => {
    User.findById(req.params.id, (err, foundUser) => {
        if(err) {
            req.flash('error', 'User not found');
            return res.redirect('back');
        }
    Campground.find().where('author.id').equals(foundUser._id).exec((err, campgrounds) => {
        if(err) {
            req.flash('error', 'User not found');
            return res.redirect('back');
        }
        res.render("users/show", {user: foundUser, campgrounds: campgrounds});
        
    })
    }); 
});

module.exports = router;