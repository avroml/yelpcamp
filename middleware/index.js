const Campground = require("../models/campground");
const Comment = require("../models/comment");
const User = require("../models/user");
// all the middleware goes here
const  middlewareObj = {};

middlewareObj.isAccountOwner = (req, res, next) => {
    if(req.isAuthenticated()) {
        User.findById(req.params.id, (err, foundUser) => {
            if(err || !foundUser) {
                req.flash("error", "User not found. Yikes!" + err.message);
                res.redirect("back");
                console.log(err);
            } else {
                if(req.user._id.equals(foundUser.id) || req.user.isAdmin) {
                    next();
                } else {
                    req.flash("error", "You're not allowed to do that! Stop!");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "Please log in first. Duh!");
        res.redirect("/login");
    }
};

middlewareObj.isCampgroundOwner = (req, res, next) => {
//authorization middleware
    if(req.isAuthenticated()) {
        Campground.findById(req.params.id, (err, foundCampground) => {
        if(err || !foundCampground) {
            req.flash("error", "Campground not found. Yuck! " + err.message);
            res.redirect("back");
            console.log(err);
        } else {
            if(foundCampground.author.id.equals(req.user._id) || req.user.isAdmin){
                next();
            } else {
                req.flash("error", "Not your campground to modify. Dude!");
                res.redirect("back");
            }
        }
    });
    } else {
        req.flash("error", "Please log in first. Duh!")
        res.redirect("/login");
    }
};

middlewareObj.isCommentOwner = (req, res, next) => {
    if(req.isAuthenticated()) {
        Comment.findById(req.params.comment_id, (err, foundComment) => {
        if(err || !foundComment) {
            req.flash("error", "Comment not found. Pfff!");
            res.redirect("back");
            console.log(err);
        } else {
            if(foundComment.author.id.equals(req.user._id) || req.user.isAdmin){
                next();
            } else {
                req.flash("error", "Not your comment to modify. Whoa!");
                res.redirect("back");
            }
        }
    });
    } else {
        req.flash("error", "You need to be logged in! Come on!");
        res.redirect("/login");
    }
};

// authentication middleware
middlewareObj.isLoggedIn = (req, res, next) => {
    if(req.isAuthenticated()) {
        return next();
    }
    req.flash("error", "You need to be logged in! Come on!");
    res.redirect("/login");
};


module.exports = middlewareObj;