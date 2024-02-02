const { initializeApp } = require('firebase/app');
const {getFirestore , collection, doc, setDoc , getDoc } = require('firebase/firestore');
// TODO: Replace the following with your app's Firebase project configuration
// See: https://support.google.com/firebase/answer/7015592
const crypto = require('crypto-js');
const firebaseServiceAccount2 = require('./config/firebaseServiceAccountKeys.json');
const decrypt = (text, key) => {
  try {
    //console.log(text);
    const str = crypto.AES.decrypt(text, key);
    console.log(str.toString(crypto.enc.Utf8));
    return JSON.parse(str.toString(crypto.enc.Utf8));
  } catch(err) {
    console.log(err);
  }
}

const firebaseConfig = {
  apiKey: "AIzaSyBofrrfAyYaoipjAGMJ_FkWPYuMTDEbnt4",
  authDomain: "database-pwa-c3d36.firebaseapp.com",
  projectId: "database-pwa-c3d36",
  storageBucket: "database-pwa-c3d36.appspot.com",
  messagingSenderId: "291003397232",
  appId: "1:291003397232:web:85a4233958e049af01b0b5",
  measurementId: "G-6JG2BH8FRK"
};

const a = decrypt(firebaseServiceAccount2.key, "noti-server");

// const firebaseConfig = a;
// Initialize Firebase

// console.log(firebaseConfig);
const app = initializeApp(firebaseConfig);


// Initialize Cloud Firestore and get a reference to the service

const db = getFirestore(app);

async function  getA() {
  try {
    const docRef = doc(db, "notification_users"); 
    console.log(docRef);
    // const docSnap = await getDoc(docRef);
    // if (docSnap.exists()) {
    //   console.log("Document data:", docSnap.data());
    // } else {
    //   // docSnap.data() will be undefined in this case
    //   console.log("No such document!");
    // }
  } catch(e) {
    console.error(1);
  }
  
} 

getA();