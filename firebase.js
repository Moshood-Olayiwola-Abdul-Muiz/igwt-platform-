// firebase.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth"; // ADD THIS

const firebaseConfig = {
  apiKey: "AIzaSyCuzI3hx1BNleiuz3uB_kve1_2EkeyoMOE",
  authDomain: "igwt-platform.firebaseapp.com",
  projectId: "igwt-platform",
  storageBucket: "igwt-platform.firebasestorage.app",
  messagingSenderId: "705442538668",
  appId: "1:705442538668:web:f80a089fcf039823b9ab09",
  measurementId: "G-SX91C0R1TB"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app); // ADD THIS

export { auth };
