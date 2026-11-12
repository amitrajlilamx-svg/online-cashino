
import { auth, db } from "./firebase-config.js";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-auth.js";

import {
  ref,
  set,
  update,
  get
} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-database.js";

// HTML ELEMENTS
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
  message.textContent = "Creating Account...";

  try {
    const result = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    const userRef = ref(db, "users/" + result.user.uid);

    await set(userRef, {
      email: result.user.email,
      demoPoints: 1000,
      createdAt: Date.now(),
      lastLoginAt: Date.now(),
      gamePlayed: 0
    });

    message.textContent = "Account Successfully Created!";

  } catch (error) {
    console.error("REGISTER ERROR:", error);
    message.textContent = "ERROR: " + error.message;
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
  message.textContent = "Logging in...";

  try {
    const result = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    const userRef = ref(db, "users/" + result.user.uid);
    const snapshot = await get(userRef);

    if (snapshot.exists()) {
      await update(userRef, {
        lastLoginAt: Date.now()
      });
    } else {
      await set(userRef, {
        email: result.user.email,
        demoPoints: 1000,
        createdAt: Date.now(),
        lastLoginAt: Date.now(),
        gamePlayed: 0
      });
    }

    message.textContent = "Login Successful!";

  } catch (error) {
    console.error("LOGIN ERROR:", error);
    message.textContent = "LOGIN ERROR: " + error.message;
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
    console.error("LOGOUT ERROR:", error);
    message.textContent = "ERROR: " + error.message;
  }
});

// LOGIN STATUS
onAuthStateChanged(auth, (user) => {
  const userMenu = document.getElementById("userMenu");
  const rouletteBox = document.getElementById("rouletteBox");

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

    if (userMenu) userMenu.hidden = false;
    if (rouletteBox) rouletteBox.hidden = false;

  } else {
    emailInput.disabled = false;
    passwordInput.disabled = false;

    registerBtn.hidden = false;
    loginBtn.hidden = false;
    logoutBtn.hidden = true;

    playBtn.disabled = true;

    if (userMenu) userMenu.hidden = true;
    if (rouletteBox) rouletteBox.hidden = true;
  }
});


// DEMO GAME
playBtn.addEventListener("click", () => {
  if (auth.currentUser) {
    alert("बाबाको खजानामा स्वागत छ!");
  } else {
    message.textContent = "Please Login First!";
  }
});

console.log("ONLINE CASHINO Authentication Ready!");
