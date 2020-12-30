import React, { Component } from "react";
import Logo from "../logo.svg"
import Axios from "axios";

class Register extends Component {
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
            password: ""
        })
    }

    // Function to edit state values upon input change
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

        const userPayload = {
            username: this.state.username,
            password: this.state.password
        }

        Axios.post("user/signup", userPayload)
            .then(function (response) {
                // If we get back a response from our database, we determine this to be successful and can redirect the user to the home screen.
                if (response.data.redirect) {
                    console.log("successful signup")
                    window.location = "/addSlack"
                } else {
                    console.log("Sign-up error");
                }
            })
            .catch(err => {
                console.log("Sign up server error: ")
                console.log(err);
            })
    }

    render() {
        return (
            <div className="container h-100">
                <div className="d-flex justify-content-center h-100">
                    <div className="user_card_signup">
                        <div className="d-flex justify-content-center">
                            <div className="brand_logo_container_signup">
                                <img src={Logo} className="brand_logo_signup" alt="logo"></img>
                            </div>
                        </div>
                        <div className="d-flex justify-content-center form_container_signup">
                            <form className="signup">
                                <div className="form-group">
                                    <label>Username</label>
                                    <input
                                        value={this.state.username}
                                        name="username"
                                        onChange={this.handleInputChange}
                                        type="text"
                                        className="form-control"
                                        placeholder="Username">

                                    </input>
                                </div>
                                <div className="form-group">
                                    <label>Password</label>
                                    <input
                                        value={this.state.password}
                                        name="password"
                                        onChange={this.handleInputChange}
                                        type="password"
                                        className="form-control input_pass"
                                        placeholder="Password">

                                    </input>
                                </div>
                                <button onClick={this.handleFormSubmit} className="btn btn-primary signup_btn">Sign Up</button>
                            </form>
                        </div>
                        <div className="mt-4">
                            <div className="d-flex justify-content-center links">
                                <a href="/login" className="ml-2">Have an account?</a>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        )
    }
}

export default Register;
