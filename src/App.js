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
      displayName: '',
      userid: 'Rin',
      user: null,
      links: [],
      headTitle: '',
      NextLinkKey: '',
      NextTitle: [],
      selectWord: ['ハリー・ポッターシリーズ'],
      clearDate: [],
      theme: ['ハリー・ポッターシリーズ','12月8日'],
      clearFlag: false,
    }
  }

  componentDidMount() {
    this.getApi('ハリー・ポッターシリーズ');
    firebase.auth().onAuthStateChanged(user => {
      this.setState({ displayName: user.displayName})
      this.setState({ user })
    })
  }

  getWikiWord(){
    console.log('aaa')
    var url = "https://ja.wikipedia.org/w/api.php";
    const _this = this;
    var params = {
        action: "query",
        format: "json",
        list: "random",
        rnnamespace: "0",
        rnlimit: "2"
    };

    url = url + "?origin=*";
    Object.keys(params).forEach(function(key){url += "&" + key + "=" + params[key];});

fetch(url)
    .then(function(response){return response.json();})
    .then(function(response) {
        var randoms = response.query.random;
        _this.setState({theme: [randoms[0].title,randoms[1].title]})
        _this.setState({selectWord: [randoms[0].title]})
    })
    .catch(function(error){console.log(error);});
    // let url = 'https://ja.wikipedia.org/w/api.php?action=query&format=json&list=random&rnlimit=2'
    // url = url + "?origin=*";
    // axios.get(url).then((response) => {
    //   console.log(response)
    // } )
  }

  //Firebase
  //dataにプッシュする。
  //最初に全てのデータを取り出して保存しておく、新しいデータを配列にpushしてセットし直す。
  writeUserData(userId, name) {
    dataArray.push({theme: 'インド〜カナダ',clearDate: '2019',clearWord: ['アメリカ','日本'],})
    firebase.database().ref('users/' + userId).set({
      username: userId,
      data: dataArray,
    });
  }

  login() {
    const provider = new firebase.auth.GoogleAuthProvider()
    firebase.auth().signInWithRedirect(provider)
  }

  logout() {
    firebase.auth().signOut()
  }
  getApiNextWord = (e) =>{
    e.preventDefault();
    const title = e.target.getAttribute('data-title');
    this.setState({ NextTitle: title });
    this.getApi(title,e);
    this.setState({ selectWord: this.state.selectWord.concat(title)});
  }

  matchWord = (selectWord, theme) => {
    console.log('math')
    const themeStartWord = theme[0];
    const themeEndtWord = theme[1];

    const selectStartWord = selectWord[0];
    const selectEndWord = selectWord[selectWord.length - 1];
    if(themeEndtWord === selectEndWord){
      this.setState({clearFlag: true})
    }else{
      return false;
    }
  }
  getApiNextPage = (NextLinkKey) => {
    axios
    .get(`https://ja.wikipedia.org/w/api.php?format=json&origin=*&action=query&prop=links&titles=${this.state.headTitle}&plcontinue=${NextLinkKey}`)
    .then(res => {
      const data = res.data;
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
    axios
    .get(`https://ja.wikipedia.org/w/api.php?format=json&origin=*&action=query&prop=links&titles=${url}`)
    .then(res => {
      const data = res.data;
      const NextLinkKey = data.continue.plcontinue;
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
          <a href="/" data-title={link.title} onClick={(e) => {
            this.getApiNextWord(e)
            setTimeout( () => {
              this.matchWord(this.state.selectWord,this.state.theme)
            },1000)
            }}>{link.title}</a>
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
        const data = snapshot.child("data").val();
        _this.setState({clearDate: data})
    });
  }
  renderClearData = (renderData) =>{
    const data = renderData.map((renderItem,index) => {
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
        {/* <button onClick={(e) => this.writeUserData(this.state.user.uid)}>SETDATA</button>
        <button onClick={(e) => this.getData()}>GetDATA</button>
        <button onClick={(e) => this.matchWord(this.state.selectWord,this.state.theme)}>MatcheDATA</button> */}
        <div className="App">
            {this.state.clearFlag ? (
                      <div className="p-modal">
                        <div className="p-modal_inner">
                          <button className="p-modal_buttonClose" onClick={(e) => this.setState({ clearFlag: false }) }>×</button>
                          <p className="p-modal_title">くりあ〜！！！</p>
                          <div className="p-modal_button">
                            <button className="p-modal_button_button -is-retry" onClick={(e) => this.setState({ clearFlag: false }) }>もう一度遊ぶ？</button>
                            <button className="p-modal_button_button -is-record">記録する？(準備中)</button>
                          </div>
                          <div className="p-modal_button -is-center">
                            <button className="p-modal_button_button -is-tweet"> 結果をツイートする？(準備中)</button>
                          </div>
                        </div>
                      </div>
            ) : (
              <React.Fragment></React.Fragment>
            )}
          <header className="header">
            <div className="header_inner">
              <div className="header_nav">
                <h1 className="header_title">うぃきりれー</h1>
                <nav className="menu">
                  <ul className="menu_list">
                    <li className="menu_list_item">
                      <Link className="menu_list_item_link" to='/'>ほーむ</Link>
                    </li>
                    {this.state.user ? (
                      <li className="menu_list_item">
                        <p>aaa</p>
                        <Link className="menu_list_item_link" to={`/user/${this.state.displayName}`}>ゆーざー</Link>
                      </li>
                    ) : (
                      <React.Fragment></React.Fragment>
                    )}
                    <li className="menu_list_item">
                      <Link className="menu_list_item_link" to={`/about`}>あばうと</Link>
                    </li>
                  </ul>
                </nav>
              </div>
              <div className="header_account">
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
                    <p className="todayTheme_relay">{this.state.theme[0]}<span className="todayTheme_wavyline">〜〜〜〜〜</span>{this.state.theme[1]}</p>
                    <button className="todayTheme_button" onClick={() =>{
                      this.getWikiWord()
                      const _this = this;
                      setTimeout(function(){
                        _this.getApi(_this.state.theme[0]);
                      },1000)
                      
                    }}>次のお題</button>
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
                        <a className="wikiName_title" href={`https://ja.wikipedia.org/wiki/${this.state.theme[0]}`} target="_blank" rel="noopener noreferrer" >{this.state.theme[0]}</a>
                    </div>
                    <div className="nextButton">
                        {/* <button onClick={() => this.getApi()}>get</button> */}
                        <button className='nextButton_button' onClick={() => {
                          this.getApiNextPage(this.state.NextLinkKey)
                        }}>NextPage</button>
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
                          <p className="p-relay_list_item_theme">お題: 12月8日〜ハリーポッター</p>
                        </li>
                      </ul>
                    </div>
                    <div className="p-record">
                      <p className="p-record_title">選んだ単語</p>
                      <ul className="p-record_list">
                        <li className="p-record_list_item -is-start">12月8日</li>
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
                          <p>お題: 12月8日〜ハリーポッター</p>
                        </li>
                      </ul>
                    </div>
                    <div className="p-record">
                      <p className="p-record_title">選んだ単語</p>
                      <ul className="p-record_list">
                        <li className="p-record_list_item -is-start">12月8日</li>
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