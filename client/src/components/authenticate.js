import React, { Component } from 'react';
import { Button } from 'reactstrap';
import Axios from "axios"

class Authenticate extends Component {
    constructor (props) {
        super ()
        this.state = {}

        this.handleSpotifyAuth = this.handleSpotifyAuth.bind(this)
        this.handleAppleAuth = this.handleAppleAuth.bind(this)
    }

    handleAppleAuth = async () => {
        try{

            let music = window.MusicKit.getInstance()

            const authorize = await music.authorize()

            const body = {
                appleCode: authorize
            }

            if(body.appleCode) {
                await Axios.post("/user/appleProfUpdate", body)
            }

            else {
                console.log("No Authorization code - post request not submitted")
            }

        }
        catch (err) {
            console.log(err)
        }
    }

    handleSpotifyAuth = () => {


        Axios.get("/user/spotifyLogin")
            
            .then(response => {
                window.location = response.data.url
            
            })
            .catch(err => {
                console.log("Spotify authentication error")
                console.log(err)
            })
    }

    render() {
        return (
            <div className="authContainer" id="landing-container">
                <div>
                    <h2>Final Step: Link Music Accounts</h2>
                    <br></br>
                    <br></br>
                    <h3>Click below to link your Spotify or Apple Music accounts.</h3>
                    <Button onClick={this.handleSpotifyAuth} className="authBtn">Link to Spotify</Button>
                    <Button onClick={this.handleAppleAuth} className="authBtn" label="Link Apple Music">Link to Apple Music</Button>
                    
                </div>
            </div>
        )
    }
}

export default Authenticate;