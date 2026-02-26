// // Import the functions you need from the SDKs you need
// import { initializeApp } from "firebase/app";
// // TODO: Add SDKs for Firebase products that you want to use
// // https://firebase.google.com/docs/web/setup#available-libraries

// // Your web app's Firebase configuration
// const firebaseConfig = {
//   apiKey: "AIzaSyB0AV2rqdWlhRSxvdy7mGej6OXOMNiNmP4",
//   authDomain: "fuel-verification-efff2.firebaseapp.com",
//   projectId: "fuel-verification-efff2",
//   storageBucket: "fuel-verification-efff2.firebasestorage.app",
//   messagingSenderId: "562408709293",
//   appId: "1:562408709293:web:90730ad066a24981647a24"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  // paste config here
  apiKey: "AIzaSyB0AV2rqdWlhRSxvdy7mGej6OXOMNiNmP4",
  authDomain: "fuel-verification-efff2.firebaseapp.com",
  projectId: "fuel-verification-efff2",
  storageBucket: "fuel-verification-efff2.firebasestorage.app",
  messagingSenderId: "562408709293",
  appId: "1:562408709293:web:90730ad066a24981647a24"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);