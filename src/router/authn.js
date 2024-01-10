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

router.get('/generate-registration-options' , async (req, res) => {

  const user = inMemoryUserDeviceDB[loggedInUserId];
  console.log(user);
  
  const opts = {
    rpName: 'Web Authn Login',
    rpID,
    userID: loggedInUserId,
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
    secure: true,
    maxAge: defaultTimeOut,
  });  

  res.send({msg: "ok", data: options})
});

router.post('/verify-registration', async (req, res) => {
  const body = req.body;
  let cookies; 
  if (req.headers && req.headers.cookie !== undefined){
    cookies = cookie.parse(req.headers.cookie);
  }
  const expectedChallenge = cookies ? cookies.webAuthn : "";

  let dbAuthenticator;
  const user = inMemoryUserDeviceDB[loggedInUserId];
  try {
    const opts = {
      response: body,
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

    const existingDevice = user.devices.find((device) =>
      isoUint8Array.areEqual(device.credentialID, credentialID)
    );

    if (!existingDevice) {
      /**
       * Add the returned device to the user's list of devices
       */
      const newDevice = {
        credentialPublicKey,
        credentialID,
        counter,
        transports: body.response.transports,
      };

      user.devices.push(newDevice);
    }
  }

  if (verified) {
    // Update the authenticator's counter in the DB to the newest count in the authentication
    // dbAuthenticator.counter = authenticationInfo.newCounter;
  }

  res.clearCookie('webAuthn', {  httpOnly: true,
    sameSite: false,
    secure: true,
  });

  // req.session.currentChallenge = undefined;
  res.send({ verified });
});


router.get('/generate-authentication-options' , async (req, res) => {
  // 유저를 알 수 없겠지.. 흠... 
  const user = inMemoryUserDeviceDB[loggedInUserId];
  const opts = {
    timeout: defaultTimeOut,
    allowCredentials: user.devices.map((dev) => ({
      id: dev.credentialID,
      type: 'public-key',
      transports: dev.transports,
    })), // 우선 null 
    rpID,
    userVerification: 'preferred',
  }

  const options = await generateAuthenticationOptions(opts);

  console.log("쿠키를 생성 합니다. ", options.challenge, req.headers.cookie)
  res.cookie("webAuthn", options.challenge, {
    httpOnly: true,
    sameSite: 'None',
    secure: true,
    maxAge: defaultTimeOut,
  });  
  
  res.send({msg: "ok", data: options})
});

router.post('/verify-authentication', async (req, res) => {
  const body = req.body;
  let cookies; 
  if (req.headers && req.headers.cookie !== undefined){
    cookies = cookie.parse(req.headers.cookie);
  }
  const expectedChallenge = cookies ? cookies.webAuthn : "";  
  const user = inMemoryUserDeviceDB[loggedInUserId];
  let dbAuthenticator;
  const bodyCredIDBuffer = isoBase64URL.toBuffer(body.rawId);  
  res.clearCookie('webAuthn');

  for (const dev of user.devices) {
    if (isoUint8Array.areEqual(dev.credentialID, bodyCredIDBuffer)) {
      dbAuthenticator = dev;
      break;
    }
  }

  if (!dbAuthenticator) {
    return res.status(400).send({
      error: 'Authenticator is not registered with this site',
    });
  }

  try {
    const opts = {
      response: body,
      expectedChallenge: `${expectedChallenge}`,
      expectedOrigin,
      expectedRPID: rpID,
      authenticator: dbAuthenticator,
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
    // Update the authenticator's counter in the DB to the newest count in the authentication
    dbAuthenticator.counter = authenticationInfo.newCounter;
  }
  res.send({ verified });
});

module.exports = router;