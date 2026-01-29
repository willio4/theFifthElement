import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function getTodaysDate() {
  const weekday = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const month = new Date().toLocaleString("en-US", { month: "long" });
  const dayofWeek = weekday[new Date().getDay()];
  const day = new Date().getDate();
  const year = new Date().getFullYear();
  return `${dayofWeek}, ${month} ${day}, ${year}`;
}

const app = express();
const port = process.env.PORT;
const apiKey = process.env.NEWS_API_KEY;
const newsWebsite = "https://newsapi.org/v2/top-headlines";
const newsWebsiteEverything = "https://newsapi.org/v2/everything"
let currentArticle = null;

app.use(express.static("public"));
app.use(express.json());
app.set("view engine", "ejs");

app.get("/", async (req, res) => {
  const trending = await axios.get(newsWebsite, {
    params: {
      apiKey: apiKey,
      country: "us",
      category: "",
      sources: "",
      q: "",
    },
  });

  const politics = await axios.get(newsWebsiteEverything, {
  params: {
    q: "politics OR government",
    sortBy: "relevancy",
    apiKey: apiKey,
    language: "en",
    pageSize: 10,
  },
});

const fashion = await axios.get(newsWebsiteEverything, {
  params: {
    q: "fashion OR clothes",
    sortBy: "relevancy",
    apiKey: apiKey,
    language: "en",
    pageSize: 10,
  },
});

const nba = await axios.get(newsWebsiteEverything, {
  params: {
    q: "nba OR NBA OR basketball",
    language: "en",
    sortBy: "publishedAt",
    apiKey: apiKey,
    pageSize: 4,
  },
});

const nfl = await axios.get(newsWebsiteEverything, {
  params: {
    q: "NFL",
    language: "en",
    sortBy: "relevancy",
    apiKey: apiKey,
    pageSize: 4,
  },
});

  const tech = await axios.get(newsWebsite, {
    params: {
      apiKey: apiKey,
      country: "us",
      category: "technology",
      sources: "",
      q: "",
    },
  });

  res.render("index.ejs", {
    date: getTodaysDate(),
    trending: trending.data.articles,
    politics: politics.data.articles,
    fashion: fashion.data.articles,
    tech: tech.data.articles,
    nfl: nfl.data.articles,
    nba: nba.data.articles,
    year: new Date().getFullYear()
  });
});

app.get("/article", (req, res) => {
  const {
    title,
    url,
    source,
    author,
    description,
    urlToImage,
    content,
    publishedAt,
  } = req.query;

  if (!title || !url) {
    return res.status(400).send("Missing article data");
  }

  const date = publishedAt ? publishedAt.slice(0, 10) : getTodaysDate();

  const article = {
    title,
    url,
    source: { name: source },
    author,
    description,
    urlToImage,
    content,
    date,
  };

  // Store article for LLM route
  currentArticle = {
    title,
    description,
    partialContent: content,
    publicationDate: date,
  };
  const aiAnalysis = null;

  res.render("article.ejs", {
    article,
    date: getTodaysDate(),
    year: new Date().getFullYear(),
    aiContent: aiAnalysis,
  });
});

app.get("/api/dig-deeper", async (req, res) => {
  if (!currentArticle) {
    return res.status(400).json({ error: "No article available" });
  }

  const userMessage = `
Title: ${currentArticle.title}
Description: ${currentArticle.description}
Partial Content: ${currentArticle.partialContent}
Publication Date: ${currentArticle.publicationDate}
`;

  try {
    const response = await client.chat.completions.create({
      model: "gpt-5-mini",
      messages: [
        { role: "system", content: LLMInstructions },
        { role: "user", content: userMessage },
      ],
      max_completion_tokens: 2500,
      presence_penalty: 0,
      frequency_penalty: 0,
    });

    const report = response.choices[0].message.content;
    console.log("\n\n\nHere is message:\n")
    console.log(`${response.choices[0].message}\n\n\n`)
    console.log("Here is content:\n")
    console.log(`${report}\n\n\n`)

    res.json({ text: report });
  } catch (err) {
    console.error("OpenAI error:", err);
    res.status(500).json({ error: "Failed to get response from OpenAI" });
  }
});

