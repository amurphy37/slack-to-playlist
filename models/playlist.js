const mongoose = require("mongoose")

const Schema = mongoose.Schema

const PlaylistSchema = new Schema ({
    name: {
        type: String
    },
    spotifyId: {
        type: String
    },
    appleMusicId: {
        type: String
    }
})

const Playlist = mongoose.model("Playlist", PlaylistSchema)

module.exports = Playlist;