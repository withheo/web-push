const crypto = require('crypto-js');

const cryptoKey = 'noti-server';

const firebaseServiceAccount2 = require('./config/firebaseServiceAccountKeys.json');


const firebaseConfig = {
  
};



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
  
  const a = crypto.AES.encrypt(JSON.stringify(firebaseConfig), cryptoKey).toString();
  //const b = crypto.AES.encrypt(JSON.stringify(firebaseConfig2), "noti-server").toString();

  console.log(a);

  //const b = decrypt(a, cryptoKey);
  //console.log(b);
  //console.log(" **** ")
 
  //console.log(b);
   // return a;
}



// const firebaseAdminApp = firebaseAdmin.initializeApp({
//   credential: firebaseAdmin.credential.cert(firebaseServiceAccount)
// });
encrypt();

const x = encrypt();
//const a = decrypt(firebaseServiceAccount2.key, cryptoKey);
//console.log(a);

// encrypt();


//notification_users
//9e3qRCsm1RTHBcBZ2wnp	"2024-01-11T05:39:07.434Z"	"dl2GU9k1zjI4fxg0OowyWn:APA91bF9wRsaKdPXboTSH4xIwECCXwRrIQnoBYFM74uFc5yuBiOfUJHb-TUPfUyEavZiK1Ux-U-HOh2DOI5V29EA4I8A3RCZfrp71WQ-g-kClCpE-7iuoByyqMp60OmI2JlcvVw4gGko"	true	"515f45a0-9cc2-48a9-acf4-10348a84e94f"	"미니채"
//CPJzDc2tGNHDZGFN5H9t	"2024-01-11T10:12:26.411Z"	"c6V7raCPjorC4El62owqkv:APA91bFn0bU_Huk_VUYWs0Rlk8ZqluCYs8sLVoQ15sUxZ2Xd8ZsJ5LRCZt5OX8QZBQqiKku05CqLxKqTk0mxb2FButOgAaJPr_ryhwXKK-VCZzlrZ4wIOX3vPO1-uwb70PYWi5msJfW1"	true	"73d470e2-a8ef-427f-b5a4-d72300938999"	"test01"
//KH1GLFy1FFM92c4nZmbs	"2024-01-12T02:04:01.129Z"	"fprgUALY_yLUPnrEMyFfWc:APA91bHmsMx92uqzuMwnKFQ6zR1o4iuto8F2kYncUQzsOLjtRZL3zNQuMsjcKzXDzzGG57gOHPLHvEPWA8cOnfN8I-7FBnIh7D8gkusVd8EQtFUxWGX3e4aCp__tl86hu4uya8dz9vii"	true	"d60baada-cce7-450a-8ea4-aeefd6157cd3"	"다혜"
//cVTKvE0HR0ghyqe9dgbF	"2024-01-11T10:01:41.585Z"	"ehLXbLjhuu4WvREBQh0x3e:APA91bHmrXWM7Ymwh7pI7walLF7GKA_8i_IYXlaxVDVfsC5vRwwQ0zgFUUhCzjlo0jsShaNdBcJKxwwYJFhG9fw-PNwAKGUCgOyYxPDN3NcXkR5fE4Sd8HQPy9HsHMjxwQCgphmMx0qw"	true	"fd238f3e-7d67-41f4-b7d3-c85d022b7538"	"Hkh"
//hsKAGs70o0ssPT8x7rQJ	"2024-01-11T05:38:22.275Z"	""	false	"ebefbbe5-2513-49b7-9a28-1e9bec746150"	"lej"
//lOC9HvqBxcHHckmm8bad	"2024-01-15T04:08:03.756Z"	"dopNuk9HNcZBJzz409A41n:APA91bEsdwiu-TZDwLU5fMGjailjIWTgpdZJUC6LeTfECs8PJ0sCwMljcGTjgIAl6TtkBj_LNzITz5P6pWM8zIlim-kepEUTBcrbJda0C5tCf4acTWtCV5pTDwCqOjE6I3aTtVsZBGgx"	true	"a74ce6ae-b8d6-4e7f-9f4c-41daa9751cf7"	"이도훙"
//x3gq5IWfJybcH3OXYboc	"2024-01-11T05:35:38.496Z"	"d4PX5Jaj8y6isGAtZtUw_u:APA91bGUJZsKcxwIkNOph8MnbOcS-B_Fr_GMfe60z9peKClpHHDCW1zY3SYGi1Ya8jRO8fZ4Q0B8gQOU4XiX1d9kfGKNjcuoktpjqIDdDKyQ99QJUDTd_h3L8Wwi68RNtrLaFiN6mXyE"	true	"6cd46d9d-0e6d-4512-a0ea-2d311ca1ea2a"	"이시영"


