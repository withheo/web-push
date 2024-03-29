const router = require('express').Router();
const SimpleWebAuthnServer = require('@simplewebauthn/server');
const cookie = require('cookie');

const rpID = "vue3-with-pwa.vercel.app";
const loggedInUserId = 'user001';
const devices = [];
const { 
  generateRegistrationOptions, 
  verifyRegistrationResponse, 
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} = require('@simplewebauthn/server');
const expectedOrigin = `https://${rpID}`;
const defaultTimeOut = 60000;

const { isoBase64URL, isoUint8Array } = require('@simplewebauthn/server/helpers');

const { firebaseAppInstance, firestore , webAuthnDocumentName } = require('../helper/firebase');


/**
 * Login 처음 하고 기기 등록시 이미 login user는 한명 있다고 가정한다.
 * 우선 등록된 devices 정보 X
 */
const inMemoryUserDeviceDB = {
  [loggedInUserId]: {
    id: loggedInUserId,
    username: `${loggedInUserId}@${rpID}`,
    devices: [],
  },
};

const getDocByUser = async (user_id) => {
  const db = firestore.getFirestore(firebaseAppInstance);
  const { collection, query, getDocs, where } = firestore; 
  const q = query(collection(db, webAuthnDocumentName), user_id ? where("user_id", "==", user_id) : null);
  
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

const getDocByKey = async (key) => {
  const db = firestore.getFirestore(firebaseAppInstance);
  const { collection, query, getDocs, where } = firestore; 
  const q = query(collection(db, webAuthnDocumentName), key ? where("key", "==", key) : null);
  
  const docsnap = await getDocs(q); 
  const data = [];
  docsnap.forEach((doc) => {
    data.push(doc);
  })
  // console.log(docsnap.size);
  return new Promise((resolve) => {
    resolve(docsnap.size > 0 ? (key ? data[0] : data) : false);
  });
}

const addDocUser = async (data) => {
  const db = firestore.getFirestore(firebaseAppInstance);
  const { collection, query, addDoc } = firestore; 
  const docRef = await addDoc(collection(db, webAuthnDocumentName), data);
}

router.post('/generate-registration-options' , async (req, res) => {
  const body = req.body;
  const data = body.data.split(":");
  let user;
  const userDoc = await getDocByKey(data[0]);
  if (userDoc) {
    user = {
      id: userDoc.data().key,
      username: `${userDoc.data().user_id}@${rpID}`,
      devices: [],
    } 
    return res.status(500).send({"msg": "이미 등록한 앱입니다."});    
  } else {
    user = {
      id:  data[0],
      username: `${data[1]}@${rpID}`,
      devices: [],
    }
  } 

  console.log(user);
  
  const opts = {
    rpName: 'Web Authn Login',
    rpID,
    userID: user.id,
    userName: user.username,
    timeout: defaultTimeOut,
    attestationType: 'none',
    /**
     * Passing in a user's list of already-registered authenticator IDs here prevents users from
     * registering the same device multiple times. The authenticator will simply throw an error in
     * the browser if it's asked to perform registration when one of these ID's already resides
     * on it.
     */
    excludeCredentials: devices.map((dev) => ({
      id: dev.credentialID,
      type: 'public-key',
      transports: dev.transports,
    })),
    authenticatorSelection: {
      residentKey: 'discouraged',
      /**
       * Wondering why user verification isn't required? See here:
       *
       * https://passkeys.dev/docs/use-cases/bootstrapping/#a-note-about-user-verification
       */
      userVerification: 'preferred',
    },
    /**
     * Support the two most common algorithms: ES256, and RS256
     */
    supportedAlgorithmIDs: [-7, -257],
  };

  const options = await generateRegistrationOptions(opts);

  console.log("쿠키를 생성 합니다. ", options.challenge, req.headers.cookie)
  res.cookie("webAuthn", options.challenge, {
    httpOnly: true,
    sameSite: 'None',
    secure: false,
    maxAge: defaultTimeOut,
  });  

  res.send({msg: "ok", data: options})
});

router.post('/verify-registration', async (req, res) => {
  const body = req.body;  
  const { key, credential, user_id, challenge } = body;
  let cookies; 
  if (req.headers && req.headers.cookie !== undefined){
    cookies = cookie.parse(req.headers.cookie);
  }
  const expectedChallenge = challenge; //cookies ? cookies.webAuthn : "";

  let dbAuthenticator;
  const user = inMemoryUserDeviceDB[loggedInUserId];
  try {
    const opts = {
      response: credential,
      expectedChallenge: `${expectedChallenge}`,
      expectedOrigin,
      expectedRPID: rpID,
      requireUserVerification: false,
    };
    verification = await verifyRegistrationResponse(opts);
  } catch (error) {
    const _error = error ;
    console.error(_error);
    return res.status(400).send({ error: _error.message });
  }

  const { verified, registrationInfo } = verification;
  if (verified && registrationInfo) { 
    const { credentialPublicKey, credentialID, counter } = registrationInfo;
    // 정상적으로 등록 되었는지 확인 필dyu
    // 사용자가 있는지 확인하고. 해당 디바이스 별로 넣어야 한다.
    const newDevice = {
      credentialPublicKey,
      credentialID,
      counter,
      transports: credential.response.transports,
    };

    // base64로 변경해서 넣기
    newDevice.credentialPublicKey = btoa(String.fromCharCode.apply(null, credentialPublicKey));
    newDevice.credentialID = btoa(String.fromCharCode.apply(null, credentialID));

    console.log("newDevice : ", newDevice);

    // console.log("newDevice 1> ", newDevice);
    // let decoder = new TextDecoder();
    // newDevice.credentialID = decoder.decode(newDevice.credentialID);
    // newDevice.credentialPublicKey = decoder.decode(newDevice.credentialPublicKey);
    // console.log("newDevice 2> ", newDevice);
    addDocUser({
      key,
      user_id,
      newDevice,
    });

    // const existingDevice = user.devices.find((device) =>
    //   isoUint8Array.areEqual(device.credentialID, credentialID)
    // );

    // if (!existingDevice) {
    //   /**
    //    * Add the returned device to the user's list of devices
    //    */
    //   const newDevice = {
    //     credentialPublicKey,
    //     credentialID,
    //     counter,
    //     transports: credential.response.transports,
    //   };

    //   addDocUser(newDevice);

      // user.devices.push(newDevice);
    // }
  }

  if (verified) {
    // Update the authenticator's counter in the DB to the newest count in the authentication
    // dbAuthenticator.counter = authenticationInfo.newCounter;
  }

  res.clearCookie('webAuthn');

  // req.session.currentChallenge = undefined;
  res.send({ verified });
});


router.post('/generate-authentication-options' , async (req, res) => {
  // 유저를 알 수 없겠지.. 흠... 
  const body = req.body;
  const { data } = body;
  console.log(data);
  const userDoc = await getDocByKey(data);
  if (userDoc) {
    const user = userDoc.data();
    const device = user.newDevice;
    const credentialID = new Uint8Array([...atob(device.credentialID)].map(char => char.charCodeAt(0)));
   
    const opts = {
      timeout: defaultTimeOut,
      allowCredentials: [{
        id: credentialID,
        type: 'public-key',
        transports: device.transports,
      }],
      // user.devices.map((dev) => ({
      //   id: dev.credentialID,
      //   type: 'public-key',
      //   transports: dev.transports,
      // })), // 우선 null 
      rpID,
      userVerification: 'preferred',
    }

    const options = await generateAuthenticationOptions(opts);

    console.log("쿠키를 생성 합니다. ", options.challenge, req.headers.cookie)
    res.cookie("webAuthn", options.challenge, {
      httpOnly: true,
      sameSite: 'None',
      secure: false,
      maxAge: defaultTimeOut,
    });  
    
    res.send({msg: "ok", data: options})
  } else {
    return res.status(500).send({msg : "등록자를 찾지 못했습니다."})
  }

  // const user = inMemoryUserDeviceDB[loggedInUserId];
  // const opts = {
  //   timeout: defaultTimeOut,
  //   allowCredentials: user.devices.map((dev) => ({
  //     id: dev.credentialID,
  //     type: 'public-key',
  //     transports: dev.transports,
  //   })), // 우선 null 
  //   rpID,
  //   userVerification: 'preferred',
  // }
  
});

router.post('/verify-authentication', async (req, res) => {
  const body = req.body;
  const { key, data, challenge } = body;
  let cookies; 

  if (req.headers && req.headers.cookie !== undefined){
    cookies = cookie.parse(req.headers.cookie);
  }
  res.clearCookie('webAuthn');

  const userDoc = await getDocByKey(key);
  if (userDoc) {
    const expectedChallenge = challenge; // cookies ? cookies.webAuthn : "";  
    const user = userDoc.data();
    let authenticator;
    const bodyCredIDBuffer = isoBase64URL.toBuffer(data.rawId);  
    const device = user.newDevice;
    const credentialID = new Uint8Array([...atob(device.credentialID)].map(char => char.charCodeAt(0)));
    const credentialPublicKey = new Uint8Array([...atob(device.credentialPublicKey)].map(char => char.charCodeAt(0)));
    const userDevice = {
        credentialID,
        credentialPublicKey,
        counter: 0,
        transports: device.transports,
    }

    if (isoUint8Array.areEqual(credentialID, bodyCredIDBuffer)) {
      authenticator = userDevice;
    }

    try {
      const opts = {
        response: data,
        expectedChallenge: `${expectedChallenge}`,
        expectedOrigin,
        expectedRPID: rpID,
        authenticator: authenticator,
        requireUserVerification: false,
      };
      verification = await verifyAuthenticationResponse(opts);
    } catch (error) {
      const _error = error;
      console.error(_error);
      return res.status(400).send({ error: _error.message });
    }

    const { verified, authenticationInfo } = verification;
    if (verified) {
      // 인증횟수 카운트는 왜 ???
      // Update the authenticator's counter in the DB to the newest count in the authentication
      // userDevice.counter = authenticationInfo.newCounter;
    }
    res.send({ verified });

  } else {
    return res.status(400).send({
      error: 'Authenticator 사용자 를 찾을 수 없습니다.',
    });
  }
});

module.exports = router;