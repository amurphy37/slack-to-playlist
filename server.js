// Import npm packages
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const path = require('path');
const passport = require("./config/passport")
const session = require("express-session")
const cookieParser = require("cookie-parser")

// Setting up our express app and setting up port for local and heroku hosted

const inProductionEnvironment = process.env.NODE_ENV === "production"

const app = express()
const PORT = process.env.PORT || 8080

// Setting Mongoose options to be passed as callback in our mongoose connect function. 

let options = {}

let connectionString

if (inProductionEnvironment) {

    var username = "amurphy37"
    var password = "H49AQHP-xBLwmD9"
    var hosts = 'iad2-c8-2.mongo.objectrocket.com:53402,iad2-c8-1.mongo.objectrocket.com:53402,iad2-c8-0.mongo.objectrocket.com:53402';
    var database = 'SlackToPlaylist';
    options = '?replicaSet=70a4cbf98bb7498cb3f1e902785ec3c1&retryWrites=false';
    connectionString = 'mongodb://' + username + ':' + password + '@' + hosts + '/' + database + options;

    // Connecting Mongoose and displaying in console that it's connected on success
    mongoose.connect(connectionString, function (err, db) {
        if (err) {
            console.log('Error: ', err);
        } else {
            console.log('Connected!');
        }
    })
}

else {
    // Setting our Mongo URI dynamically based on whether we're hosting locally or on Heroku. 
    connectionString = 'mongodb://127.0.0.1:27017/slack_to_playlist'

    // Connecting Mongoose and displaying in console that it's connected on success
    mongoose.connect(connectionString)
}

const db = mongoose.connection

db.on("error", console.error.bind(console, "Connection Error: "))

db.once("open", function () {
    console.log("Successfully connected to MongoDb!")
})

// Data parsing
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Setting up cookie-parser to have cookies included in requests

app.use(cookieParser())

// We need to use sessions to keep track of our user's login status
app.use(session({ secret: "keyboard cat", resave: false, saveUninitialized: true }));
app.use((req, res, next) => {
    // console.log("req.session", req.session);

    next()
});
app.use(passport.initialize());
app.use(passport.session());

// Accessing our routes

const routes = require("./routes/api")

// HTTP request logger
app.use(morgan('tiny'));
app.use('/user', routes);

// Production Mode
if (inProductionEnvironment) {
    app.use(express.static('client/build'))

    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "/client/build/index.html"))
    })
}

// Tell the user which port app is running on when successfully up and running.
app.listen(PORT, console.log(`Server is starting at ${PORT}`))