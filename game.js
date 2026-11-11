
import { auth, db } from "./firebase-config.js";

import {
  ref,
  runTransaction,
  push
} from "https://www.gstatic.com/firebasejs/13.2.0/firebase-database.js";

const playBtn = document.getElementById("playBtn");
const gameScreen = document.getElementById("gameScreen");
const gameMessage = document.getElementById("gameMessage");
const demoPoints = document.getElementById("demoPoints");
const againBtn = document.getElementById("againBtn");
const chests = document.querySelectorAll(".chest");

let points = 0;
let played = false;

if (
  !playBtn ||
  !gameScreen ||
  !gameMessage ||
  !demoPoints ||
  !againBtn ||
  chests.length === 0
) {
  console.error("Game HTML elements missing!");
} else {

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

      chests.forEach(item => {
        item.disabled = true;
      });

      const rewards = [0, 5, 10, 20, 50];

      const reward =
        rewards[Math.floor(Math.random() * rewards.length)];

      chest.textContent = "💎";
      gameMessage.textContent = "Saving Demo Points...";

      try {
        const userRef = ref(db, "users/" + user.uid);

        // Create one unique history ID for this game
        const historyRef = push(
          ref(db, "users/" + user.uid + "/transactions")
        );

        const historyKey = historyRef.key;
        const gameTime = Date.now();

        if (!historyKey) {
          throw new Error("History ID could not be created.");
        }

        // Save points and history together atomically
        const result = await runTransaction(userRef, current => {
          if (current === null) {
            current = {
              email: user.email,
              createdAt: Date.now()
            };
          }

          current.demoPoints =
            (Number(current.demoPoints) || 0) + reward;

          current.gamePlayed =
            (Number(current.gamePlayed) || 0) + 1;

          current.lastGameActivity = gameTime;

          if (
            !current.transactions ||
            typeof current.transactions !== "object"
          ) {
            current.transactions = {};
          }

          current.transactions[historyKey] = {
            type: "GAME_RESULT",
            pointsChange: reward,
            balanceAfter: current.demoPoints,
            createdAt: gameTime
          };

          return current;
        });

        if (!result.committed) {
          throw new Error("Database transaction was not committed.");
        }

        const savedData = result.snapshot.val();

        points = Number(savedData.demoPoints) || 0;

        demoPoints.textContent = "Demo Points: " + points;

        gameMessage.textContent = reward > 0
          ? "🎉 बधाई छ! तपाईंले " + reward + " Demo Points जित्नुभयो!"
          : "😊 यसपटक कुनै Demo Points आएनन्।";

        console.log("Firebase Saved:", savedData);
        console.log("Wallet History Saved:", savedData.transactions);

      } catch (error) {
        console.error("Firebase Save Error:", error);

        gameMessage.textContent =
          "Points save हुन सकेन: " + error.message;

        played = false;

        chests.forEach(item => {
          item.disabled = false;
        });
      }
    });
  });

  againBtn.addEventListener("click", resetGame);

  resetGame();
}

console.log("ONLINE CASHINO GAME READY!");
