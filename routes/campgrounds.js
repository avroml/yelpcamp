const express = require("express");
const router = express.Router();
const Campground = require("../models/campground");
const Comment = require("../models/comment");
const middleware = require("../middleware");

router.get("/", (req, res) => {
    Campground.find({}, (err, allCampgrounds) => {
        if(err) {
            console.log(err);
        } else {
            res.render("campgrounds/index", {campgrounds: allCampgrounds});
        }
    })
    
});

router.post("/", middleware.isLoggedIn, (req, res) => {
   let name = req.body.name;
   let image = req.body.image;
   let description = req.body.description;
   let author = {
       id: req.user._id,
       username: req.user.username
   }
   let newCampground = {name: name, image: image, description:description, author:author};
   Campground.create(newCampground, (err, newCampground) => {
       if(err) {
           console.log(err);
       } else {
           console.log("Campground added: ");
           console.log(newCampground);
            res.redirect("/campgrounds");
       }
   });
});

router.get("/new", middleware.isLoggedIn, (req, res) => {
   res.render("campgrounds/new"); 
});

router.get("/:id", (req, res) => {
    Campground.findById(req.params.id).populate("comments").exec((err,foundCampground) => {
        if(err) {
            console.log(err);
        } else {
            console.log(foundCampground);
            res.render("campgrounds/show", {campground:foundCampground});
        }
    });
});

// edit campground route
router.get("/:id/edit", middleware.isCampgroundOwner, (req, res) => {
    Campground.findById(req.params.id, (err, foundCampground) => {
    //     if(err) {
    //         res.redirect("/campgrounds");
    //         console.log(err);
    //     } else {
    //         if(foundCampground.author.id.equals(req.user._id)){
        res.render("campgrounds/edit", {campground: foundCampground});
    //         } else {
    //             res.send("Not your campground to edit");
    //         }
    //     }
    });
    // } else {
    //     console.log("Need to log-in to continue.");
    //     res.redirect("login");
    // }
    
});
// update campground route
router.put("/:id", middleware.isCampgroundOwner, (req, res) => {
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, (err, updatedCampground) => {
        if(err) {
            console.log(err);
            res.redirect("/campgrounds");
        } else {
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});
// destroy campground route
router.delete("/:id", middleware.isCampgroundOwner, (req, res) => {
    Campground.findByIdAndRemove(req.params.id, err => {
        if(err) {
            console.log(err);
            res.redirect("/campgrounds");
        } else {
            res.redirect("/campgrounds");
        }
    });
});



module.exports = router;