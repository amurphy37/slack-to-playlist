import React from 'react';
import './App.css';
import { Layout, Header, Navigation, Content } from 'react-mdl';
import Main from './components/main';
import { Link } from "react-router-dom";

function App() {
  return (
    <div className="AppParentDiv">
      <Layout>
        <Header className="header-color" title={<Link style={{ textDecoration: 'none', color: 'white' }} to="/">SlackToPlaylist</Link>} scroll>
          <Navigation>
            <Link to="/register">Register Today</Link>
            <Link to="/login">Log In</Link>
          </Navigation>
        </Header>
        <Content>
          <div className="page-content" />
          <Main />
        </Content>
      </Layout>
    </div>
  );
}

export default App;
