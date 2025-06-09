// dashboard-backend/routes/programs.js

const router = require("express").Router();
let Program = require("../models/program.model");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper function remains the same
const uploadImage = async (file) => {
  try {
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: "voyage-ahla-programs",
      resource_type: "image",
      transformation: [
        { width: 800, height: 600, crop: "fill" },
        { quality: "auto:low" },
      ],
    });
    return result.secure_url; // This returns a string
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error("Failed to upload image to Cloudinary.");
  }
};

// --- ADD NEW PROGRAM ---
router.route("/add").post(async (req, res) => {
  try {
    // --- ADDED CONSOLE LOGS FOR DEBUGGING ---
    console.log("Backend /programs/add: req.body", req.body);
    console.log("Backend /programs/add: req.files", req.files);
    // --- END DEBUG LOGS ---

    let imageUrl = "";
    if (req.files && req.files.imageFile) {
      imageUrl = await uploadImage(req.files.imageFile);
    } else if (req.body.image && typeof req.body.image === "string") {
      imageUrl = req.body.image;
    } else {
      // If no file and no valid image string, return an error for 'add' operation
      return res
        .status(400)
        .json("Error: Image is required or invalid format.");
    }

    const {
      title,
      description,
      program_type,
      locations,
      packages,
      includes,
      days,
      nights,
    } = req.body;

    // These fields are expected to be JSON stringified from the frontend
    const parsedLocations = JSON.parse(locations);
    const parsedPackages = JSON.parse(packages);
    const parsedIncludes = JSON.parse(includes);

    const newProgram = new Program({
      title,
      description,
      image: imageUrl,
      program_type,
      days: Number(days), // Ensure days and nights are numbers
      nights: Number(nights), // Ensure days and nights are numbers
      locations: parsedLocations,
      packages: parsedPackages,
      includes: parsedIncludes,
    });

    await newProgram.save();
    res.json("Program added!");
  } catch (err) {
    console.error("Error adding program:", err);
    res.status(400).json("Error: " + err.message);
  }
});

// --- UPDATE PROGRAM BY ID ---
router.route("/update/:id").post(async (req, res) => {
  try {
    // --- ADDED CONSOLE LOGS FOR DEBUGGING ---
    console.log("Backend /programs/update: req.body", req.body);
    console.log("Backend /programs/update: req.files", req.files);
    // --- END DEBUG LOGS ---

    const program = await Program.findById(req.params.id);
    if (!program) return res.status(404).json("Program not found.");

    let imageUrl = program.image; // Start with the existing image URL from the database
    if (req.files && req.files.imageFile) {
      // If a new file is uploaded, process it
      imageUrl = await uploadImage(req.files.imageFile);
    } else if (req.body.image && typeof req.body.image === "string") {
      // If no new file, use the image string from the body (which might be the original URL or an empty string if removed)
      imageUrl = req.body.image;
    }
    // If neither a new file nor a string in req.body.image, imageUrl remains the original program.image.

    program.title = req.body.title;
    program.description = req.body.description;
    program.image = imageUrl; // Update the image with the new or existing URL
    program.program_type = req.body.program_type;
    program.days = Number(req.body.days); // Ensure days and nights are numbers
    program.nights = Number(req.body.nights); // Ensure days and nights are numbers
    program.locations = JSON.parse(req.body.locations);
    program.packages = JSON.parse(req.body.packages);
    program.includes = JSON.parse(req.body.includes);

    await program.save();
    res.json("Program updated!");
  } catch (err) {
    console.error("Error updating program:", err);
    res.status(400).json("Error: " + err.message);
  }
});

module.exports = router;
