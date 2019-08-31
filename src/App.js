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
      headTitle: '',
      NextLinkKey: '',
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
  getApiNextPage = (NextLinkKey) => {
    axios
    .get(`https://ja.wikipedia.org/w/api.php?format=json&origin=*&action=query&prop=links&titles=ハリー・ポッターシリーズ&plcontinue=${NextLinkKey}`)
    .then(res => {
      const data = res.data;
      console.log(data);
      const NextLinkKey = data.continue.plcontinue;
      const pgaeId = NextLinkKey.split('|')[0];
      const links = data.query.pages[pgaeId].links;
      this.setState({ NextLinkKey: NextLinkKey });
      this.setState({ links: this.state.links.concat(links)});
    })
    .catch(error => {
      // 非同期処理失敗。呼ばれない
      console.log(error);
      console.log("dataError");
    });
  }
  getApi = (url,e) => {
    console.log(e)
    axios
    .get('https://ja.wikipedia.org/w/api.php?format=json&origin=*&action=query&prop=links&titles=ハリー・ポッターシリーズ')
    .then(res => {
      const data = res.data;
      const NextLinkKey = data.continue.plcontinue;
      console.log(NextLinkKey)
      const pgaeId = NextLinkKey.split('|')[0];
      const headTitle = data.query.pages[pgaeId].title;
      const links = data.query.pages[pgaeId].links;
      this.setState({ links: links });
      this.setState({ headTitle: headTitle });
      this.setState({ NextLinkKey: NextLinkKey });

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
          <a href="/" data-title={link.title}>{link.title}</a>
        </li>
      );
    });
    return (
      <ul>
        {titleList}
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
        <h2>{this.state.headTitle}</h2>
        <ul>
          <li>
            <button onClick={() => this.getApi()}>get</button>
            <button onClick={() => this.getApiNextPage(this.state.NextLinkKey)}>NextPage</button>
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
 * ローカルストレージのデータをfirabeseに保存する
 */