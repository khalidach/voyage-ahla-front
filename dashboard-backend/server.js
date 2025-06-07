// Import necessary libraries
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// --- Middleware ---
app.use(cors());
// Increase the limit to handle large Base64 image strings
app.use(express.json({ limit: "50mb" }));

// --- Database Connection ---
const uri = process.env.MONGODB_URI;
mongoose.connect(uri);
const connection = mongoose.connection;
connection.once("open", () => {
  console.log("MongoDB database connection established successfully!");
});

// --- API Routes ---
const programsRouter = require("./routes/programs");

app.get("/", (req, res) => {
  res.send("Ahla Travel Agency Dashboard API is running!");
});

app.use("/programs", programsRouter);

// --- Start the Server ---
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
