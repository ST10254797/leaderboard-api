<h1 align="center" style="color:#6A0DAD;">🎮 Speed Swipe Leaderboard API</h1>

<p align="center">
  <strong>A secure backend for storing and retrieving game scores for the Speed Swipe app.</strong>
</p>

---

<h2 style="color:#6A0DAD;">📝 Overview</h2>

The **Speed Swipe Leaderboard API** is a Node.js + Express backend integrated with **Firebase**. It allows your game to:

<ul>
  <li>Submit scores securely using Firebase Authentication.</li>
  <li>Retrieve top scores for the leaderboard.</li>
  <li>Handle multiple users with unique IDs.</li>
  <li>Ensure timestamped and ordered scores for fair competition.</li>
</ul>

<p>This API is designed to be consumed by the Speed Swipe Android app, but it can be adapted for other frontends as well.</p>

---

<h2 style="color:#6A0DAD;">⚙️ Features</h2>

<table style="width:100%; border: 1px solid #ddd; border-collapse: collapse;">
  <tr style="background-color:#6A0DAD; color:white;">
    <th style="padding:10px; border: 1px solid #ddd;">Feature</th>
    <th style="padding:10px; border: 1px solid #ddd;">Description</th>
  </tr>
  <tr>
    <td style="padding:10px; border: 1px solid #ddd;">Submit Score</td>
    <td style="padding:10px; border: 1px solid #ddd;">POST /score with Firebase ID token.</td>
  </tr>
  <tr>
    <td style="padding:10px; border: 1px solid #ddd;">Get Top Scores</td>
    <td style="padding:10px; border: 1px solid #ddd;">GET /scores?limit=N returns top N scores.</td>
  </tr>
  <tr>
    <td style="padding:10px; border: 1px solid #ddd;">Secure Authentication</td>
    <td style="padding:10px; border: 1px solid #ddd;">Validates Firebase tokens for all requests.</td>
  </tr>
  <tr>
    <td style="padding:10px; border: 1px solid #ddd;">Timestamped Scores</td>
    <td style="padding:10px; border: 1px solid #ddd;">Uses Firestore server timestamps to track score submission time.</td>
  </tr>
</table>

---

<h2 style="color:#6A0DAD;">💻 Installation</h2>

<pre style="background-color:#f4f4f4; padding:10px; border-radius:5px;">
# Clone the repo
git clone https://github.com/ST10254797/leaderboard-api.git
cd leaderboard-api

# Install dependencies
npm install

# Run the server locally
node index.js
</pre>

---

<h2 style="color:#6A0DAD;">🚀 API Endpoints</h2>

<h3>1. POST /score</h3>

<p>Submit a new score to the leaderboard.</p>

<pre style="background-color:#f4f4f4; padding:10px; border-radius:5px;">
POST http://localhost:5000/score
Headers:
  Authorization: Bearer &lt;Firebase_ID_Token&gt;
Body (JSON):
{
  "score": 1500
}
</pre>

<h3>2. GET /scores</h3>

<p>Fetch top N scores for the leaderboard.</p>

<pre style="background-color:#f4f4f4; padding:10px; border-radius:5px;">
GET http://localhost:5000/scores?limit=10
Headers:
  Authorization: Bearer &lt;Firebase_ID_Token&gt;

Response (JSON):
[
  {
    "userId": "Oiyi3RG6JSQDB1tSZw0PNiNY9HD3",
    "username": "john@gmail.com",
    "score": 1500,
    "timestamp": { "_seconds": 1758967799, "_nanoseconds": 299000000 }
  }
]
</pre>

---

<h2 style="color:#6A0DAD;">🔒 Security</h2>

<ul>
  <li>All requests require a valid **Firebase Authentication token**.</li>
  <li>Scores are stored securely in **Firestore** with a timestamp.</li>
  <li>Protects against fake score submissions.</li>
</ul>

---

<h2 style="color:#6A0DAD;">📦 Deployment</h2>

<p>The API can be deployed to **Render**, **Heroku**, or any Node.js hosting service:</p>

<pre style="background-color:#f4f4f4; padding:10px; border-radius:5px;">
# Set environment variable for Firebase service key
SERVICE_ACCOUNT_KEY="your_service_account_json_here"

# Start server
node index.js
</pre>

<p>After deployment, update the Android app to point to the public API URL.</p>

---

<h2 style="color:#6A0DAD;">🎯 Usage in Android App</h2>

<ul>
  <li>Obtain a Firebase ID token after the user logs in.</li>
  <li>Send the token in the <code>Authorization</code> header with each request.</li>
  <li>Use POST /score to submit scores and GET /scores to display the leaderboard.</li>
</ul>

---

<h2 style="color:#6A0DAD;">📷 Screenshot / Logs</h2>

<p>Example server logs showing score submission:</p>

<pre style="background-color:#f4f4f4; padding:10px; border-radius:5px;">
Server running on port 5000
Incoming score request: { score: 1500 }
Score saved with ID: yjrXb0hnd2ipmBlpnmrS
Fetching top 10 scores
</pre>

---

<h2 style="color:#6A0DAD;">💡 Notes</h2>

<ul>
  <li>Offline support and biometric authentication are handled in the Android app.</li>
  <li>Push notifications for leaderboard updates can be added via Firebase Cloud Messaging.</li>
  <li>Multi-language support is app-side and fully compatible with this API.</li>
</ul>

---

<p align="center" style="color:#6A0DAD;">Made with ❤️ for Speed Swipe</p>
