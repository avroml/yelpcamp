const mongoose = require("mongoose");
const passportLocalMongoose =   require("passport-local-mongoose");
const UserSchema = new mongoose.Schema({
    username: {type: String, unique: true, required: true},
    password: String,
    firstName: String,
    lastName: String,
    email: {type: String, unique: true, required: true},
    avatar: String,
    avatarId: String,
    aboutMe: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    isAdmin: {type: Boolean, default: false},
    createdAt: { type: Date, default: Date.now },
});

UserSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", UserSchema);