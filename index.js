import express from "express";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

function getTodaysDate() {
  const month = new Date().toLocaleString("en-US", { month: "long" });
  const day = new Date().getDate();
  const year = new Date().getFullYear();
  return `${month} ${day}, ${year}`;
}

function generateLLMPrompt(currentArticle) {
  const prompt = LLMInstructions + JSON.stringify(currentArticle) + 'Treat all sources as potentially incomplete or biased unless independently corroborated. Use reputable, mainstream sources for updates and do not rely on a single outlet. If post-publication updates cannot be confirmed from reliable sources, state that updates are unavailable rather than estimating.';
  return prompt;
}

const app = express();
const port = process.env.PORT;
const apiKey = process.env.NEWS_API_KEY;
const newsWebsite = "https://newsapi.org/v2/top-headlines"
let currentArticle = {
  title: '',
  description: '',
  content: '',
  date: '',
}

app.use(express.static("public"));
app.use(express.json());
app.set("view engine", "ejs");

app.get("/", async (req, res) => {
  const response = await axios.get(newsWebsite, {
    params: {
      apiKey: apiKey,
      country: "us",
      category: "",
      sources: "",
      q: "",
    },
  });

  
  res.render("index.ejs", {
    date: getTodaysDate(),
    data: response.data.articles,
  });
});

app.get("/article", (req, res) => {
  const { title, url, source, author, description, urlToImage, content, publishedAt } = req.query;
  const date = publishedAt.slice(0,10);
  const article = {
      title,
      url,
      source: { name: source },
      author,
      description,
      urlToImage,
      content,
      date,
    }

    currentArticle = {
      title,
      description,
      content,
      date
    }

  LLMPrompt = generateLLMPrompt(currentArticle);

  if (!title || !url) return res.status(400).send("Missing article data");

  res.render("article.ejs", {
    article: article,
    date: getTodaysDate(),
  });
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
  console.log(response.data.articles[0]);
  res.render("science.ejs", {
    date: getTodaysDate(),
    data: response.data.articles,
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
  });
});

app.get("/search", async (req, res) => {
  
  res.render("search.ejs", {
    date: getTodaysDate(),
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
    });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).send("Failed to fetch news");
  }
});




app.listen(port, () => {
  console.log(`listening to port: ${port}`);
});

const LLMInstructions = 'You are a neutral analytical reporting system. Input provided:- Title- Description- Partial article content- Original publication date Task:Generate an unbiased factual report about the topic. Rules:- Do not express opinions or value judgments.- Do not speculate or infer intent.- Clearly separate verified facts from claims or interpretations.- Explicitly state when information is missing or unclear due to partial content.- Identify notable developments, corrections, or updates that occurred after the publication date.- If no reliable updates are known, explicitly say so.- Use precise, neutral language and avoid emotionally loaded wording.- Do not assume the original article is accurate or complete. Output format (strict):Overview:Key Facts:Claims and Perspectives:Unknown or Unclear Information:Updates Since Publication:Contextual Notes (optional, only if necessary): If information cannot be verified, label it accordingly. ';