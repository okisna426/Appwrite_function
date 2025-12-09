// Load required libraries (Node 16 uses require)
const sdk = require("node-appwrite");
const axios = require("axios");

module.exports = async function ({ req, res, log, error }) {
  try {
    // Parse request body
    const body = req.body ? JSON.parse(req.body) : {};

    const title = body.title || "Default Title";
    const message = body.body || "Default Message";
    const topic = body.topic || "demo-topic";

    // ---- 1. Appwrite client setup ----
    const client = new sdk.Client()
      .setEndpoint(process.env.APPWRITE_ENDPOINT)       // Example: http://IP/v1
      .setProject(process.env.APPWRITE_PROJECT_ID)      // Project ID
      .setKey(process.env.APPWRITE_API_KEY);            // API Key

    const databases = new sdk.Databases(client);

    // ---- 2. Save notification data in Appwrite DB ----
    await databases.createDocument(
      process.env.NOTIF_DB_ID,             // notifications_db
      process.env.NOTIF_COLLECTION_ID,     // notifications
      "unique()",                           // Auto ID
      {
        title: title,
        body: message,
        topic: topic,
        status: "sent"
      }
    );

    // ---- 3. Send ntfy notification ----
    const ntfyUrl = process.env.NTFY_URL;   // Example: http://K8S_IP:30100

    await axios.post(`${ntfyUrl}/${topic}`, message, {
      headers: {
        "Title": title
      }
    });

    return res.json({
      success: true,
      message: "Notification saved + sent via ntfy 🎉"
    });
  } catch (err) {
    error(err);
    return res.json({
      success: false,
      error: err.message
    });
  }
};
