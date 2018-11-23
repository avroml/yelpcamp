const Campground = require("../models/campground");
const Comment = require("../models/comment");
// all the middleware goes here
const  middlewareObj = {
    
};

middlewareObj.isCampgroundOwner = (req, res, next) => {
//authorization middleware
    if(req.isAuthenticated()) {
        Campground.findById(req.params.id, (err, foundCampground) => {
        if(err) {
            req.flash("error", "Campground not found. Yuck!");
            res.redirect("back");
            console.log(err);
        } else {
            if(foundCampground.author.id.equals(req.user._id)){
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
        if(err) {
            req.flash("error", "Comment not found. Pfff!");
            res.redirect("back");
            console.log(err);
        } else {
            if(foundComment.author.id.equals(req.user._id)){
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