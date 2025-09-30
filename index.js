const express = require("express");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");
const cors = require("cors");

// Init Firebase Admin using environment variable
const serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT_KEY);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Middleware: validate Firebase token
async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  const idToken = authHeader.split("Bearer ")[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (err) {
    console.error("Token verification failed:", err);
    res.status(403).json({ error: "Invalid token", details: err.message });
  }
}

// POST /scores → save a score
app.post("/scores", authenticate, async (req, res) => {
  const { score } = req.body;
  if (score === undefined) {
    return res.status(400).json({ error: "Score is required" });
  }

  const userId = req.user.uid;
  const username = req.user.email || "Anonymous";

  try {
    // Keep highest score per user
    const userDoc = db.collection("scores").doc(userId);
    const snapshot = await userDoc.get();

    if (!snapshot.exists || snapshot.data().score < score) {
      await userDoc.set({
        userId,
        username,
        score,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });
      return res.json({ status: "success", message: "New high score saved!" });
    } else {
      return res.json({ status: "ok", message: "Score not higher than current high score" });
    }
  } catch (err) {
    console.error("Firestore error:", err);
    res.status(500).json({ error: "Failed to save score", details: err.message });
  }
});

// GET /scores?limit=10 → return top N scores
app.get("/scores", async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  try {
    const snapshot = await db
      .collection("scores")
      .orderBy("score", "desc")
      .limit(limit)
      .get();

    const scores = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        userId: data.userId,
        username: data.username,
        score: data.score,
        timestamp: data.timestamp ? data.timestamp.toDate().toISOString() : null,
      };
    });

    res.json(scores);
  } catch (err) {
    console.error("Firestore fetch error:", err);
    res.status(500).json({ error: "Failed to fetch scores", details: err.message });
  }
});

// Root check
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Leaderboard API is live! Use POST /scores to submit a score or GET /scores to fetch top scores." });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));