import React, { Component } from 'react';
import config from "../constants"

const hrefProd = "https://slack.com/oauth/v2/authorize?user_scope=identity.basic,identity.email,identity.team&client_id=" + config.client_id + "&redirect_uri=https%3A%2F%2Fslacktoplaylist.herokuapp.com%2FslackRedir"
const hrefDev = "https://slack.com/oauth/v2/authorize?user_scope=identity.basic,identity.email,identity.team&client_id=" + config.client_id + "&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2FslackRedir"



class SlackAuth extends Component {
    render() {
            
            return (
                <div>
                    <h2 className="slackContainer">First Step: Link your Slack account where SlackToPlaylist has been activated</h2>
                    {config.url.API_URL === "http://localhost:3000" ?
                        (<div className="slackBtn">
                            <a href={hrefDev}>
                                <img alt=" Sign in with Slack" height="40" width="172" src="https://platform.slack-edge.com/img/sign_in_with_slack.png" srcset="https://platform.slack-edge.com/img/sign_in_with_slack.png 1x, https://platform.slack-edge.com/img/sign_in_with_slack@2x.png 2x" />
                            </a>
                        </div>)
                        :
                        (<div className="slackBtn">
                            <a href={hrefProd}>
                                <img alt=" Sign in with Slack" height="40" width="172" src="https://platform.slack-edge.com/img/sign_in_with_slack.png" srcset="https://platform.slack-edge.com/img/sign_in_with_slack.png 1x, https://platform.slack-edge.com/img/sign_in_with_slack@2x.png 2x" />
                            </a>
                        </div>)
                        }
                </div>
            )

        
    }
}

export default SlackAuth;