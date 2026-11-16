import express from "express";
import path from "node:path";

const app = express();
const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(import.meta.dirname, "public");

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});