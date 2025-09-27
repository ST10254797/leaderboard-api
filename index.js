const express = require("express");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");
const cors = require("cors");

// Init Firebase Admin
const serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const db = admin.firestore();

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Middleware to validate Firebase token
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
    res.status(403).json({ error: "Invalid token" });
  }
}

// POST /score → save a score
app.post("/score", authenticate, async (req, res) => {
  const { score } = req.body;
  if (!score) {
    return res.status(400).json({ error: "Score is required" });
  }

  const userId = req.user.uid;
  const username = req.user.email || "Anonymous"; // you could store displayName

  try {
    await db.collection("scores").add({
      userId,
      username,
      score,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
    res.json({ status: "success", message: "Score submitted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to save score" });
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

    const scores = snapshot.docs.map((doc) => doc.data());
    res.json(scores);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch scores" });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
