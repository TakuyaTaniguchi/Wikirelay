import React, { Component } from 'react'
import firebase from './firebase'
import './App.css'

import axios from 'axios';


class App extends Component {
  state = {
    user: null
  }

  componentDidMount() {
    firebase.auth().onAuthStateChanged(user => {
      this.setState({ user })
    })
  }

  login() {
    const provider = new firebase.auth.GoogleAuthProvider()
    firebase.auth().signInWithRedirect(provider)
  }

  logout() {
    firebase.auth().signOut()
  }
  getApi() {
    const url = 'https://ja.wikipedia.org/w/api.php?format=json&origin=*&action=query&prop=links&titles=東京';
    axios
    .get(url)
    .then(res => {
      const data = res.data;
      const NextLinkKey = data.continue.plcontinue;
      const pgaeId = NextLinkKey.split('|')[0];
      const links = data.query.pages[pgaeId];
      return links;
    })
    .catch(error => {
      // 非同期処理失敗。呼ばれない
      console.log(error);
      console.log("dataError");
    });
  }

  render() {
    return (
      <div className="App">
        <p className="App-intro">
          UID: {this.state.user && this.state.user.uid}
        </p>

        {this.state.user ? (
          <button onClick={this.logout}>Google Logout</button>
        ) : (
          <button onClick={this.login}>Google Login</button>
        )}
        <h1>WikiAPI</h1>
        <ul>
          <li>
            <button onClick={this.getApi}>get</button>
          </li>
        </ul>
      </div>
    )
  }
}

export default App