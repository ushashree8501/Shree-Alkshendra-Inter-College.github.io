
// var admin = require("firebase-admin");

// var serviceAccount = require("path/to/serviceAccountKey.json");

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount)
// });

// // {
// //     "hosting": {
// //       "site": "school-website-f1678",
  
// //       "public": "public",
// //       ...
// //     }
// //   }

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCIPwwfQPWJKFX8IpOw_C6NFnEnZM51XRE",
  authDomain: "school-website-f1678.firebaseapp.com",
  projectId: "school-website-f1678",
  storageBucket: "school-website-f1678.appspot.com",
  messagingSenderId: "506691853197",
  appId: "1:506691853197:web:03b00e2e39ace5605b3bc4",
  measurementId: "G-04XXGYKSE8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);