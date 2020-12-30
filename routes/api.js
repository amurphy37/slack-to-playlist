const express = require("express")
const router = express.Router()

const keys = require("../keys")

// Setting up Spotify app credentials
const my_client_id = keys.spotifyClientID
const client_secret = keys.spotifyClientSecret

const inProduction = process.env.NODE_ENV === "production"
var redirect_uri

if (inProduction) {
    redirect_uri = "https://slacktoplaylist.herokuapp.com/spotifyCallback"
}
else {
    redirect_uri = "http://localhost:3000/spotifyCallback"
}
// Accessing Axios for http requests
const Axios = require("axios")
const qs = require("qs")

// Accessing Spotify Web API Node module
const Spotify = require("spotify-web-api-node")

const spotifyApi = new Spotify({
    clientId: my_client_id,
    clientSecret: client_secret,
    redirectUri: redirect_uri
});

// Creating our JSON Web Token for Apple Music authorization

const fs = require("fs")
const jwt = require("jsonwebtoken")

const privateKey = fs.readFileSync("authKey.p8").toString();
const teamId = keys.appleTeamID
const keyId = keys.appleKeyID

// Accessing our models and passport for login/signup 

const db = require("../models")
const passport = require("../config/passport")

// Using the passport.authenticate middleware with our local strategy.
// If the user has valid login credentials, send them to the members page.
// Otherwise the user will be sent an error
router.post(
    "/login",
    passport.authenticate("local"),
    (req, res) => {
        console.log(req.user)
        if (req.user || req.session.user) {
            var redir = { redirect: "/slackAuth" };
            return res.json(redir)
        }
        else {
            var redir = { redirect: "/login" }
            return res.json(redir)
        }
    });

// Route for signing up a user. The user's password is automatically hashed and stored securely thanks to
// how we configured our Mongoose User Model. If the user is created successfully, proceed to log the user in,
// otherwise send back an error

router.post("/signup", function (req, res) {

    console.log("user signup")

    db.User.create({
        username: req.body.username,
        password: req.body.password
    })
        .then(function () {
            console.log("user successfully added")
            res.redirect(307, "/user/login")
        })
        .catch(function (err) {
            console.log(err.message)
            res.status(401).json(err);
        });
})

// Slack Authentication

router.post("/slackAuth", async (req, res) => {
    try {

        console.log(req.body)

        const slackAuthURL = "https://slack.com/api/oauth.v2.access"

        var slackRedirect_uri

        if (inProduction) {
            if (req.body.isAppAuth) {
                slackRedirect_uri = "https://slacktoplaylist.herokuapp.com/slackAppAdd"

            }
            else {
                slackRedirect_uri = "https://slacktoplaylist.herokuapp.com/slackRedir"

            }
        }

        else {
            if (req.body.isAppAuth) {
                slackRedirect_uri = "http://localhost:3000/slackAppAdd"

            }
            else {
                slackRedirect_uri = "http://localhost:3000/slackRedir"

            }
        }

        const body = qs.stringify({
            code: req.body.code,
            client_id: keys.slackClientID,
            client_secret: keys.slackClientSecret,
            redirect_uri: slackRedirect_uri
        })

        const slackRequest = await Axios.post(slackAuthURL, body, { headers: 
            {
            "Content-Type": "application/x-www-form-urlencoded"
            }
        })

        let responseBody
        let userUpdate


        if (req.body.isAppAuth) {

            userUpdate = {
                slackTeamAuthToken: slackRequest.data.access_token,
                slackAuthToken: slackRequest.data.authed_user.access_token,
                slackUserID: slackRequest.data.authed_user.id,
                slackTeamID: slackRequest.data.team.id,
                slackTeamName: slackRequest.data.team.name
            }

            responseBody = {
                redir: "/slackAuth"
            }
        }

        else {

            userUpdate = {
                slackAuthToken: slackRequest.data.authed_user.access_token,
                slackUserID: slackRequest.data.authed_user.id,
                slackTeamID: slackRequest.data.team.id
            }

            responseBody = {
                redir: "/home"
            }

        }

        const filter = { _id: req.user._id }

        await db.User.findOneAndUpdate(filter, userUpdate, { new: true })

        res.json(responseBody)
    
    }
    catch (error) {
        console.log(error)
    }
})

router.get("/home", (req, res) => {
    console.log(req)
})

