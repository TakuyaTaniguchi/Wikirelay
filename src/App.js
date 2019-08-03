import React from 'react'
// import { render } from "react-dom"
import firebase from './firebase'
import './App.css'

import axios from 'axios';


class App extends React.Component {
  constructor(){
    super();
    this.state = {
      user: null,
      urllist: [],
      hoge: 'aaaa'
    }
  }

  componentDidMount() {
    console.log('moune')
    firebase.auth().onAuthStateChanged(user => {
      this.setState({ user })
    })
  }

  login() {
    console.log('login')
    const provider = new firebase.auth.GoogleAuthProvider()
    firebase.auth().signInWithRedirect(provider)
  }

  logout() {
    console.log('logout')
    firebase.auth().signOut()
  }
  getApi = (url) => {
    axios
    .get('https://ja.wikipedia.org/w/api.php?format=json&origin=*&action=query&prop=links&titles=東京')
    .then(res => {
      const data = res.data;
      const NextLinkKey = data.continue.plcontinue;
      const pgaeId = NextLinkKey.split('|')[0];
      const links = data.query.pages[pgaeId].links;
      console.log(links)
      this.setState({ hoge: 'bbbbb' });
    })
    .catch(error => {
      // 非同期処理失敗。呼ばれない
      console.log(error);
      console.log("dataError");
    });
  }
  list(list) {
    console.log(list)
    // const imageList = list.map(title => {
    //   return (
    //     <li>
    //       {title}
    //     </li>
    //   );
    // });
    // return (
    //   <ul>
    //     <code>{imageList}</code>
    //   </ul>
    // );
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
          
          <h2>{this.state.urllist}</h2>
        </ul>
      </div>
    )
  }
}

export default App