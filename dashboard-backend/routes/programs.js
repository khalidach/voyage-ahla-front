const router = require("express").Router();
let Program = require("../models/program.model");

// --- GET ALL PROGRAMS ---
// Handles GET requests to /programs/
router.route("/").get((req, res) => {
  Program.find()
    .then((programs) => res.json(programs))
    .catch((err) => res.status(400).json("Error: " + err));
});

// --- ADD NEW PROGRAM ---
// Handles POST requests to /programs/add
router.route("/add").post((req, res) => {
  // Note: The request body must match the schema structure.
  // Mongoose Maps are created from standard JavaScript objects.
  const newProgram = new Program(req.body);

  newProgram
    .save()
    .then(() => res.json("Program added!"))
    .catch((err) => res.status(400).json("Error: " + err));
});

// --- GET PROGRAM BY ID ---
// Handles GET requests to /programs/:id
router.route("/:id").get((req, res) => {
  Program.findById(req.params.id)
    .then((program) => res.json(program))
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
router.route("/update/:id").post((req, res) => {
  Program.findById(req.params.id)
    .then((program) => {
      // Update all fields based on the request body
      // This is a simple replacement; more complex logic can be added if needed
      program.title = req.body.title;
      program.description = req.body.description;
      program.image = req.body.image;
      program.program_type = req.body.program_type;
      program.locations = req.body.locations;
      program.packages = req.body.packages;
      program.includes = req.body.includes;

      program
        .save()
        .then(() => res.json("Program updated!"))
        .catch((err) => res.status(400).json("Error: " + err));
    })
    .catch((err) => res.status(400).json("Error: " + err));
});

module.exports = router;
