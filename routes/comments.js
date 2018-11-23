const express = require("express");
const router = express.Router({mergeParams: true});
const Campground = require("../models/campground");
const Comment = require("../models/comment");
const middleware = require("../middleware");
// comments routes

router.get("/new", middleware.isLoggedIn, (req, res) => {
    Campground.findById(req.params.id, (err, campground) => {
        if(err) {
            console.log(err);
        } else {
            res.render("comments/new", {campground: campground});
        }
    });
    
router.post("/", middleware.isLoggedIn, (req, res) => {
    Campground.findById(req.params.id, (err, campground) => {
        if(err) {
            req.flash("error", "Something went wrong: " + err);
            res.redirect("/campgrounds");
        } else {
            Comment.create(req.body.comment, (err, comment) => {
                if(err) {
                    req.flash("error", "Something went wrong: " + err);
                } else {
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.save();
                    campground.comments.push(comment);
                    campground.save();
                    req.flash("success", "Comment added. Look!")
                    res.redirect("/campgrounds/"+campground._id);
                }
            });
        }
    });
});
    
});
// edit comment route
router.get("/:comment_id/edit", middleware.isCommentOwner, (req, res) => {
    Comment.findById(req.params.comment_id, (err, foundComment) =>{
        if(err) {
            req.flash("error", "Something went wrong. Oops!");
            res.redirect("back");
        } else {
            res.render("comments/edit", {campground_id: req.params.id, comment:foundComment});     
        }
    });
});

//update comment route
router.put("/:comment_id", middleware.isCommentOwner, (req, res) => {
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, (err, updatedComment) => {
        if(err) {
            req.flash("error", "Something went wrong. Oops!");
            res.redirect("back");
        } else {
            req.flash("success", "Comment was updated. Wheee!")
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});
//destroy comment route 
router.delete("/:comment_id", middleware.isCommentOwner, (req, res) => {
    Comment.findByIdAndRemove(req.params.comment_id, err => {
        if(err) {
            req.flash("error", "Something went wrong. Oops!");
            res.redirect("back");
        } else {
            req.flash("success", "Comment deleted. Phew!")
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});




module.exports = router;