
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
  update
} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-database.js";

// HTML ELEMENTS
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

const registerBtn = document.getElementById("registerBtn");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");

const playBtn = document.getElementById("playBtn");
const message = document.getElementById("message");

// CHECK HTML ELEMENTS
if (
  !emailInput ||
  !passwordInput ||
  !registerBtn ||
  !loginBtn ||
  !logoutBtn ||
  !playBtn ||
  !message
) {
  console.error("ONLINE CASHINO: HTML element missing!");
  throw new Error("HTML elements missing. Check index.html");
}

// SHOW MESSAGE
function showMessage(text) {
  message.textContent = text;
}

// CREATE ACCOUNT
registerBtn.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    showMessage("Email और Password भरें!");
    return;
  }

  if (password.length < 6) {
    showMessage("Password कम से कम 6 अक्षर का होना चाहिए!");
    return;
  }

  registerBtn.disabled = true;
  loginBtn.disabled = true;

  showMessage("Account बनाया जा रहा है...");

  try {
    const result = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    try {
      await set(ref(db, "users/" + result.user.uid), {
        email: result.user.email,
        createdAt: Date.now(),
        lastLoginAt: Date.now(),
        gamePlayed: 0
      });

      showMessage("Account Successfully Created!");

    } catch (databaseError) {
      console.error("Database Error:", databaseError);
      showMessage("Account बना है, लेकिन profile save नहीं हुई।");
    }

  } catch (error) {
    console.error("Register Error:", error);
    showMessage("Registration Error: " + error.message);

  } finally {
    registerBtn.disabled = false;
    loginBtn.disabled = false;
  }
});

// LOGIN
loginBtn.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    showMessage("Email और Password भरें!");
    return;
  }

  loginBtn.disabled = true;
  registerBtn.disabled = true;

  showMessage("Logging in...");

  try {
    const result = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    showMessage("Login Successful! Welcome " + result.user.email);

    try {
      await update(ref(db, "users/" + result.user.uid), {
        lastLoginAt: Date.now()
      });
    } catch (databaseError) {
      console.error("Login Database Error:", databaseError);
    }

  } catch (error) {
    console.error("Login Error:", error);
    showMessage("Login Error: " + error.message);

  } finally {
    loginBtn.disabled = false;
    registerBtn.disabled = false;
  }
});

// LOGOUT
logoutBtn.addEventListener("click", async () => {
  try {
    await signOut(auth);
    showMessage("Logout Successful!");

  } catch (error) {
    console.error("Logout Error:", error);
    showMessage(error.message);
  }
});

// LOGIN STATUS
onAuthStateChanged(auth, (user) => {
  if (user) {
    showMessage("Welcome: " + user.email);

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

console.log("ONLINE CASHINO AUTH READY!");
