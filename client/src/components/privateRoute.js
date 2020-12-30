import React, { Component } from "react"
import { Route, Redirect } from "react-router-dom"

import Auth from "./userAuth"

class PrivateRoute extends Component {
    constructor(props) {
        super(props)
        this.state = {
            loading: true,
            isAuthenticated: false
        }
    }

    componentDidMount() {
        Auth.getAuth()
            .then(isAuthenticated => {
                console.log(isAuthenticated)
                this.setState({
                    loading: false,
                    isAuthenticated: isAuthenticated
                })
            })
    }

    render() {
        const { component: Component, ...rest } = this.props
        return (
            <Route
                {...rest}
                render={props =>
                    this.state.isAuthenticated ? (
                        <Component {...props} />
                    ) : (
                            this.state.loading ? (
                                <div>LOADING</div>
                            ) : (
                                    <Redirect to="/" />
                                )
                        )
                }
            />
        )
    }
}

export default PrivateRoute