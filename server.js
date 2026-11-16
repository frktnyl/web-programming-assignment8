import express from "express";
import path from "node:path";

const app = express();
const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(import.meta.dirname, "public");

let requestsServed = 0;

const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  next();
};

const requestCounter = (req, res, next) => {
  requestsServed += 1;
  next();
};

app.use(requestLogger);
app.use(requestCounter);

// Metin ve yönlendirme rotaları
app.get("/hello", (req, res) => {
  res.type("text/plain").send("Hello from Deniz's server!");
});

app.get("/robots.txt", (req, res) => {
  const robotsContent = "User-agent: *\nAllow: /\nDisallow: /api/admin";
  res.type("text/plain").send(robotsContent);
});

app.get("/old-page", (req, res) => {
  res.redirect("/hello");
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});