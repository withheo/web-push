const crypto = require('crypto-js');

const cryptoKey = 'noti-server';




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
  
  //const a = crypto.AES.encrypt(JSON.stringify(firebaseConfig_message), "noti-server").toString();
  //const b = crypto.AES.encrypt(JSON.stringify(firebaseConfig2), "noti-server").toString();

  //console.log(a);
  //console.log(" **** ")
 
  //console.log(b);
}

// encrypt();