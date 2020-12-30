// Requiring bcrypt for password hashing and mongoose to create User model schema
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
// Creating our User model
const Schema = mongoose.Schema

// User schema - setting up our data schema for adding users to database.
const UserSchema = new Schema({
    username: {
        type: String,
        trim: true,
        lowercase: true,
        unique: true,
        required: "Username is required"
    },
    password: {
        type: String,
        required: true
    },
    slackUserID: {
        type: String
    },
    slackTeamID: {
        type: String
    },
    slackTeamName: {
        tyupe: String
    },
    slackAuthToken: {
        type: String
    },
    slackTeamAuthToken: {
        type: String
    },
    spotifyAccessToken: {
        type: String
    },
    spotifyRefreshToken: {
        type: String
    },
    appleToken: {
        type: String
    },
    playlists: [
        {
            type: Schema.Types.ObjectId,
            ref: "Playlist"
        }
    ]
},
    {
        timestamps: true
    });

// Creating a custom method for our User model. This will check if an unhashed password entered by the user can be compared to the hashed password stored in our database
UserSchema.methods.validPassword = function (inputPassword) {
    return bcrypt.compareSync(inputPassword, this.password);
};


// Creating pre-save hook to hash user's password before storing user to database.  

UserSchema.pre('save', function (next) {
    var user = this;

    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) return next();

    // generate a salt
    bcrypt.genSalt(10, function (err, salt) {
        if (err) return next(err);

        // hash the password using our new salt
        bcrypt.hash(user.password, salt, function (err, hash) {
            if (err) return next(err);

            // override the cleartext password with the hashed one
            user.password = hash;
            next();
        });
    });
});

const User = mongoose.model("User", UserSchema)

module.exports = User;