const crypto = require('crypto-js');

const cryptoKey = 'noti-server';

///const firebaseServiceAccount2 = require('./config/firebaseServiceAccountKeys.json');

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


const encrypt = () => {
  
 // const a = crypto.AES.encrypt(JSON.stringify(firebaseConfig), cryptoKey).toString();
  //const b = crypto.AES.encrypt(JSON.stringify(firebaseConfig2), "noti-server").toString();

  //console.log(a);
  //console.log(" **** ")
 
  //console.log(b);
   // return a;
}

// const x = encrypt();
// const a = decrypt(x, cryptoKey);
// console.log(a);

// const firebaseAdminApp = firebaseAdmin.initializeApp({
//   credential: firebaseAdmin.credential.cert(firebaseServiceAccount)
// });
// encrypt();