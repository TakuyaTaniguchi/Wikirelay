import firebase from 'firebase/app'
import 'firebase/auth'

const config = {
  apiKey: process.env.REACT_APP_FIREBASE_APIKEY,
  authDomain: 'reactapp-bb426.firebaseapp.com',
  databaseURL: 'https://reactapp-bb426.firebaseio.com',
  projectId: 'reactapp-bb426',
  storageBucket: '',
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID
}

firebase.initializeApp(config)

export default firebase