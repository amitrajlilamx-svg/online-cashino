
import { auth, db } from "./firebase-config.js";

import {
  ref,
  get,
  update
} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-database.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-auth.js";

// Set MYR for the currently logged-in user
export async function setUserCurrencyMYR(uid) {
  if (!uid) return;

  const userRef = ref(db, "users/" + uid);

  await update(userRef, {
    currency: "MYR"
  });
}

// Admin-only migration:
// Call this only from a trusted server using Firebase Admin SDK.
// Never expose database-wide migration access in a public webpage.
export async function getCurrentUserCurrency() {
  const user = auth.currentUser;

  if (!user) return null;

  const snapshot = await get(
    ref(db, "users/" + user.uid + "/currency")
  );

  return snapshot.val();
}

// Automatically set MYR for each signed-in user
onAuthStateChanged(auth, async user => {
  if (!user) return;

  try {
    await setUserCurrencyMYR(user.uid);
    console.log("User currency set to MYR");
  } catch (error) {
    console.error("Currency update failed:", error);
  }
});
