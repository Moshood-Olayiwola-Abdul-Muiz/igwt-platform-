import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase"; // adjust if firebase.js is elsewhere

function handleSignup(e) {
  e.preventDefault();
  const email = e.target.email.value;
  const password = e.target.password.value;

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      alert("Signup successful!");
      // optionally redirect or store user info
    })
    .catch((error) => {
      alert("Error: " + error.message);
    });
            }
