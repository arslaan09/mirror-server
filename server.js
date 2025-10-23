const express = require("express");
const WebSocket = require("ws");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 10000;

// Serve static files
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json({ limit: "10mb" }));

// Serve UI
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

// WebSocket setup
const server = app.listen(PORT, () =>
  console.log(`✅ Mirror server running on port ${PORT}`)
);
const wss = new WebSocket.Server({ server });

let viewers = new Set();

wss.on("connection", (ws) => {
  console.log("🟢 Viewer connected");
  viewers.add(ws);
  ws.on("close", () => {
    console.log("🔴 Viewer disconnected");
    viewers.delete(ws);
  });
});

// Endpoint for iPhone to POST frames
app.post("/frame", (req, res) => {
  const { image } = req.body;
  if (image) {
    for (const v of viewers) {
      if (v.readyState === WebSocket.OPEN) v.send(image);
    }
  }
  res.sendStatus(200);
});