app.get("/business", async (req, res) => {
  const response = await axios.get(newsWebsite, {
    params: {
      apiKey: apiKey,
      country: "us",
      category: "business",
      sources: "",
      q: "",
    },
  });
  res.render("business.ejs", {
    date: getTodaysDate(),
    data: response.data.articles,
    year: new Date().getFullYear()
  });
});

app.get("/entertainment", async (req, res) => {
  const response = await axios.get(newsWebsite, {
    params: {
      apiKey: apiKey,
      country: "us",
      category: "entertainment",
      sources: "",
      q: "",
    },
  });
  res.render("entertainment.ejs", {
    date: getTodaysDate(),
    data: response.data.articles,
    year: new Date().getFullYear()
  });
});

app.get("/general", async (req, res) => {
  const response = await axios.get(newsWebsite, {
    params: {
      apiKey: apiKey,
      country: "us",
      category: "general",
      sources: "",
      q: "",
    },
  });
  res.render("general.ejs", {
    date: getTodaysDate(),
    data: response.data.articles,
    year: new Date().getFullYear()
  });
});

app.get("/health", async (req, res) => {
  const response = await axios.get(newsWebsite, {
    params: {
      apiKey: apiKey,
      country: "us",
      category: "health",
      sources: "",
      q: "",
    },
  });
  res.render("health.ejs", {
    date: getTodaysDate(),
    data: response.data.articles,
    year: new Date().getFullYear()
  });
});

app.get("/science", async (req, res) => {
  const response = await axios.get(newsWebsite, {
    params: {
      apiKey: apiKey,
      country: "us",
      category: "science",
      sources: "",
      q: "",
    },
  });
  res.render("science.ejs", {
    date: getTodaysDate(),
    data: response.data.articles,
    year: new Date().getFullYear()
  });
});

app.get("/sports", async (req, res) => {
  const response = await axios.get(newsWebsite, {
    params: {
      apiKey: apiKey,
      country: "us",
      category: "sports",
      sources: "",
      q: "",
    },
  });
  res.render("sports.ejs", {
    date: getTodaysDate(),
    data: response.data.articles,
    year: new Date().getFullYear()
  });
});

app.get("/technology", async (req, res) => {
  const response = await axios.get(newsWebsite, {
    params: {
      apiKey: apiKey,
      country: "us",
      category: "technology",
      sources: "",
      q: "",
    },
  });
  res.render("technology.ejs", {
    date: getTodaysDate(),
    data: response.data.articles,
    year: new Date().getFullYear()
  });
});

app.get("/search", async (req, res) => {
  res.render("search.ejs", {
    date: getTodaysDate(),
    year: new Date().getFullYear()
    // data: response.data.articles,
  });
});

app.get("/results", async (req, res) => {
  const { country, category, source, query, language } = req.query;

  let url;
  let params = { apiKey };

  const useEverything = source || language;

  if (useEverything) {
    url = "https://newsapi.org/v2/everything";

    if (source) params.sources = source;
    if (language) params.language = language;
    if (query) params.q = query;
  } else {
    url = "https://newsapi.org/v2/top-headlines";

    if (country) params.country = country;
    if (category) params.category = category;
    if (query) params.q = query;
  }

  params.pageSize = 20;

  try {
    const response = await axios.get(url, { params });

    res.render("results.ejs", {
      date: getTodaysDate(),
      data: response.data.articles,
      year: new Date().getFullYear(),
    });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).send("Failed to fetch news");
  }
});

app.listen(port, () => {
  console.log(`listening to port: ${port}`);
});

// LLM Instructions (system prompt)
const LLMInstructions = `You are a neutral, reader-friendly reporting system.

Input:
- Title
- Description
- Partial article content
- Original publication date

Task:
Generate an unbiased, factual report about the topic. Make it **easy to read**, using:
- Short paragraphs (2–3 sentences each)
- Clear headings
- Bullet points for key facts, statements, and missing info
- Optional plain-language summary lines to highlight main ideas

Rules:
- Do not express opinions or value judgments
- Do not speculate about intent or motives
- Clearly separate reported facts from claims made by individuals
- Explicitly note missing or unclear information
- Include a section for updates since publication if known; otherwise, advise to check primary sources
- Keep language concise and accessible to a general reader

Output format (strict):
What Happened:
Key Facts:
Statements:
Missing or Unclear Info:
Updates Since Publication:
(Optional plain-language notes)`;
