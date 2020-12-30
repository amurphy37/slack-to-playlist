import React from 'react';
import { Switch, Route } from 'react-router-dom';
import LandingPage from "./landingpage";
import Authenticate from "./authenticate";
import Callback from "./callback"
import SlackApp from "./addToSlack"
import SlackAuth from "./slackAuth"
import SlackRedir from "./slackRed"
import Register from './register';
import LogIn from './login';
import PrivateRoute from "./privateRoute";
import SlackAppRedirect from './slackAppRedirect';

function Main (props) {
    return (
        <Switch>
            <Route exact path="/" component={LandingPage} />
            <Route exact path="/register" component={Register} />
            <Route exact path="/login" component={LogIn} />
            <PrivateRoute exact path="/addSlack" component={SlackApp} />
            <Route exact path="/slackAppAdd" component={SlackAppRedirect} />
            <Route exact path="/slackAuth" component={SlackAuth} />
            <Route exact path="/slackRedir" component={SlackRedir} />
            <PrivateRoute exact path="/home" component={Authenticate} />
            <PrivateRoute exact path="/spotifyCallback" component={Callback} />
            <PrivateRoute exact path="/user/slack" component={Authenticate} />
        </Switch>
    )

}

export default Main;