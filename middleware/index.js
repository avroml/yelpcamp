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
            res.redirect("back");
            console.log(err);
        } else {
            if(foundCampground.author.id.equals(req.user._id)){
                next();
            } else {
                console.log("Not your campground to modify");
                res.redirect("back");
            }
        }
    });
    } else {
        res.redirect("/login");
    }
};

middlewareObj.isCommentOwner = (req, res, next) => {
    if(req.isAuthenticated()) {
        Comment.findById(req.params.comment_id, (err, foundComment) => {
        if(err) {
            res.redirect("back");
            console.log(err);
        } else {
            if(foundComment.author.id.equals(req.user._id)){
                next();
            } else {
                console.log("Not your comment to modify");
                res.redirect("back");
            }
        }
    });
    } else {
        res.redirect("/login");
    }
};

// authentication middleware
middlewareObj.isLoggedIn = (req, res, next) => {
    if(req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
};


module.exports = middlewareObj;