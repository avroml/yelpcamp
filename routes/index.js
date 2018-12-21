const express = require("express");
const router = express.Router();
const passport = require("passport");
const async = require("async");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const Campground = require("../models/campground");
const User = require("../models/user");
const Comment = require("../models/comment");

router.get("/", (req, res) =>{
    res.render("home");
});

// auth routes
router.get("/register", (req, res) => {
    res.render("register", {page: 'register'});
});

router.post("/register", (req, res) => {
    let newUser = new User({
            username: req.body.username,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            avatar: req.body.avatar
        });
    if(req.body.adminCode === "SureWhyNot!") {
        newUser.isAdmin = true;
    }
    if(req.body.avatar.length == 0) {
        newUser.avatar = "https://res.cloudinary.com/develo132/image/upload/v1544966114/anyxcrui0elcrbor7e2n.jpg";
    }
    User.register(newUser, req.body.password, (err, user) => {
        if(err){
        console.log(err);
        return res.render("register", {error: err.message});
        }
        passport.authenticate("local")(req, res, () => {
            if(newUser.isAdmin) {
                req.flash("success", "Welcome master " +user.username+"! You're an admin on this page!")
            } else {
                req.flash("success", "You're registered and logged in. Welcome, " + user.username + "!");
            }
            res.redirect("campgrounds");
        });
    });
});
//login routes
router.get("/login", (req, res) => {
    res.render("login", {page: 'login'});
});

router.post("/login", passport.authenticate('local', {
    successRedirect: '/campgrounds',
    failureRedirect: '/login',
    failureFlash: true,
    successFlash: "You're logged in now. Yey!"
}), (req, res) => {});
//logout route
router.get("/logout", (req, res) => {
    req.logout();
    req.flash("success", "You're logged out now. See ya!");
    res.redirect("/");
});
//forgot password
router.get("/forgot", (req, res) => {
    res.render("forgot");
});

router.post("/forgot", (req, res, next) => {
    async.waterfall([
        done => {
            crypto.randomBytes(20, (err, buf) => {
                let token = buf.toString('hex');
                done(err, token);
            });
        },
        (token, done) => {
            User.findOne({email: req.body.email}, (err, user) => {
                if(!user) {
                    req.flash("error", "There's no such email in the user database!");
                    return res.redirect('/forgot');
                }
                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 3600000; //1 hour
                
                user.save(err => {
                    done(err, token, user);
                });
            });
        },
        (token, user, done) => {
            let smtpTransport = nodemailer.createTransport({
                service: "Gmail",
                auth: {
                    user: 'developmentmail132@gmail.com',
                    pass: process.env.GMAILPW
                }
            });
            let mailOptions = {
                to: user.email,
                from: 'developmentmail132@gmail.com',
                subject: 'YelpCamp password reset',
                text: 'You are receiving this because you (or someone else) have requested the reset of the password for your YelpCamp account.\n\n' +
                'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                'http://' + req.headers.host + '/reset/' + token + '\n\n' +
                'If you did not request this, please ignore this email and your password will remain unchanged.\n'
            };
            smtpTransport.sendMail(mailOptions, err => {
                console.log("mail sent");
                req.flash("success", "An email with a reset link was sent to "+ user.email + " with further instructions.");
                done(err, done);
            });
        }
        ], err => {
            if(err) return next(err);
            res.redirect("/forgot");
        });
});
router.get("/reset/:token", (req, res) => {
    User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, (err, user) =>{
    if (err || !user) {
      req.flash('error', 'Password reset token is invalid or has expired.');
      return res.redirect('/forgot');
    }
    res.render('reset', {token: req.params.token});
  }); 
});

router.post('/reset/:token', (req, res) => {
  async.waterfall([
    done => {
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, (err, user) => {
        if (err || !user) {
          req.flash('error', 'Password reset token is invalid or has expired.');
          return res.redirect('back');
        }
        if(req.body.password === req.body.confirm) {
          user.setPassword(req.body.password, err => {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            user.save( err => {
              req.logIn(user, err => {
                done(err, user);
              });
            });
          })
        } else {
            req.flash("error", "Passwords do not match.");
            return res.redirect('back');
        }
      });
    },
    (user, done)  => {
      var smtpTransport = nodemailer.createTransport({
        service: 'Gmail', 
        auth: {
          user: 'developmentmail132@gmail.com',
          pass: process.env.GMAILPW
        }
      });
      var mailOptions = {
        to: user.email,
        from: 'developmentmail132@gmail.com',
        subject: 'Your password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };
      smtpTransport.sendMail(mailOptions, err => {
        req.flash('success', 'Success! Your password has been changed.');
        done(err);
      });
    }
  ], err => {
    res.redirect('/campgrounds');
  });
});

// user profile
router.get("/users/:id", (req, res) => {
    User.findById(req.params.id, (err, foundUser) => {
        if(err) {
            req.flash('error', 'User not found');
            return res.redirect('back');
        }
    Campground.find().where('author.id').equals(foundUser._id).exec((err, campgrounds) => {
        if(err) {
            req.flash('error', 'User not found');
            return res.redirect('back');
        }
        res.render("users/show", {user: foundUser, campgrounds: campgrounds});
        
    })
    }); 
});

module.exports = router;