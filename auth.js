
import { auth, db } from "./firebase.js";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-auth.js";

import {
  ref,
  set,
  update
} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-database.js";

// HTML Elements
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

const registerBtn = document.getElementById("registerBtn");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const playBtn = document.getElementById("playBtn");
const message = document.getElementById("message");

// CREATE ACCOUNT
registerBtn.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    message.textContent = "Email और Password भरें!";
    return;
  }

  if (password.length < 6) {
    message.textContent = "Password कम से कम 6 अक्षर का होना चाहिए!";
    return;
  }

  registerBtn.disabled = true;

  try {
    const result = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    await set(ref(db, "users/" + result.user.uid), {
      email: result.user.email,
      createdAt: Date.now(),
      lastLoginAt: Date.now(),
      gamePlayed: 0
    });

    message.textContent = "Account Successfully Created!";

  } catch (error) {
    message.textContent = error.message;
  } finally {
    registerBtn.disabled = false;
  }
});

// LOGIN
loginBtn.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    message.textContent = "Email और Password भरें!";
    return;
  }

  loginBtn.disabled = true;

  try {
    const result = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    // SAVE LAST LOGIN
    await update(ref(db, "users/" + result.user.uid), {
      lastLoginAt: Date.now()
    });

    message.textContent = "Login Successful!";

  } catch (error) {
    message.textContent = error.message;
  } finally {
    loginBtn.disabled = false;
  }
});

// LOGOUT
logoutBtn.addEventListener("click", async () => {
  try {
    await signOut(auth);
    message.textContent = "Logout Successful!";
  } catch (error) {
    message.textContent = error.message;
  }
});

// LOGIN STATUS
onAuthStateChanged(auth, (user) => {
  if (user) {
    message.textContent = "Welcome: " + user.email;

    emailInput.value = user.email;
    emailInput.disabled = true;
    passwordInput.value = "";
    passwordInput.disabled = true;

    registerBtn.hidden = true;
    loginBtn.hidden = true;
    logoutBtn.hidden = false;
    playBtn.disabled = false;

  } else {
    emailInput.disabled = false;
    passwordInput.disabled = false;

    registerBtn.hidden = false;
    loginBtn.hidden = false;
    logoutBtn.hidden = true;
    playBtn.disabled = true;
  }
});

// DEMO GAME
playBtn.addEventListener("click", () => {
  if (auth.currentUser) {
    alert("बाबाको खजानामा स्वागत छ!");
  }
});

console.log("ONLINE CASHINO Authentication Ready!");
