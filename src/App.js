import React from 'react'
import { render } from "react-dom"
import { createStore } from 'redux'
import { Provider } from 'react-redux'
import firebase from './firebase'
// import firebaseAdmin from 'firebase-admin'
import './scss/style.scss'
import { BrowserRouter, Route, Link,Switch } from 'react-router-dom'

import axios from 'axios';
import { DEFAULT_ECDH_CURVE } from 'tls'

const database = firebase.database();
const dataRef = database.ref('/users/PhHHwu8zn1cl7FrG5qSf9mhYLZr1');

  //Route
  const User = ({ match }) => <p>User ID: {match.params.id}</p>;
  const dataArray = [{theme: 'ア〜日本',clearDate: '2019',clearWord: ['アメリカ','日本'],}]
class App extends React.Component {
  constructor(){
    super();
    this.state = {
      userid: 'Rin',
      user: null,
      links: [],
      headTitle: '',
      NextLinkKey: '',
      NextTitle: [],
      selectWord: ['ハリー・ポッターシリーズ'],
      clearDate: [],
    }
  }

  componentDidMount() {
    this.getApi('ハリー・ポッターシリーズ');
    firebase.auth().onAuthStateChanged(user => {
      this.setState({ user })
    })
  }

  //Firebase
  //dataにプッシュする。
  //最初に全てのデータを取り出して保存しておく、新しいデータを配列にpushしてセットし直す。
  writeUserData(userId, name) {
    dataArray.push({theme: 'インド〜カナダ',clearDate: '2019',clearWord: ['アメリカ','日本'],})
    console.log(dataArray)
    firebase.database().ref('users/' + userId).set({
      username: userId,
      data: dataArray,
    });
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
    this.setState({ selectWord: this.state.selectWord.concat(title)});
    
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
      const nextButton_button = document.querySelector('.nextButton_button');
      nextButton_button.textContent = 'EndWord';
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
  selectWordList = (selectword) =>{
    console.log(selectword)
    const selectwordList = selectword.map( (word,index) => {
      return (
        <li key={index} className="selectWord_list_item">
          {word}<span className="selectWord_arrow">→</span>
        </li>
      );
    });
    return (
      <ul className="selectWord_list">
        {selectwordList}
      </ul>
    )
  }
  getData = () =>{
    const _this = this;
    dataRef.once("value")
    .then(function(snapshot) {
      console.log(_this)
        const data = snapshot.child("data").val();
        _this.setState({clearDate: data})
    });
  }
  renderClearData = (renderData) =>{
    console.log(renderData,'renderData')
    const data = renderData.map((renderItem,index) => {
      console.log()
      return (
        <React.Fragment key={index}>
          <li>{renderItem.theme}</li>
          <li>{renderItem.clearDate}</li>
        </React.Fragment>
        
      )
    });
    return (
      <ul>
        {data}
      </ul>
    )
  }
  render() {
    return (
      <BrowserRouter>
      <div className="content">
        <button onClick={(e) => this.writeUserData(this.state.user.uid)}>SETDATA</button>
        <button onClick={(e) => this.getData()}>GetDATA</button>

        <div className="App">
          <header className="header">
            <div className="header_inner">
              <div className="header_nav">
                <h1 className="header_title">ウィキリレー</h1>
                <nav className="menu">
                  <ul className="menu_list">
                    <li className="menu_list_item">
                      <Link className="menu_list_item_link" to='/'>ほーむ</Link>
                    </li>
                    <li className="menu_list_item">
                      <Link className="menu_list_item_link" to={`/user/${this.state.userid}`}>ゆーざー</Link>
                    </li>
                    <li className="menu_list_item">
                      <Link className="menu_list_item_link" to={`/about`}>あばうと</Link>
                    </li>
                  </ul>
                </nav>
              </div>
              <div className="header_account">
              {/* UID: {this.state.user && this.state.user.uid} */}
                {this.state.user ? (
                  <button className="header_account_button" onClick={this.logout}>ログアウト</button>
                ) : (
                  <button className="header_account_button" onClick={this.login}>ログイン</button>
                )}
              </div>
            </div>
          </header>
            <div className="main">
              <Route exact path="/"　render={(props) => 
                <div>
                  <div className="todayTheme">
                    <h3 className="todayTheme_title">本日のお題</h3>
                    <p className="todayTheme_relay">ハリーポッター<span className="todayTheme_wavyline">〜〜〜〜〜</span>ハーマイオニー</p>
                  </div>

                  <div className="counttWord">
                    <p className="counttWord_text"><span>移動した回数:</span><span>{this.state.selectWord.length - 1}</span></p>
                  </div>
                  <div className="selectWord">
                    <div className="selectWord_inner">
                      <p className="selectWord_title">セレクトワード</p>
                      {this.selectWordList(this.state.selectWord)}
                    </div>
                  </div>
                  <div className="wikisection">
                    <div className="wikiName">
                        <a className="wikiName_title" href={`https://ja.wikipedia.org/wiki/${this.state.headTitle}`} target="_blank">{this.state.headTitle}</a>
                    </div>
                    <div className="nextButton">
                        {/* <button onClick={() => this.getApi()}>get</button> */}
                        <button className='nextButton_button' onClick={() => this.getApiNextPage(this.state.NextLinkKey)}>NextPage</button>
                    </div>
                  </div>
                    {this.list(this.state.links)}
                </div>}/>
                {/* <Route path="/user/:id" component={User}/> */}
              <Route path="/user/:id" render={( props ) =>
                <div>
                  {/* <p>User ID: {props.match.params.id}</p> */}
                  <p className="p-userName">ユーザネーム: {props.match.params.id}</p>
                  <div className="p-result">
                    <div className="p-relay">
                      <p className="p-relay_title">リレー記録</p>
                      <ul className="p-relay_list">
                        <li className="p-relay_list_item">
                          <p className="p-relay_list_item_date">遊んだ日: 2019-09-09</p>
                        </li>
                        <li className="p-relay_list_item">
                          <p className="p-relay_list_item_theme">お題: ハーマイオニー〜ハリーポッター</p>
                        </li>
                      </ul>
                    </div>
                    <div className="p-record">
                      <p className="p-record_title">選んだ単語</p>
                      <ul className="p-record_list">
                        <li className="p-record_list_item -is-start">ハーマイオニー</li>
                        <li className="p-record_list_item">賢者の石</li>
                        <li className="p-record_list_item -is-goal">ハリー・ポッター</li>
                      </ul>
                    </div>
                    {this.renderClearData(this.state.clearDate)}
                  </div>
                  <div className="p-result">
                    <div className="p-relay">
                      <p className="p-relay_title">リレー記録</p>
                      <ul className="p-relay_list">
                        <li className="p-relay_list_item">
                          <p>遊んだ日: 2019-09-09</p>
                        </li>
                        <li className="p-relay_list_item">
                          <p>お題: ハーマイオニー〜ハリーポッター</p>
                        </li>
                      </ul>
                    </div>
                    <div className="p-record">
                      <p className="p-record_title">選んだ単語</p>
                      <ul className="p-record_list">
                        <li className="p-record_list_item -is-start">ハーマイオニー</li>
                        <li className="p-record_list_item">賢者の石</li>
                        <li className="p-record_list_item -is-goal">ハリー・ポッター</li>
                      </ul>
                    </div>
                    {this.renderClearData(this.state.clearDate)}
                  </div>
                  <button className="c-buttonDelete">アカウント削除</button>
                </div>
                  } />
              <Route path="/about" render={( props ) =>
                <div>
                  <p>このゲームについて</p>
                  <p>wikipediaとは「すべてのウィキメディアプロジェクトをはじめ、誰でも自由に利用できる画像・音声・動画、その他あらゆる情報を包括し供給する[2]」ことを目的とするフリーな百科事典プロジェクトです。
                  <br />そんなwikioediaにまつわる噂をご存知でしょうか。
                  <br />膨大なデータベースを保有しているWikipediaのハイパーリンクを6回辿ればどの言葉にも繋がるという噂です。
                  <br />そんな、噂をゲームにしてみたのが本サイトです。</p>
                </div>
              } />
            </div>
            <footer className="footer">
                <div className="footer_inner">
                  <ul className="p-snsList">
                    <li className="p-snsList_item">
                      <a className="p-snsList_item_link" href="https://github.com/TakuyaTaniguchi/Wikirelay">github</a>
                    </li>
                    <li className="p-snsList_item">
                      <a className="p-snsList_item_link" href="https://twitter.com/RinstarskyKujat">Twitter</a>
                    </li>
                  </ul>
                </div>
            </footer>
        </div>
      </div>

      </BrowserRouter>
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