import React, { Component } from 'react';
import Axios from 'axios';

class SlackRedir extends Component {

    constructor (props) {
        super(props)
        this.state = {
            authProcessIncomplete: true
        }
    }

    componentDidMount = () => {

        if (this.state.authProcessIncomplete) {
            const search = window.location.search
            const searchValArr = search.split("=")
            const slackCodeandState = searchValArr[1]
            const codeStateArr = slackCodeandState.split("&")
            const slackCode = codeStateArr[0]

            const body = { 
                code: slackCode,
                isAppAuth: false
            }

           this.setState({authProcessIncomplete: false})

            Axios.post("/user/slackAuth", body)
                .then(response => {
                    console.log(response)
                    window.location = response.data.redir
                })

        }

        else {
            console.log("second redirect")
        }
    }


    render() {
        return (
            <div>
            </div>
        )
    }
}

export default SlackRedir;