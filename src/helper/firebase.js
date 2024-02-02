const firebaseAdmin = require('firebase-admin');
const firestore = require('firebase/firestore');
const firebaseApp = require('firebase/app');
// const firebaseServiceAccount = require('../config/firebaseServiceAccountKey.json');
// 알림 서비스관련 
const firebaseServiceAccount2 = require('../config/firebaseServiceAccountKeys.json');
//firebase 관련
const firebaseSdk2 = require('../config/firebaseSDKs.json');

const documentName = 'notification_users';
const webAuthnDocumentName = 'webauthn_users';
const cryptoKey = 'noti-server';
const crypto = require('crypto-js');

const decrypt = (text, key) => {
  try {
    //console.log(text);
    const str = crypto.AES.decrypt(text, key);
    return JSON.parse(str.toString(crypto.enc.Utf8));
  } catch(err) {
    console.log(err);
  }
}


const encrypt = () => {
  return ;
  //crypto.AES.encrypt(JSON.stringify(firebaseSdk), "noti-server").toString();
  //crypto.AES.encrypt(JSON.stringify(firebaseServiceAccount), "noti-server").toString();
}

const firebaseServiceAccount = decrypt(firebaseServiceAccount2.key, cryptoKey);
const firebaseSdk = decrypt(firebaseSdk2.key, cryptoKey);

const firebaseAdminApp = firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(firebaseServiceAccount)
});
/// console.log(firebaseAdminApp.messaging());

const firebaseAppInstance = firebaseApp.initializeApp(firebaseSdk);

module.exports = {
  documentName,
  webAuthnDocumentName,
  firebaseAppInstance, 
  firestore,
  firebaseAdminApp
 }