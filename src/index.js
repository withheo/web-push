
const express = require('express');
const cors = require('cors');
const firebaseAdmin = require('firebase-admin');
const firestore = require('firebase/firestore');
const firebaseApp = require('firebase/app');
// const firebaseServiceAccount = require('./config/firebaseServiceAccountKey.json');
const firebaseServiceAccount2 = require('./config/firebaseServiceAccountKeys.json');
const firebaseSdk2 = require('./config/firebaseSDKs.json');
//const firebaseSdk = require('./config/firebaseSDK.json');
const app = express();
const crypto = require('crypto-js');
const moment = require('moment')

app.use(cors());
app.use(express.json());

const documentName = 'notification_users';
const cryptoKey = 'noti-server';

const decrypt = (text, key) => {
  try {
    //console.log(text);
    const str = crypto.AES.decrypt(text, key);
    return JSON.parse(str.toString(crypto.enc.Utf8));
  }catch(err) {
    console.log(err);
  }
}

const encrypt = () => {
  return ;
  //crypto.AES.encrypt(JSON.stringify(firebaseSdk), "noti-server").toString();
  //crypto.AES.encrypt(JSON.stringify(firebaseServiceAccount), "noti-server").toString();
}

// console.log(encrypt());
// console.log(decrypt(firebaseServiceAccount2.key, "noti-server"));

const firebaseServiceAccount = decrypt(firebaseServiceAccount2.key, cryptoKey);
const firebaseSdk = decrypt(firebaseSdk2.key, cryptoKey);


const firebaseAdminApp = firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(firebaseServiceAccount)
});

const firebaseAppInstance = firebaseApp.initializeApp(firebaseSdk);


const getAllNotificationUsers = async () => {
  const db = firestore.getFirestore(firebaseAppInstance);
  const { collection, query, getDocs } = firestore; 
  const q = query(collection(db, documentName));
  const docsnap = await getDocs(q); 
   //console.log(docsnap);
   docsnap.forEach((doc) => {
   // console.log(doc.data());
   })
}

const addNotification = async (data) => {
  const db = firestore.getFirestore(firebaseAppInstance);
  const { collection, query, addDoc } = firestore; 
  const docRef = await addDoc(collection(db, documentName), data);
}

const getDocByUser = async (user_id) => {
  const db = firestore.getFirestore(firebaseAppInstance);
  const { collection, query, getDocs, where } = firestore; 
  const q = query(collection(db, documentName), user_id ? where("user_id", "==", user_id) : null);
  
  const docsnap = await getDocs(q); 
  const data = [];
  docsnap.forEach((doc) => {
    data.push(doc);
  })
  // console.log(docsnap.size);
  return new Promise((resolve) => {
    resolve(docsnap.size > 0 ? (user_id ? data[0] : data) : false);
  });
}

const getDocUseUser = async() => {
  const db = firestore.getFirestore(firebaseAppInstance);
  const { collection, query, getDocs, where } = firestore; 
  const q = query(collection(db, documentName), where("use", "==", true));
  const docsnap = await getDocs(q); 
  const data = [];
  docsnap.forEach((doc) => {
    data.push(doc);
  })
  return new Promise((resolve) => {
    resolve(docsnap.size > 0 ? data : false);
  });
}

const updateNotification = async (data, docSnap) => {
  const db = firestore.getFirestore(firebaseAppInstance);
  const { updateDoc , doc } = firestore;
  const updateDocs = doc(db, documentName , docSnap.id);
  await updateDoc(updateDocs, data);
  return  new Promise((resolve) => {
    //console.log("update")
    resolve(true);
  });
}

const sendNotificationUser = async (token, data) => {
  const messaging = firebaseAdminApp.messaging();
  const messages = {
    token,
    data,
    // notification: {
    //   title: "알림",
    //   body: "내용"
    // },
    android: {
      priority: "high"
    },
    webpush: {
      headers: {
        Urgency: "high",
        ttl: "5000"
      }
    },
    fcmOptions: {
      analyticsLabel: "web-push"
    }
  }

  // console.log(messages);

  await messaging.send(messages);
  // await messaging.sendEachForMulticast(messages);
  // 
  // await messaging.sendToDevice(token, {
  //   data,
  // }, {
  //   priority: "high"
  // })

  // await messaging.sendToDevice(token, {
  //   data,
  // })
}

app.post('/notification/send/:userid', async (req, res) => {
  const userid = req.params.userid;
  const { title , content } = req.body;
  const doc = await getDocByUser(userid);
  if (doc === false) {
    res.status(404).send({msg: "not found"});
  } else {

    // console.log(doc.data().token, {
    //   title: title ?? '안녕하세요',
    //   content: content ?? '내용입니다.',
    //   sended_at: moment().format("YYYY년MM월DD일 HH시mm분ss초")
    // });

    sendNotificationUser(doc.data().token, {
      title: title ?? '안녕하세요',
      content: content ?? '내용입니다.',
      sended_at: moment().format("YYYY년MM월DD일 HH시mm분ss초")
    });

    res.send({msg: doc.data()})
  }
});

app.get('/notification/sends/:userid', async (req, res) => {
  const userid = req.params.userid;
  const { title , content } = req.body;
  const doc = await getDocByUser(userid);
  if (doc === false) {
    res.status(404).send({msg: "not found"});
  } else {

    // console.log(doc.data().token, {
    //   title: title ?? '안녕하세요',
    //   content: content ?? '내용입니다.',
    //   sended_at: moment().format("YYYY년MM월DD일 HH시mm분ss초")
    // });

    await sendNotificationUser(doc.data().token, {
      title: title ?? '안녕하세요',
      content: content ?? '내용입니다.',
      sended_at: moment().format("YYYY년MM월DD일 HH시mm분ss초")
    });

    res.send({msg: doc.data()})
  }
});


app.post('/notification', async (req, res) => {
  const { body } = req;
  const db = firestore.getFirestore(firebaseAppInstance);
  const { collection, query, addDoc } = firestore; 
  const { user_id } = body;
  const doc = await getDocByUser(user_id);
  if (doc === false) {
    await addNotification(body);
  } else {
    await updateNotification(body, doc);
    //console.log("body ", "이미있따")
  }
  
  res.send({msg: "ok notification"})
});

app.get('/' , async (req, res) => {
  // getAccessToken();
  // console.log(1);
  // addNotification();
  // sendNotificationUser();
  res.send("OK")
});

app.get("/notification/user/:userid" , async (req, res) => {
  const userid = req.params.userid;
  const doc = await getDocByUser(userid);
  if (doc === false) {
    res.status(404).send({msg: "not found"});
  } else {
    res.send({msg: doc.data()})
  }
})

app.get("/notification/user" , async (req, res) => {
  const type = req.query.type;
  const docs = await getDocUseUser();
  if (docs === false) {
    res.status(404).send({msg: "not found"});
  } else {
    const arrageData = docs.map((doc) => doc.data())
    res.send({msg:arrageData})
  }
})

app.listen(3000);