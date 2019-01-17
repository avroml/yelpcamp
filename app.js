require('dotenv').config();
const passportLocalMongoose =   require("passport-local-mongoose");
const Campground =              require("./models/campground");
const LocalStrategy =           require("passport-local");
const methodOverride =          require("method-override");
const Comment =                 require("./models/comment");
const flash =                   require("connect-flash");
const bodyParser =              require("body-parser");
const User =                    require("./models/user");
const passport =                require("passport");
const mongoose =                require("mongoose");
const express =                 require("express");
const seedDB =                  require("./seeds");
const app =                     express();

const commentRoutes = require("./routes/comments");
const campgroundRoutes = require("./routes/campgrounds");
const indexRoutes = require("./routes/index");

mongoose.connect(process.env.DATABASEURL, { useNewUrlParser: true }); 
mongoose.set('useCreateIndex', true);
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.set("view engine", "ejs");
app.use(express.static(__dirname+"/public"));
app.use(flash());


app.locals.moment = require('moment');
// passport config
app.use(require("express-session")({
    secret: process.env.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});
app.use(indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);


app.listen(process.env.PORT, process.env.IP, () => {
    console.log("Let's get this rollin'!");
});