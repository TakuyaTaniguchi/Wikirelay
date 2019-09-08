import React from 'react'
import { render } from "react-dom"
import { createStore } from 'redux'
import { Provider } from 'react-redux'
import firebase from './firebase'
import './scss/style.scss'

import axios from 'axios';
import { DEFAULT_ECDH_CURVE } from 'tls'


class App extends React.Component {
  constructor(){
    super();
    this.state = {
      user: null,
      links: [],
      headTitle: '',
      NextLinkKey: '',
      NextTitle: [],
    }
  }

  componentDidMount() {
    this.getApi('ハリー・ポッターシリーズ');
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
  getApiNextWord = (e) =>{
    e.preventDefault();
    const title = e.target.getAttribute('data-title');
    this.setState({ NextTitle: title });
    this.getApi(title,e);
  }
  getApiNextPage = (NextLinkKey) => {
    axios
    .get(`https://ja.wikipedia.org/w/api.php?format=json&origin=*&action=query&prop=links&titles=${this.state.headTitle}&plcontinue=${NextLinkKey}`)
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
    console.log(url,e)
    axios
    .get(`https://ja.wikipedia.org/w/api.php?format=json&origin=*&action=query&prop=links&titles=${url}`)
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
        <li key={index} className="linkList_item">
          <a href="/" data-title={link.title} onClick={(e) => this.getApiNextWord(e)}>{link.title}</a>
        </li>
      );
    });
    return (
      <ul className="linkList">
        {titleList.slice().reverse()}
      </ul>
    );
  }

  render() {
    return (
      <div className="content">
        <div className="App">
            UID: {this.state.user && this.state.user.uid}
          {this.state.user ? (
            <button onClick={this.logout}>Google L ogout</button>
          ) : (
            <button onClick={this.login}>Google Login</button>
          )}
          <header className="header">
            <div className="header_inner">
             <h1 className="header_title">ウィキリレー</h1>
            </div>
          </header>
          <div className="wikiName">
           <h2 className="wikiName_title">{this.state.headTitle}</h2>
          </div>
          <div className="nextButton">
              {/* <button onClick={() => this.getApi()}>get</button> */}
              <button className='nextButton_button' onClick={() => this.getApiNextPage(this.state.NextLinkKey)}>NextPage</button>
          </div>
          {this.list(this.state.links)}
        </div>
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