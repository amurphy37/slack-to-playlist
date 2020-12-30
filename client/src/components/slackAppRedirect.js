import React, { Component } from 'react';
import Axios from 'axios';

class SlackAppRedirect extends Component {

    constructor(props) {
        super(props)
        this.state = {
            appAuthProcessIncomplete: true
        }
    }

    componentDidMount = () => {

        if (this.state.appAuthProcessIncomplete) {

            const search = window.location.search
            const searchValArr = search.split("=")
            const slackCodeandState = searchValArr[1]
            const codeStateArr = slackCodeandState.split("&")
            const slackCode = codeStateArr[0]

            const body = {
                code: slackCode,
                isAppAuth: true
            }

            this.setState({appAuthProcessIncomplete: false})

            Axios.post("/user/slackAuth", body)
                .then(response => {
                    console.log(response)

                    window.location = response.data.redir
                })
        }
    }


    render() {
        return (
            <div>
            </div>
        )
    }
}

export default SlackAppRedirect