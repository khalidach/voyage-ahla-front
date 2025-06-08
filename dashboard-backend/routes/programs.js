const router = require("express").Router();
let Program = require("../models/program.model");
const cloudinary = require("cloudinary").v2; // Import Cloudinary

// Configure Cloudinary (ensure these are in your .env file)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// --- GET ALL PROGRAMS ---
// Handles GET requests to /programs/
// Exclude the 'image' field for listing to reduce payload size
router.route("/").get((req, res) => {
  Program.find({}, { image: 0 }) // Exclude 'image' field for general listing
    .then((programs) => res.json(programs))
    .catch((err) => res.status(400).json("Error: " + err));
});

// Helper function to upload image to Cloudinary
const uploadImage = async (file) => {
  try {
    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: "voyage-ahla-programs", // Optional: organize your images
      resource_type: "image", // Ensure it's treated as an image
      transformation: [
        { width: 800, height: 600, crop: "fill" }, // Optimize image size
        { quality: "auto:low" }, // Optimize quality
      ],
    });
    return result.secure_url; // Return the URL of the uploaded image
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error("Failed to upload image to Cloudinary.");
  }
};

// --- ADD NEW PROGRAM ---
// Handles POST requests to /programs/add
router.route("/add").post(async (req, res) => {
  try {
    // If an image file is present, upload it to Cloudinary
    let imageUrl = "";
    if (req.files && req.files.image) {
      imageUrl = await uploadImage(req.files.image); // Use req.files.image directly
    } else if (req.body.image) {
      // Fallback if image is sent as a direct URL
      imageUrl = req.body.image;
    } else {
      return res.status(400).json("Error: Image is required.");
    }

    const { title, description, program_type, locations, packages, includes } =
      req.body;

    const newProgram = new Program({
      title,
      description,
      image: imageUrl, // Store the Cloudinary URL
      program_type,
      locations: JSON.parse(locations), // Parse locations from string
      packages: JSON.parse(packages), // Parse packages from string
      includes: JSON.parse(includes), // Parse includes from string
    });

    await newProgram.save();
    res.json("Program added!");
  } catch (err) {
    res.status(400).json("Error: " + err.message);
  }
});

// --- GET PROGRAM BY ID ---
// Handles GET requests to /programs/:id (full program details including image)
router.route("/:id").get((req, res) => {
  Program.findById(req.params.id)
    .then((program) => {
      if (!program) return res.status(404).json("Program not found.");
      res.json(program);
    })
    .catch((err) => res.status(400).json("Error: " + err));
});

// --- DELETE PROGRAM BY ID ---
// Handles DELETE requests to /programs/:id
router.route("/:id").delete((req, res) => {
  Program.findByIdAndDelete(req.params.id)
    .then(() => res.json("Program deleted."))
    .catch((err) => res.status(400).json("Error: " + err));
});

// --- UPDATE PROGRAM BY ID ---
// Handles POST requests to /programs/update/:id
router.route("/update/:id").post(async (req, res) => {
  try {
    const program = await Program.findById(req.params.id);
    if (!program) return res.status(404).json("Program not found.");

    // If a new image file is present, upload it to Cloudinary
    let imageUrl = program.image; // Default to existing image URL
    if (req.files && req.files.image) {
      imageUrl = await uploadImage(req.files.image);
    } else if (req.body.image && req.body.image.startsWith("data:image")) {
      // If Base64 is sent on update, convert it (less efficient but handles current frontend)
      // This part assumes the frontend might still send base64 if no new file is selected.
      // In a fully optimized solution, frontend should only send URLs or new file blobs.
      // For now, we'll keep it to prevent breaking existing flow if any.
      // However, with express-fileupload, req.body.image might not be used for new uploads.
      // If req.body.image is still used for new uploads (base64) it means express-fileupload is not correctly handling it, or the frontend is sending it that way.
      // Given the typical flow, if req.files.image exists, it means a new file was uploaded. If not, the old URL should be kept.
      // For a robust update, we should assume req.body.image is the *existing* URL if no new file.
      // The form will now handle sending a `File` object for new images.
    }

    program.title = req.body.title;
    program.description = req.body.description;
    program.image = imageUrl; // Update with new Cloudinary URL or keep old
    program.program_type = req.body.program_type;
    program.locations = JSON.parse(req.body.locations);
    program.packages = JSON.parse(req.body.packages);
    program.includes = JSON.parse(req.body.includes);

    await program.save();
    res.json("Program updated!");
  } catch (err) {
    res.status(400).json("Error: " + err.message);
  }
});

module.exports = router;
