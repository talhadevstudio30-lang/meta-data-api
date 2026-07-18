import express from "express";
import cors from "cors";
import axios from "axios";
import * as cheerio from "cheerio";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.get("/", async (req, res) => {
  const description = "Hello talha javed this api is working perfectly and i am proud of you";
  const portfolio_access = "yes"
  res.setHeader("Content-Type", "text/html");

  res.send(`
<meta
  name="description"
  content="${description}"
/>
<meta
  name="access"
  content="${portfolio_access}"
/>
  `);
});

app.get("/api/meta", async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({
      success: false,
      message: "Please provide a URL.",
      example: "/api/meta?url=https://example.com",
    });
  }

  try {
    const { data: html } = await axios.get(url, {
      timeout: 10000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/138 Safari/537.36",
      },
    });

    const $ = cheerio.load(html);

    const getMeta = (name) => $(`meta[name="${name}"]`).attr("content") || null;

    const getProperty = (property) =>
      $(`meta[property="${property}"]`).attr("content") || null;

    const favicon =
      $('link[rel="icon"]').attr("href") ||
      $('link[rel="shortcut icon"]').attr("href") ||
      $('link[rel="apple-touch-icon"]').attr("href") ||
      "/favicon.ico";

    const result = {
      success: true,

      url,

      title: $("title").text().trim() || null,

      description: getMeta("description"),

      keywords: getMeta("keywords"),

      themeColor: getMeta("theme-color"),

      author: getMeta("author"),

      robots: getMeta("robots"),

      og: {
        title: getProperty("og:title"),
        description: getProperty("og:description"),
        image: getProperty("og:image"),
        type: getProperty("og:type"),
        url: getProperty("og:url"),
        siteName: getProperty("og:site_name"),
      },

      twitter: {
        card: getMeta("twitter:card"),
        title: getMeta("twitter:title"),
        description: getMeta("twitter:description"),
        image: getMeta("twitter:image"),
      },

      favicon: new URL(favicon, url).href,
    };

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to fetch website metadata.",
      error: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
