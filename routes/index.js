const express = require("express");
const router = express.Router();
const passport = require("passport");

let Campground = require("../models/campground");
let User = require("../models/user");
let Comment = require("../models/comment");

router.get("/", (req, res) =>{
    res.render("home");
});

// auth routes
router.get("/register", (req, res) => {
    res.render("register", {page: 'register'});
});

router.post("/register", (req, res) => {
    let newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, (err, user) => {
        if(err){
        console.log(err);
        return res.render("register", {error: err.message});

        // if(err) {
        //     // return res.render("register", {"error": err.message});
        //     req.flash("error", "Something went wrong: " + err.message);
        //     return res.render("register");
        }
        passport.authenticate("local")(req, res, () => {
            req.flash("success", "You're registered and logged in. Welcome, " + user.username + "!");
            res.redirect("campgrounds");
        });
    });
});

router.get("/login", (req, res) => {
    res.render("login", {page: 'login'});
});
router.post("/login", passport.authenticate('local', {
    successRedirect: '/campgrounds',
    failureRedirect: '/login'
}), (req, res) => {});

router.get("/logout", (req, res) => {
    req.logout();
    req.flash("success", "You're logged out now. See ya!");
    res.redirect("/");
});

// function isLoggedIn(req, res, next) {
//     if(req.isAuthenticated()) {
//         return next();
//     } 
//     req.flash("error", "You need to be logged in! Come on!");
//     res.redirect("/login");
// }

module.exports = router;