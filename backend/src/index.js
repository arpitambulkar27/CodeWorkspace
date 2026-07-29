const express = require("express");
const cors = require("cors");
const runRoutes = require("./routes/run");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/health", (req, res) => res.json({ status: "ok" }));
app.use("/api", runRoutes);

app.listen(PORT, () => {
  console.log(`CodeForge backend running on http://localhost:${PORT}`);
});