//webauthn_users
//1E4nAGI2g2IfAaIwUDjY	"a74ce6ae-b8d6-4e7f-9f4c-41daa9751cf7"	{credentialPublicKey: "pQECAyYgASFYIH0KMhkm1munIC2R4lZfCLDXD0xwEVop6v3XPxDbr39mIlgg5io9Y4OeKaqXhg8uX1kx7n2ziL7Kmb9fHjHlS6i7aEg=", transports: ["hybrid", "internal"], credentialID: "AYY0ZbYRqMHjsfnOsrahkdZcotXBIw/FQ9h+UR/jQ+dboWaLxHu3wyTp3C1Mo96UtcRXMaCCc87bH8YNY3bPTLc=", counter: 0}	"Le"
//5VSz30C3LbU5O0hyjgkt	"515f45a0-9cc2-48a9-acf4-10348a84e94f"	{transports: ["internal", "hybrid"], credentialPublicKey: "pQECAyYgASFYIHhF52oOqvMlheH+uWe/6uBatYvGa8UfSAsYVyVj/lcOIlggICcqWcb6tm4n39ubq2cR1OiJlIGaHQ6dlJfwTHInzfg=", credentialID: "fwS6EAPJFHI91/mtutSy8iYs49E=", counter: 0}	"채민희"
//BknKRcs6tJIZy3Mik9BR	"fd238f3e-7d67-41f4-b7d3-c85d022b7538"	{credentialPublicKey: "pQECAyYgASFYID2R/5qDCHn5D42Auac/1w0E9rGF6wqPr3QqzF49sd6lIlggLNE4TtjN6egRZxMs19HYJTgGTgusNfQOdKlYa2Py4gI=", credentialID: "AbwHEI556pcGOQ2feB5NidBDlL1RGoRuDdsuXk9n031bKu6AjF+asAiNEEXTCSQh/iaibH1bDgjYAcxympZf6io=", transports: ["hybrid", "internal"], counter: 0}	"Test"
//IosiwQHlWOBw4mhTz0wp	"6cd46d9d-0e6d-4512-a0ea-2d311ca1ea2a"	{counter: 0, transports: ["hybrid", "internal"], credentialPublicKey: "pQECAyYgASFYINDrQgPeeiT5WKMcUSnTParZBjmP/Tso/ppsR70/e2PjIlgg97/f89WbII6ptgRD1VwQq0hLRpWb49wmrPIDtYdZZnY=", credentialID: "Ad6TVxLsw7uQHiA3Q6tTDo2DkZ8Ws1p/tH5Jb3cp9oKQEUdTqTfvu74JQIPAh+O1tsEJVkrpvRB8+6ENU3r+oEw="}	"1234"
//lCzpj7G8lKZ4R9UcVoow	"ebefbbe5-2513-49b7-9a28-1e9bec746150"	{transports: ["internal", "hybrid"], credentialID: "vmCsAkvqk0OjLBpN2bo5IkuyhrM=", credentialPublicKey: "pQECAyYgASFYIB3kOX4RCpi6Gnh6HQXK7mH+3cOgGGEEDFJ1cXPNOarrIlgg7wRcb235TfMzpHYkvhMIz8viqsi2o76fHLTbau8j5jc=", counter: 0}	"test"