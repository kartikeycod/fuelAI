// const admin = require("firebase-admin");
// const path = require("path");

// // Firebase project (fuel-verification-efff2) ki key ka path
// const serviceAccount = require("./firebase-key.json");

// if (!admin.apps.length) {
//   admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount)
//   });
// }

// const db = admin.firestore();
// module.exports = db;
const admin = require("firebase-admin");

// 1. Pehle check karega ki kya Environment Variable mein key hai (for Render/Cloud)
// 2. Agar nahi hai, toh local file use karega (for Localhost)
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT 
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT) 
  : require("./firebase-key.json"); 

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();
module.exports = db;