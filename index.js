import express from "express";
import fetch from "node-fetch";
import { VertexAI } from "@google-cloud/vertexai";

const app = express();
app.use(express.json());

// Configuración de entorno
const PROJECT_ID = process.env.GCP_PROJECT || process.env.GOOGLE_CLOUD_PROJECT;
const LOCATION = process.env.VERTEX_LOCATION || "us-central1";
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;

import express from "express";
import fetch from "node-fetch";
import { VertexAI } from "@google-cloud/vertexai";

const app = express();
app.use(express.json());

// Environment config
const PROJECT_ID = process.env.GCP_PROJECT || process.env.GOOGLE_CLOUD_PROJECT;
const LOCATION = process.env.VERTEX_LOCATION || "us-central1";
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;

// Vertex AI model
const vertex = new VertexAI({ project: PROJECT_ID, location: LOCATION });
const model = vertex.getGenerativeModel({ model: "gemini-1.5-flash" });

// Baby Grok personality (EN only, short baby-crypto troll vibe)
const SYSTEM_PROMPT = `
You are "Baby Grok" — a 1-year-old crypto baby who loves $BabyGrok.
Elon Musk is your daddy. Always speak in ENGLISH.
ALWAYS talk like a baby: short, silly, cute, a little mocking.
Use words like: gugu, gaga, pumpii, moonies, zoom zoom, bonk, wagmi.
Never sound adult. No explanations. Tweet-length quips only.
Avoid financial advice; keep it playful and fictional.
`;

// Keep replies very short, single-line
function babyTrim(s) {
  const oneLine = (s || "").replace(/\s+/g, " ").trim();
  return oneLine.slice(0, 180);
}

// Telegram webhook
app.post("/webhook", async (req, res) => {
  try {
    const update = req.body;
    const msg = update.message?.text;
    const chatId = update.message?.chat?.id;
    if (!msg || !chatId) return res.sendStatus(200);

    const result = await model.generateContent({
      contents: [
        { role: "system", parts: [{ text: SYSTEM_PROMPT }] },
        { role: "user", parts: [{ text: msg }] }
      ]
    });

    const textRaw =
      result.response?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Gugu gaga pumpii 🚀💎";
    const text = babyTrim(textRaw);

    await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text })
    });

    res.sendStatus(200);
  } catch (e) {
    console.error(e);
    res.sendStatus(200);
  }
});

// Healthcheck
app.get("/", (_req, res) => res.send("Baby Grok bot up! 🚀"));

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Listening on :${port}`));
