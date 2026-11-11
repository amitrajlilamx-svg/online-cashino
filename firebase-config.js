
import { initializeApp } from "https://www.gstatic.com/firebasejs/13.2.0/firebase-app.js";

import { getAuth } from "https://www.gstatic.com/firebasejs/13.2.0/firebase-auth.js";

import { getDatabase } from "https://www.gstatic.com/firebasejs/13.2.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCxWyQiqPbatAg6OmVqFwiIG5_SZ5aaIE",
  authDomain: "online-cashino-11c83.firebaseapp.com",
  databaseURL: "https://online-cashino-11c83-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "online-cashino-11c83",
  storageBucket: "online-cashino-11c83.firebasestorage.app",
  messagingSenderId: "571174499811",
  appId: "1:571174499811:web:d2f40192da630eb9811cd6",
  measurementId: "G-SVEXSN9SX2"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export const db = getDatabase(app);

console.log("ONLINE CASHINO FIREBASE CONNECTED!");
