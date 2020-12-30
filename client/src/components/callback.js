import React, { Component } from 'react';
import Axios from 'axios';

class Callback extends Component {
    constructor(props) {
        super(props)

        this.state = {
            authProcessIncomplete: true
        }
    }

    componentDidMount () {

        if (this.state.authProcessIncomplete) {

            this.setState({authProcessIncomplete: false})

            Axios.post("/user/spotifyAuth" + this.props.location.search)
                .then(response => {
                    console.log(response)

                    window.location = response.data.redirect
                })
                .catch(error => {
                    console.log(error)
                })
        }

    }
    render() {
        return (<div></div>)
    }
}

export default Callback;