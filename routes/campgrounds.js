const express = require("express");
const router = express.Router();
const Campground = require("../models/campground");
const Comment = require("../models/comment");
const middleware = require("../middleware");
const NodeGeocoder = require('node-geocoder');
 
const options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};
 
const geocoder = NodeGeocoder(options);
// index page - show all campgrounds
router.get("/", (req, res) => {
    // get all campgrounds from the db
    Campground.find({}, (err, allCampgrounds) => {
        if(err) {
            console.log(err);
        } else {
            res.render("campgrounds/index", {campgrounds: allCampgrounds, page: 'campgrounds'});
        }
    })
    
});
//CREATE - add new campground to DB
router.post("/", middleware.isLoggedIn, (req, res) =>{
  // get data from form and add to campgrounds array
  let name = req.body.name;
  let price = req.body.price;
  let image = req.body.image;
  let desc = req.body.description;
  let author = {
      id: req.user._id,
      username: req.user.username
  }
  geocoder.geocode(req.body.location, function (err, data) {
    if (err || !data.length) {
        console.log(err);
        req.flash('error', 'Invalid address');
        return res.redirect('back');
    }
    let lat = data[0].latitude;
    let lng = data[0].longitude;
    let location = data[0].formattedAddress;
    let newCampground = {name: name, price: price, image: image, description: desc, author:author, location: location, lat: lat, lng: lng};
    // Create a new campground and save to DB
    Campground.create(newCampground, (err, newlyCreated) =>{
        if(err){
            console.log(err);
        } else {
            //redirect back to campgrounds page
            req.flash("success", "Campground " + newCampground.name + " added! Hoorah!");
            console.log(newlyCreated);
            res.redirect("/campgrounds");
        }
    });
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
    
        res.render("campgrounds/edit", {campground: foundCampground});
    
    });

});


// UPDATE CAMPGROUND ROUTE
router.put("/:id", middleware.isCampgroundOwner, function(req, res){
  geocoder.geocode(req.body.location, function (err, data) {
    if (err || !data.length) {
      req.flash('error', 'Invalid address');
      return res.redirect('back');
    }
    req.body.campground.lat = data[0].latitude;
    req.body.campground.lng = data[0].longitude;
    req.body.campground.location = data[0].formattedAddress;

    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, campground){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            req.flash("success","Successfully Updated!");
            res.redirect("/campgrounds/" + campground._id);
        }
    });
  });
});
// destroy campground route
router.delete("/:id", middleware.isCampgroundOwner, (req, res) => {
    Campground.findByIdAndRemove(req.params.id, err => {
        if(err) {
            req.flash("error", "Something went wrong: " + err);
            res.redirect("/campgrounds");
        } else {
            req.flash("success", "Campground was deleted. Woosh!");
            res.redirect("/campgrounds");
        }
    });
});



module.exports = router;