router.get("/spotifyLogin", function (req, res) {
    function generateRandomString(length) {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    const state = generateRandomString(16);
    var scopes = ['user-read-private', 'user-read-email', 'playlist-read-private', 'playlist-read-collaborative', 'playlist-modify-public', 'playlist-modify-private']
    res.cookie("STATE_KEY", state);
    const authURL = spotifyApi.createAuthorizeURL(scopes, state)
    const response = {
        url: authURL
    }

    res.json(response)
})


router.post('/spotifyAuth', async (req, res) => {
    const { code, state } = req.query
    const storedState = req.cookies ? req.cookies.STATE_KEY : null;
    // state state validation
    if (state === null || state !== storedState) {
        res.redirect('/#/error/state mismatch');
    } else {
        // the authorization code described above
        // ...

        try {
            const spotAuth = await spotifyApi.authorizationCodeGrant(code)
            
            const { expires_in, access_token, refresh_token } = spotAuth.body;
            
            await spotifyApi.setAccessToken(access_token);
            await spotifyApi.setRefreshToken(refresh_token);

            const update = {
                spotifyAccessToken: access_token,
                spotifyRefreshToken: refresh_token
            }

            const filter = { _id: req.user._id }

            const updatedUser = await db.User.findOneAndUpdate(filter, update ,
                { 
                    new: true 
                })

            const response = {
                user: updatedUser,
                redirect: "/home"
            }

            res.json(response);

            }

            catch (error) {
                console.log(error.message)
            }
    }
});

// Account regarding the app in apple developer console - setting as global variables

router.post("/appleProfUpdate", async (req, res) => {

    try {

    const code = req.body.appleCode

        if (req.user) {

            const filter = {_id: req.user._id}
            const update = {
                appleToken: code
            }

            const updatedUser = await db.User.findOneAndUpdate(filter, update,
                {
                    new: true
                })

            console.log(updatedUser)

            res.redirect("/user/slack")
        }
        else {
            // User not logged in

            console.log("User not logged in. Please click login and submit credentials. Authenticate once logged in")
        }
    }
    catch (error) {
            console.log(error)
    }

})

router.get("/slack", (req, res) => {
    res.status(200).send("success!")
})

router.post("/slackEvents", async (req, res) => {
    try {

        // Adding conditional if request contains Slack Challenge. If so, we just need to send back in order to authorize the route. Otherwise, continue with core code as challenge will only be sent upon initial test.
        if (req.body.challenge) {
            console.log(req)
            var response = {
                "challenge": req.body.challenge
            }
            res.status(200)
            res.json(response)

        }


        else {
        res.status(200).send("Success!")

        // Pulling values from lines 37-39 for teamId, privateKey and keyID, which are stored in a separate file not pushed to Github

        const newjwtToken = jwt.sign({}, privateKey, {
            algorithm: "ES256",
            expiresIn: "180d",
            issuer: teamId,
            header: {
                alg: "ES256",
                kid: keyId
            }
        });

        const slackTeamID = req.body.team_id
        const channelID = req.body.event.channel
        const filter = {
            slackTeamID: slackTeamID,
            slackTeamAuthToken: { $ne: null }
        }

        const slackGroupUser = await db.User.findOne(filter).exec()

        const slackToken = slackGroupUser.slackTeamAuthToken

        const slackChannelURL = "https://slack.com/api/conversations.info?token="

        const queryURL = slackChannelURL + slackToken + "&channel=" + channelID + "&pretty=1"

        const slackChannelCall = await Axios.get(queryURL)

        console.log(slackChannelCall.data)
    
        let channelName = slackChannelCall.data.channel.name
        let spotifyTrackID
        let appleTrackId


        // GETTING SPOTIFY TRACK ID AND APPLE MSUIC TRACK ID FOR BOTH APPLE MUSIC AND SPOTIFY LINK SHARES


        // Running through case where link is a spotify song and setting spotify track ID

        if (req.body.event.links[0].domain === "open.spotify.com") {

            console.log("Spotify Link Share")

            // First determining track id which can be acquired directly by splitting the share url, as it's included in the url.
            const trackURL = req.body.event.links[0].url
            const questionMarkIndex = []
            for (i = 0; i < trackURL.length; i++) {
                if (trackURL.charAt(i) === "?") {
                    questionMarkIndex.push(i)
                }
            }
            spotifyTrackID = trackURL.substring(31, questionMarkIndex[0])

            // Querying Spotify to get song and artist information. Grabbing authentication key via refresh code from a user in databse

            const spotUser = await db.User.findOne({
                "spotifyAccessToken": { $ne: null }
            })

            // Setting refresh token saved for this user
            await spotifyApi.setRefreshToken(spotUser.spotifyRefreshToken)
            // Getting a new access token via specific refresh token for this user.
            const tokenRequest = await spotifyApi.refreshAccessToken()
            // Setting constant equal to the newly acquired access token and then setting the access token to our instantiated spotify API 
            const spotAccessToken = tokenRequest.body.access_token

            // Querying spotify api to get back song information

            const spotTrackURL = "https://api.spotify.com/v1/tracks/" + spotifyTrackID

            const spotTrackInfo = await Axios.get(spotTrackURL, {
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${spotAccessToken}`
                }
            })

            // Taking isrc code for song which can be used to query Apple Music database for corresponding song in AM

            const isrc = spotTrackInfo.data.external_ids.isrc

            aMusicQueryURL = "https://api.music.apple.com/v1/catalog/us/songs?filter[isrc]=" + isrc

            const appleMusicQuery = await Axios.get(aMusicQueryURL, {
                headers: {
                    Authorization: `Bearer ${newjwtToken}`
                }
            })

            if (appleMusicQuery.data.data[0] === undefined) {
                console.log("No matching song in Apple Music");
            }
            else {
                appleTrackId = appleMusicQuery.data.data[0].id
            }
        }

        // Find Spotify Track ID and Apple Track ID if song shared is Apple Music song

        else if (req.body.event.links[0].domain === "music.apple.com") {
            console.log("Apple Music Share")
            const urlArr = req.body.event.links[0].url.split("i=")
            appleTrackId = urlArr[1]

            const searchQueryURL = "https://api.music.apple.com/v1/catalog/us/songs/" + appleTrackId

            const appleMusicQuery = await Axios.get(searchQueryURL,  {
                headers: {
                    Authorization: `Bearer ${newjwtToken}`
                }
            })

            const isrc = appleMusicQuery.data.data[0].attributes.isrc

            const spotQueryURL = "https://api.spotify.com/v1/search?type=track&q=isrc:" + isrc

            // Querying Spotify to get song and artist information. Grabbing authentication key via refresh code from a user in database

            const spotUser = await db.User.findOne({
                "spotifyAccessToken": { $ne: null }
            })

            // Setting refresh token saved for this user
            await spotifyApi.setRefreshToken(spotUser.spotifyRefreshToken)
            // Getting a new access token via specific refresh token for this user.
            const tokenRequest = await spotifyApi.refreshAccessToken()
            // Setting constant equal to the newly acquired access token and then setting the access token to our instantiated spotify API 
            const spotAccessToken = tokenRequest.body.access_token

            // Querying spotify api to get back song information

            const spotTrackInfo = await Axios.get(spotQueryURL, {
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${spotAccessToken}`
                }
            })

            if (spotTrackInfo.data.tracks.items[0]) {
                spotifyTrackID = spotTrackInfo.data.tracks.items[0].id
            }
        }

        // Else case - netiher an apple music nor spotify link - alert to send either apple or spotify link

        else {
            console.log("Not a valid link")
        }

        // ADDING SONG TO PLAYLISTS SECTION

        // Spotify users section. This loops through all users that have authenticated Spotify.
        // We populate the playlists saved for users and loop through all playlists.
        // If there is a match between channel name and playlist name, the playlist already exists. We then add the song to that playlist in Spotify
        // If there is no match between channel name and playlist name, this is a new channel/playlist, and we first create the playlist in spotify. Then we add the song to that playlist in Spotify. 

        // Async request to populate users within the slack team that have authenticated spotify account. Request populates the playlist documents that are saved for users.

        const spotDbUsers = await db.User.find({
            "spotifyAccessToken": { $ne: null },
            "slackTeamID": slackTeamID
        })
            .populate({ path: "playlists" })

        console.log(spotDbUsers)

        // Looping through each of the Spotfiy authenticated users.

        for (let i=0; i < spotDbUsers.length; i++) {

            var user = spotDbUsers[i]

            await spotifyApi.setRefreshToken(user.spotifyRefreshToken)
            // Getting a new access token via specific refresh token for this user.
            const tokenRequest = await spotifyApi.refreshAccessToken()
            // Setting constant equal to the newly acquired access token and then setting the access token to our instantiated spotify API 
            const accessToken = tokenRequest.body.access_token
            await spotifyApi.setAccessToken(accessToken)

            // Using our instantiated spotify API to get user info, and setting spotify user ID as a constant.

            const spotUser = await spotifyApi.getMe()
            const userID = spotUser.body.id

            // setting boolean field as false. This field will only be updated to true if there is a match between Slack channel name where link was shared and playlist name saved for user.

            let playlist_exists = false
            let playlistID

            // Getting list of playlists in Spotify for user. If a playlist shares the same name as the Slack channel name, we updated our field above to true and set its id equal to our variable above.

            let playlistQueryURL = "https://api.spotify.com/v1/users/" + userID + "/playlists?limit=50"

            const userPlaylists = await Axios.get(playlistQueryURL, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            })
            
            console.log(userPlaylists)
            const playlists = userPlaylists.data.items

            for (let i=0; i < playlists.length; i++) {
                let playlistName = playlists[i].name
                if (playlistName===channelName) {
                    playlist_exists = true
                    playlistID = playlists[i].id
                }
            }

            // If playlist doesn't exist, we need to first create the playlist in Spotify before adding the song.

            if (playlist_exists === false) {

                const userPlaylists = await db.Playlists


                const newPlaylistURL = "https://api.spotify.com/v1/users/" + userID + "/playlists"
                const data = { name: channelName }
                const newPlaylist = await Axios.post(newPlaylistURL, data, {
                    headers: {
                        "Accept": "application/json",
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${accessToken}`
                    }
                })

                playlistID = newPlaylist.data.id

                const dbPlaylist = await db.Playlist.create({
                    name: channelName,
                    spotifyId: playlistID
                })

                await db.User.findByIdAndUpdate(user._id, { $push: { playlists: dbPlaylist._id } }, { new: true })
            }

            // ELSE CASE - Playlist already exists, and therefore we were able to populate playlistID on line 384
            else {
                console.log("playlist already exists")
            }

            // Add track to playlist using playlist ID from line 364 and Spotify track ID from line 215

            if (spotifyTrackID) {

                const spotTrackURL = "https://api.spotify.com/v1/tracks/" + spotifyTrackID

                const spotTrackInfo = await Axios.get(spotTrackURL, {
                    headers: {
                        "Accept": "application/json",
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${accessToken}`
                    }
                })

                const addTrack = await spotifyApi.addTracksToPlaylist(playlistID, [spotTrackInfo.data.uri])
                console.log(addTrack)
            }

        }

        //  APPLE MUSIC USERS SECTION
        // Querying database to find all users within a given team with a value for appleToken. Then, looping through all users and adding song to playlist.
        
            const appleUsers = await db.User.find({
                "appleToken": { $ne: null},
                "slackTeamID": slackTeamID
            })
                .populate({ path: "playlists" })


            console.log(appleUsers)

        // Looping through each user and adding to playlist. If playliste exists, take id on playlist object. If not, create playlist in apple and store playlist id for future use. Add song to playlist
            for (let i=0; i < appleUsers.length; i++) {

                var user = appleUsers[i]

                const userToken = user.appleToken

                let playlist_exists = false
                let playlistID

                const playlistURL = "https://api.music.apple.com/v1/me/library/playlists?limit=100"



                const headers = {
                    "Authorization": `Bearer ${newjwtToken}`,
                    "Music-User-Token": userToken
                }

                const userPlaylists = await Axios.get(playlistURL, { headers: headers })
                let playlists = userPlaylists.data.data


                // Looping through each saved playlist for each user. If a playlist shares the same name as the Slack channel name, we updated our field above to true.

                for (let i=0; i < playlists.length; i++) {
                    let slackChannelName = channelName
                    if (playlists[i].attributes.name === slackChannelName) {
                        playlist_exists = true
                        playlistID = playlists[i].id
                    }
                }

                // If the playlist already exists on the user profile, then we add the song to the existing playlist in Spotify.

                if (playlist_exists === false) {

                    const dbPlaylists = user.playlists

                    for (i=0; i < dbPlaylists.length; i++) {
                        let slackChannelName = channelName
                        if (dbPlaylists[i].name===slackChannelName) {
                            playlist_exists = true
                            playlistID = dbPlaylists[i].appleMusicId
                        }
                    }

                    if(!playlistID) {
                        console.log("playlist doesn't exist yet")

                        const playlistURL = "https://api.music.apple.com/v1/me/library/playlists"

                        const body = {
                            attributes: {
                                "name": channelName,
                                "description": "shared songs from Slack group"
                            }
                        }

                        const newPlaylist = await Axios.post(playlistURL, body, { headers: headers })

                        playlistID = newPlaylist.data.data[0].id

                        const dbPlaylist = await db.Playlist.create({
                            name: channelName,
                            appleMusicId: playlistID
                        })

                        await db.User.findByIdAndUpdate(user._id, { $push: { playlists: dbPlaylist._id } }, { new: true })

                    }

                }

                // ELSE CASE - Playlist doesn't exist. We first create a new playlist on the user's Apple Music account, then add track to the new playlist.

                else {
                    console.log("playlist exists")
                }

                if (appleTrackId) {                

                    const trackURL = "https://api.music.apple.com/v1/me/library/playlists/" + playlistID + "/tracks"

                    const body = {
                        "data": [
                            {
                                "id": appleTrackId
                            }
                        ]
                    }

                    const addedTrack = await Axios.post(trackURL, body, { headers: headers })

                    console.log(addedTrack)

                }
                

            }
            
        }
    }
    catch (error) {
        console.log(error)
    }
})


router.get("/", (req, res) => {
    if (req.user) {
        res.json(req.user)
    }
    else {
        res.json("no user logged in")
    }
});

module.exports = router;