import React, { Component } from 'react';
import { Button } from 'reactstrap';
import config from "../constants"

const hrefDev = "https://slack.com/oauth/v2/authorize?client_id=" + config.client_id + "&scope=links:read,channels:read,groups:read,mpim:read,im:read&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2FslackAppAdd&user_scope=channels:history,links:read,channels:read,groups:read,mpim:read,im:read"
const hrefProd = "https://slack.com/oauth/v2/authorize?client_id=" + config.client_id + "&scope=links:read,channels:read,groups:read,mpim:read,im:read&redirect_uri=https%3A%2F%2Fslacktoplaylist.herokuapp.com%2FslackAppAdd&user_scope=channels:history,links:read,channels:read,groups:read,mpim:read,im:read"



class SlackApp extends Component {
    render() {

        return (
            <div>
                <div>
                    <h2 className="addToSlack">Add SlackToPlaylist to your Slack Instance</h2>
                    {config.url.API_URL === "http://localhost:3000" ? 
                        (
                            <a href={hrefDev}>
                                <img className="addToSlackButton" alt="Add to Slack" height="40" width="139" src="https://platform.slack-edge.com/img/add_to_slack.png" srcSet="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x" />
                            </a>
                        ) :
                        (
                            <a href={hrefProd}>
                                <img className="addToSlackButton" alt="Add to Slack" height="40" width="139" src="https://platform.slack-edge.com/img/add_to_slack.png" srcSet="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x" />
                            </a>
                        )}
                </div>
                <div>
                    <p className = "addToSlackParagraph">Once you've connected the app to Slack, click below to authenticate your slack account. Make sure to select the instance that you've connected.
                                                        If you've already connected your account, ignore this step and click below to sign in with Slack.</p>
                    <Button href="/slackAuth" className="addToSlackBtn">Sign in with Slack</Button>
                </div>
            </div>
        )


    }
}

export default SlackApp;