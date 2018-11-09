const passportLocalMongoose =   require("passport-local-mongoose");
const Campground =              require("./models/campground");
const LocalStrategy =           require("passport-local");
const Comment =                 require("./models/comment");
const bodyParser =              require("body-parser");
const User =                    require("./models/user");
const passport =                require("passport");
const mongoose =                require("mongoose");
const express =                 require("express");
const seedDB =                  require("./seeds");
const app =                     express();

mongoose.connect('mongodb://localhost:27017/yelpcamp', { useNewUrlParser: true }); 
mongoose.set('useCreateIndex', true);
app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname+"/public"));
seedDB();

// passport config
app.use(require("express-session")({
    secret: "I can\'t get no satisfaction, she loves you, ye, ye, ye!",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());




app.get("/", (req, res) =>{
    res.render("home");
});

app.get("/campgrounds", (req, res) => {
    Campground.find({}, (err, allCampgrounds) => {
        if(err) {
            console.log(err)
        } else {
            res.render("campgrounds/index", {campgrounds: allCampgrounds});
        }
    })
    
});

app.post("/campgrounds", (req, res) => {
   let name = req.body.name;
   let image = req.body.image;
   let description = req.body.description;
   let newCampground = {name: name, image: image, description:description};
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

app.get("/campgrounds/new", (req, res) => {
   res.render("campgrounds/new"); 
});

app.get("/campgrounds/:id", (req, res) => {
    Campground.findById(req.params.id).populate("comments").exec((err,foundCampground) => {
        if(err) {
            console.log(err);
        } else {
            console.log(foundCampground);
            res.render("campgrounds/show", {campground:foundCampground});
        }
    });
    
    
});
// comments routes

app.get("/campgrounds/:id/comments/new", (req, res) => {
    Campground.findById(req.params.id, (err, campground) => {
        if(err) {
            console.log(err);
        } else {
            res.render("comments/new", {campground: campground});
        }
    });
    
app.post("/campgrounds/:id/comments", (req, res) => {
    Campground.findById(req.params.id, (err, campground) => {
        if(err) {
            console.log(err);
            res.redirect("/campgrounds");
        } else {
            Comment.create(req.body.comment, (err, comment) => {
                if(err) {
                    console.log(err);
                } else {
                    campground.comments.push(comment);
                    campground.save();
                    res.redirect("/campgrounds/"+campground._id);
                }
            });
        }
    });
});
    
});

// auth routes
app.get("/register", (req, res) => {
    res.render("register");
});

app.post("/register", (req, res) => {
    let newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, (err, user) => {
        if(err) {
            console.log(err);
            return res.render("register");
        }
        passport.authenticate("local")(req, res, () => {
            res.redirect("campgrounds");
        });
    });
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.listen(process.env.PORT, process.env.IP, () => {
    console.log("Let's get this rollin'!");
});