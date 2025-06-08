const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const fileUpload = require("express-fileupload"); // Add this line

const app = express();
const port = process.env.PORT || 5000;

// --- Middleware ---
app.use(
  cors({
    origin: ["http://localhost:8080", "https://voyageahlaelkheir.vercel.app"], // Add your deployed frontend URL
    credentials: true,
  })
);
app.use(express.json({ limit: "50mb" }));
app.use(fileUpload({ useTempFiles: true })); // Add this middleware

// --- Database Connection ---
const uri = process.env.MONGODB_URI;
mongoose.connect(uri);
const connection = mongoose.connection;
connection.once("open", () => {
  console.log("MongoDB database connection established successfully!");
});

// --- API Routes ---
const programsRouter = require("./routes/programs");
const authRouter = require("./routes/auth");
const authMiddleware = require("./middleware/auth"); // Import auth middleware
const Program = require("./models/program.model"); // Import the Program model

app.get("/", (req, res) => {
  res.send("Ahla Travel Agency Dashboard API is running!");
});

app.use("/auth", authRouter); // Auth routes are public (login, register)

// Public route for fetching all programs (for the main site)
// This route should come BEFORE the protected programsRouter
// This route should come BEFORE the protected programsRouter
app.get("/programs", (req, res) => {
  // Use .select('-image') to exclude the image data when listing all programs
  Program.find()
    .select("-image")
    .then((programs) => res.json(programs))
    .catch((err) => res.status(400).json("Error: " + err));
});

// Protect all other /programs/* routes (POST, PUT, DELETE, and specific GET by ID)
// The programsRouter itself still contains these protected operations
app.use("/programs", authMiddleware, programsRouter);

// --- Start the Server ---
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
