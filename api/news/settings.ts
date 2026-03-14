import type { VercelRequest, VercelResponse } from "@vercel/node";

let SETTINGS = {
  emailRecipient: "",
  dailyRunTime: "07:00",
  activeKeywords: {
    english: [
      "maternal death",
      "maternal mortality",
      "pregnant woman died",
      "delivery death",
      "ambulance delay",
      "hospital negligence",
    ],
    hindi: [
      "गर्भवती महिला की मौत",
      "प्रसूता की मौत",
      "डिलीवरी",
      "अस्पताल लापरवाही",
      "एम्बुलेंस",
      "रेफरल",
    ],
  },
  sourceConfig: [
    {
      id: "gdelt",
      name: "GDELT",
      type: "api",
      language: "en",
      url: "https://api.gdeltproject.org/api/v2/doc/doc",
      enabled: true,
    },
    {
      id: "newsapi",
      name: "NewsAPI",
      type: "api",
      language: "en",
      url: "https://newsapi.org/v2/everything",
      enabled: true,
    },
    {
      id: "rss",
      name: "RSS Feeds",
      type: "rss",
      language: "hi",
      url: "configured in backend",
      enabled: false,
    },
  ],
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "GET") {
    return res.status(200).json({ ok: true, settings: SETTINGS });
  }

  if (req.method === "POST") {
    SETTINGS = req.body;
    return res.status(200).json({ ok: true, settings: SETTINGS });
  }

  return res.status(405).json({ ok: false, error: "Method not allowed" });
}
