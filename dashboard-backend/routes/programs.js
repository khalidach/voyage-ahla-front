const router = require("express").Router();
let Program = require("../models/program.model");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// --- GET ALL PROGRAMS ---
router.route("/").get((req, res) => {
  Program.find({}) // Ensure image is not excluded here for main page
    .then((programs) => res.json(programs))
    .catch((err) => res.status(400).json("Error: " + err));
});

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
    return result.secure_url;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error("Failed to upload image to Cloudinary.");
  }
};

// --- ADD NEW PROGRAM ---
router.route("/add").post(async (req, res) => {
  try {
    let imageUrl = "";
    if (req.files && req.files.image) {
      imageUrl = await uploadImage(req.files.image);
    } else if (req.body.image) {
      imageUrl = req.body.image;
    } else {
      return res.status(400).json("Error: Image is required.");
    }

    // Destructure `days` from req.body
    const { title, description, program_type, locations, packages, includes } =
      req.body;

    // Parse the days for each package tier
    const parsedPackages = JSON.parse(packages);
    for (const tierName in parsedPackages) {
      if (parsedPackages.hasOwnProperty(tierName)) {
        parsedPackages[tierName].days = parseInt(
          req.body[`packages.${tierName}.days`],
          10
        ); // Assume days will be sent in a distinct way
      }
    }

    const newProgram = new Program({
      title,
      description,
      image: imageUrl,
      program_type,
      locations: JSON.parse(locations),
      packages: parsedPackages, // Use the parsed packages with days
      includes: JSON.parse(includes),
    });

    await newProgram.save();
    res.json("Program added!");
  } catch (err) {
    res.status(400).json("Error: " + err.message);
  }
});

// --- GET PROGRAM BY ID ---
router.route("/:id").get((req, res) => {
  Program.findById(req.params.id)
    .then((program) => {
      if (!program) return res.status(404).json("Program not found.");
      res.json(program);
    })
    .catch((err) => res.status(400).json("Error: " + err));
});

// --- DELETE PROGRAM BY ID ---
router.route("/:id").delete((req, res) => {
  Program.findByIdAndDelete(req.params.id)
    .then(() => res.json("Program deleted."))
    .catch((err) => res.status(400).json("Error: " + err));
});

// --- UPDATE PROGRAM BY ID ---
router.route("/update/:id").post(async (req, res) => {
  try {
    const program = await Program.findById(req.params.id);
    if (!program) return res.status(404).json("Program not found.");

    let imageUrl = program.image;
    if (req.files && req.files.image) {
      imageUrl = await uploadImage(req.files.image);
    }

    program.title = req.body.title;
    program.description = req.body.description;
    program.image = imageUrl;
    program.program_type = req.body.program_type;
    program.locations = JSON.parse(req.body.locations);

    // Parse packages and update days
    const updatedPackages = JSON.parse(req.body.packages);
    for (const tierName in updatedPackages) {
      if (updatedPackages.hasOwnProperty(tierName)) {
        updatedPackages[tierName].days = parseInt(
          req.body[`packages.${tierName}.days`],
          10
        ); // Assume days sent separately
      }
    }
    program.packages = updatedPackages; // Use the updated packages with days

    program.includes = JSON.parse(req.body.includes);

    await program.save();
    res.json("Program updated!");
  } catch (err) {
    res.status(400).json("Error: " + err.message);
  }
});

module.exports = router;
