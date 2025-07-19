// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCuzI3hx1BNleiuz3uB_kve1_2EkeyoMOE",
  authDomain: "igwt-platform.firebaseapp.com",
  projectId: "igwt-platform",
  storageBucket: "igwt-platform.firebasestorage.app",
  messagingSenderId: "705442538668",
  appId: "1:705442538668:web:f80a089fcf039823b9ab09",
  measurementId: "G-SX91C0R1TB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
