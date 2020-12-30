import React, { Component } from 'react';
import Logo from "../logo.svg"
import Axios from "axios";

class LogIn extends Component {

    constructor(props) {
        super(props)
        this.state = {
            username: "",
            password: ""
        }
        this.resetUserInputs = this.resetUserInputs.bind(this)
        this.handleInputChange = this.handleInputChange.bind(this)
        this.handleFormSubmit = this.handleFormSubmit.bind(this)
    }

    resetUserInputs = () => {
        this.setState({
            username: "",
            password: "",
        });
    };

    handleInputChange = event => {
        // Getting the value and name of the input which triggered the change
        const { name, value } = event.target;

        // Updating the input's state
        this.setState({
            [name]: value
        });
    };

    handleFormSubmit = event => {
        event.preventDefault()

        const payload = {
            username: this.state.username,
            password: this.state.password
        }

        Axios
            .post("/user/login", payload)
            .then(response => {
                console.log("login response: ")
                console.log(response)
                if (response.status === 200) {
                    console.log("200")

                    if (response.data.redirect === "/slackAuth") {
                        window.location = "/addSlack"
                    }
                    else if (response.data.redirect === "/login") {
                        window.location = "/login"
                    }
                }
            })
            .catch(error => {
                console.log("login error ")
                console.log(error);
                window.location = "/login"
            })

    }

    render() {
        return (
            <div className="container h-100">
                <div className="d-flex justify-content-center h-100">
                    <div className="user_card_login">
                        <div className="d-flex justify-content-center">
                            <div className="brand_logo_container_login">
                                <img src={Logo} className="brand_logo_login" alt="logo"></img>
                            </div>
                        </div>
                        <div className="d-flex justify-content-center form_container_login">
                            <form className="login">
                                <div className="input-group mb-3">
                                    <div className="input-group-append">
                                        <span className="input-group-text"><i className="fas fa-user"></i></span>
                                    </div>
                                    <input
                                        value={this.state.username}
                                        name="username"
                                        onChange={this.handleInputChange}
                                        type="text"
                                        className="form-control input_user_login"
                                        placeholder="username"
                                    >
                                    </input>
                                </div>
                                <div className="input-group mb-2">
                                    <div className="input-group-append">
                                        <span className="input-group-text"><i className="fas fa-key"></i></span>
                                    </div>
                                    <input
                                        value={this.state.password}
                                        name="password"
                                        onChange={this.handleInputChange}
                                        type="password"
                                        className="form-control input_pass_login"
                                        placeholder="password"
                                    >
                                    </input>
                                </div>
                                <div className="d-flex justify-content-center mt-3 login_container">
                                    <button onClick={this.handleFormSubmit} className="btn login_btn">Login</button>
                                </div>
                            </form>

                        </div>
                        <div className="mt-4">
                            <div className="d-flex justify-content-center links">
                                Don't have an account? <a href="/register" className="ml-2">Sign Up</a>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        )
    }
}

export default LogIn;