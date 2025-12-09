import sdk from "node-appwrite";
import axios from "axios";

export default async ({ req, res, log, error }) => {
  try {
    const body = req.body ? JSON.parse(req.body) : {};

    const title = body.title || "Default Title";
    const message = body.body || "Default Message";
    const topic = body.topic || "demo-topic";

    // ---- 1. Appwrite client setup ----
    const client = new sdk.Client()
      .setEndpoint(process.env.APPWRITE_ENDPOINT)
      .setProject(process.env.APPWRITE_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY);

    const databases = new sdk.Databases(client);

    // ---- 2. Database me notification save karo ----
    await databases.createDocument(
      process.env.NOTIF_DB_ID,
      process.env.NOTIF_COLLECTION_ID,
      "unique()",
      {
        title,
        body: message,
        topic,
        status: "sent"
      }
    );

    // ---- 3. ntfy server ko POST request bhejo ----
    const ntfyUrl = process.env.NTFY_URL; // e.g. http://K8S_PUBLIC_IP:30100

    await axios.post(`${ntfyUrl}/${topic}`, message, {
      headers: {
        "Title": title
      }
    });

    return res.json({
      success: true,
      message: "Notification saved + sent via ntfy"
    });
  } catch (err) {
    error(err);
    return res.json({
      success: false,
      error: err.message
    });
  }
};
