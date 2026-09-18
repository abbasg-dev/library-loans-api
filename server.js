require("dotenv").config();

const express = require("express");
const connectDB = require("./config/db");
const loanRoutes = require("./routes/loanRoutes");

const app = express();

connectDB();

app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
  });
});

app.use(process.env.API_URL, loanRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
