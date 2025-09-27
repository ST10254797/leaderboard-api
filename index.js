const express = require("express");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");
const cors = require("cors");

// Init Firebase Admin using environment variable
let serviceAccount = JSON.parse(process.env.SERVICE_ACCOUNT_KEY);

// Fix PEM formatting for the private key
serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');

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
    console.warn("Missing or invalid Authorization header");
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

// POST /score → save a score
app.post("/score", authenticate, async (req, res) => {
  console.log("Incoming score request:", req.body);

  const { score } = req.body;
  if (!score) {
    console.warn("Score missing in request body");
    return res.status(400).json({ error: "Score is required" });
  }

  const userId = req.user.uid;
  const username = req.user.email || "Anonymous";

  try {
    const docRef = await db.collection("scores").add({
      userId,
      username,
      score,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log(`Score saved with ID: ${docRef.id}`);
    res.json({ status: "success", message: "Score submitted" });
  } catch (err) {
    console.error("Firestore error:", err);
    res.status(500).json({ error: "Failed to save score", details: err.message });
  }
});

// GET /scores?limit=10 → return top N scores
app.get("/scores", async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  console.log(`Fetching top ${limit} scores`);
  try {
    const snapshot = await db
      .collection("scores")
      .orderBy("score", "desc")
      .limit(limit)
      .get();

    const scores = snapshot.docs.map((doc) => doc.data());
    res.json(scores);
  } catch (err) {
    console.error("Firestore fetch error:", err);
    res.status(500).json({ error: "Failed to fetch scores", details: err.message });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
