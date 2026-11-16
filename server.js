import express from "express";
import path from "node:path";

const app = express();
const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(import.meta.dirname, "public");

const PROGRAMME_COURSES = [
  { id: "CS101", title: "Foundations of Web Architecture", credits: 6 },
  { id: "CS204", title: "Server-Side Engineering with Node.js", credits: 5 },
  { id: "CS310", title: "Distributed Systems & HTTP Protocols", credits: 6 },
  { id: "CS350", title: "Modern Front-End & Browser APIs", credits: 5 }
];

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

// Statik dosyalar
app.use(express.static(PUBLIC_DIR));

app.get("/", (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, "index.html"));
});

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

// API Rotaları
app.get("/api/courses", (req, res) => {
  res.json(PROGRAMME_COURSES);
});

app.get("/api/status", (req, res) => {
  res.json({
    status: "ok",
    nodeVersion: process.version,
    uptimeSeconds: Math.floor(process.uptime())
  });
});

app.get("/api/headers", (req, res) => {
  res.json({
    userAgent: req.get("User-Agent") || "Not provided",
    accept: req.get("Accept") || "Not provided"
  });
});

app.post("/api/subscribe", (req, res) => {
  res.status(201).json({ subscribed: true });
});

app.get("/api/admin", (req, res) => {
  res.status(403).json({ error: "Forbidden" });
});

app.get("/api/stats", (req, res) => {
  res.json({ requestsServed });
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});