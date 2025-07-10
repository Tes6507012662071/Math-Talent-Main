import express from "express";

const app = express();

app.get("/", (req, res) => {
  const userId = req.user?.id; // <- TypeScript ต้องไม่ error ที่นี่
  res.send("OK");
});
