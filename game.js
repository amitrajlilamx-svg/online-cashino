
import { auth, db } from "./firebase.js";

import {
  ref,
  update,
  increment
} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-database.js";

const playBtn = document.getElementById("playBtn");
const gameScreen = document.getElementById("gameScreen");
const gameMessage = document.getElementById("gameMessage");
const demoPoints = document.getElementById("demoPoints");
const againBtn = document.getElementById("againBtn");
const chests = document.querySelectorAll(".chest");

let points = 0;
let played = false;

playBtn.addEventListener("click", () => {
  if (!auth.currentUser) {
    alert("पहिले Login गर्नुहोस्!");
    return;
  }

  gameScreen.hidden = false;
  gameScreen.scrollIntoView({ behavior: "smooth" });
});

function resetGame() {
  played = false;

  gameMessage.textContent = "एउटा बाकस छान्नुहोस्!";

  chests.forEach(chest => {
    chest.textContent = "🎁";
    chest.disabled = false;
  });
}

chests.forEach(chest => {
  chest.addEventListener("click", async () => {
    if (played) return;

    const user = auth.currentUser;

    if (!user) {
      gameMessage.textContent = "पहिले Login गर्नुहोस्!";
      return;
    }

    played = true;

    const rewards = [0, 5, 10, 20, 50];

    const reward = rewards[
      Math.floor(Math.random() * rewards.length)
    ];

    points += reward;

    chest.textContent = "💎";

    chests.forEach(item => {
      item.disabled = true;
    });

    gameMessage.textContent =
      reward > 0
        ? "🎉 बधाई छ! तपाईंले " + reward + " Demo Points जित्नुभयो!"
        : "😊 यसपटक कुनै Demo Points आएनन्। फेरि प्रयास गर्नुहोस्!";

    demoPoints.textContent = "Demo Points: " + points;

    // SAVE GAME ACTIVITY
    try {
      await update(ref(db, "users/" + user.uid), {
        gamePlayed: increment(1),
        lastGameActivity: Date.now()
      });

      console.log("Game Activity Saved!");

    } catch (error) {
      console.error("Game Activity Save Error:", error);
      gameMessage.textContent += " (Activity save हुन सकेन)";
    }
  });
});

againBtn.addEventListener("click", resetGame);

console.log("BABA KA KHAJANA GAME READY!");
