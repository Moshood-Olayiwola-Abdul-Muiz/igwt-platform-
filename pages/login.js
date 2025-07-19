import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

function handleLogin(e) {
  e.preventDefault();
  const email = e.target.email.value;
  const password = e.target.password.value;

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      alert("Login successful!");
      // optionally redirect or store user info
    })
    .catch((error) => {
      alert("Error: " + error.message);
    });
}
