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

const multer = require('multer');
let storage = multer.diskStorage({
  filename: (req, file, callback) => {
    callback(null, Date.now() + file.originalname);
  }
});
let imageFilter = (req, file, cb) => {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
let upload = multer({ storage: storage, fileFilter: imageFilter})

const cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: 'develo132', 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

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

//CREATE - add new campground to DB, contains cloudinary and google maps

router.post("/", middleware.isLoggedIn, upload.single('image'), (req, res) =>{
    cloudinary.v2.uploader.upload(req.file.path, (err, result) => {
      if(err) {
        req.flash('error', err.message);
        return res.redirect('back');
      }
      geocoder.geocode(req.body.location, (err, data) => {
        if (err || !data.length) {
          req.flash('error', 'Invalid address');
          return res.redirect('back');
        }
            req.body.campground.lat = data[0].latitude;
            req.body.campground.lng = data[0].longitude;
            req.body.campground.location = data[0].formattedAddress;
        
            // add cloudinary url for the image to the campground object under image property
          req.body.campground.image = result.secure_url;
          // add image's public_id to campground object
         req.body.campground.imageId = result.public_id;
          // add author to campground
          req.body.campground.author = {
            id: req.user._id,
            username: req.user.username
          }
          Campground.create(req.body.campground, (err, campground) => {
            if (err) {
              req.flash('error', err.message);
              return res.redirect('back');
            }
            res.redirect('/campgrounds/' + campground.id);
          });
      });
      
    });
});

router.get("/new", middleware.isLoggedIn, (req, res) => {
  res.render("campgrounds/new"); 
});

router.get("/:id", (req, res) => {
    Campground.findById(req.params.id).populate("comments").exec((err,foundCampground) => {
        if(err) {
            req.flash("error", err.message)
            return res.redirect("back");
        } 
            res.render("campgrounds/show", {campground:foundCampground});

    });
});

// edit campground route
router.get("/:id/edit", middleware.isCampgroundOwner, (req, res) => {
    Campground.findById(req.params.id, (err, foundCampground) => {
        if (err) {
          req.flash('error', 'Something went wrong: ' + err.message);
          return res.redirect('back');
        }
        res.render("campgrounds/edit", {campground: foundCampground});
    });
});


//UPDATE CAMPGROUND ROUTE

router.put("/:id", middleware.isCampgroundOwner, upload.single('image'), function(req, res){
    Campground.findById(req.params.id, async (err, campground) => {
        if(err){
            console.log(err);
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            if (req.file) {
                try {
                    await cloudinary.v2.uploader.destroy(campground.imageId);
                    let result = await cloudinary.v2.uploader.upload(req.file.path);
                    campground.imageId = result.public_id;
                    campground.image = result.secure_url;
                } catch(err) {
                    req.flash("error", err.message);
                    return res.redirect("back");
                }
            }
            
            geocoder.geocode(req.body.campground.location, (err, data) => { 
                if(err || !data.length) {
                    console.log(err);
                    req.flash('error', 'Invalid address');
                    return res.redirect('back');
                }
            campground.lat = data[0].latitude;
            campground.lng = data[0].longitude;
            campground.location = data[0].formattedAddress;
            campground.name = req.body.campground.name;
            campground.description = req.body.campground.description;
            campground.price = req.body.campground.price;
            campground.save();
            req.flash("success", "Successfully Updated!");
            res.redirect("/campgrounds/" + campground._id);
            });
        }
    });
});


// destroy campground route
router.delete("/:id", middleware.isCampgroundOwner, (req, res) => {
    Campground.findById(req.params.id, async (err, campground) => {
        if(err) {
            req.flash("error", "Something went wrong: " + err);
            return res.redirect("back");
        } 
        try {
            await cloudinary.v2.uploader.destroy(campground.imageId);
            campground.remove();
            req.flash("success", "Campground was deleted. Woosh!");
            res.redirect("/campgrounds");
        } catch(err) {
            if(err) {
            req.flash("error", "Something went wrong: " + err);
            return res.redirect("back");
            }
        }
    });
});

module.exports = router;