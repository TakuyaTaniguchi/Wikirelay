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
      links: [],
      hoge: 'aaa'
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
    console.log('getAPio')
    axios
    .get('https://ja.wikipedia.org/w/api.php?format=json&origin=*&action=query&prop=links&titles=東京')
    .then(res => {
      const data = res.data;
      const NextLinkKey = data.continue.plcontinue;
      const pgaeId = NextLinkKey.split('|')[0];
      const links = data.query.pages[pgaeId].links;
      this.setState({ links: links });
    })
    .catch(error => {
      // 非同期処理失敗。呼ばれない
      console.log(error);
      console.log("dataError");
    });
  }
  list = (links) =>{
    console.log(links)
    const titleList = links.map( (link,index) => {

      return (
        <li key={index}>
          {link.title}
        </li>
      );
    });
    return (
      <ul>
        <a href="/" >{titleList}</a>
      </ul>
    );
  }

  render() {
    return (
      <div className="App">
        <p className="App-intro">
          UID: {this.state.user && this.state.user.uid}
        </p>

        {this.state.user ? (
          <button onClick={this.logout}>Google L ogout</button>
        ) : (
          <button onClick={this.login}>Google Login</button>
        )}
        <h1>WikiAPI</h1>
        <ul>
          <li>
            <button onClick={this.getApi}>get</button>
          </li>
          {this.list(this.state.links)}
        </ul>
      </div>
    )
  }
}

export default App


/**
 * 要素を叩いた回数を持っておく
 * 叩いたtitleを取得して次のリンクを表示
 * もっと読み込むで次のリンク取得
 * 叩いた履歴はlocalstorageに保存しておく
 *  ローカルストレージのデータをfirabeseに保存する
 */