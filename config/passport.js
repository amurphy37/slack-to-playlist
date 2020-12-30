var passport = require("passport");
var fs = require("fs")
var path = require("path")
var LocalStrategy = require("passport-local").Strategy;


// Requiring models to access user model
var db = require("../models");

passport.use(new LocalStrategy(
    // Our user will sign in using username, which in this case is email
    {
        usernameField: "username"
    },
    function (username, password, done) {
        // When a user tries to sign in this code runs
        db.User.findOne({ username: username }, (err, user) => {
            if (err) {
                return done(err)
            }
            // If there's no user with the given email
            if (!user) {
                return done(null, false, {
                    message: "Incorrect username."
                });
            }
            // If there is a user with the given email, but the password the user gives us is incorrect
            if (!user.validPassword(password)) {
                return done(null, false, { message: "Incorrect password." })
            }
            // If none of the above, return the user
            return done(null, user);
        })
    }
));

// In order to help keep authentication state across HTTP requests,
// Sequelize needs to serialize and deserialize the user
// Just consider this part boilerplate needed to make it all work
passport.serializeUser(function (user, cb) {
    cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
    cb(null, obj);
});

// Exporting our configured passport
module.exports = passport;