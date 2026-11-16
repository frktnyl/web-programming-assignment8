import express from "express";
import path from "node:path";

const app = express();
const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(import.meta.dirname, "public");

let requestsServed = 0;

// 1. Request Logger
const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  next();
};

// 2. Request Counter
const requestCounter = (req, res, next) => {
  requestsServed += 1;
  next();
};

app.use(requestLogger);
app.use(requestCounter);

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});