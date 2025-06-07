const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const HotelSchema = new Schema({
  name: { type: String, required: true },
});

const TierLocationHotelsSchema = new Schema({
  hotels: [HotelSchema],
});

const PackageTierSchema = new Schema({
  nights: { type: Number, required: true },
  location_hotels: {
    type: Map,
    of: TierLocationHotelsSchema,
  },
  pricing_combinations: {
    type: Map,
    of: {
      type: Map,
      of: Number,
    },
  },
});

const ProgramLocationSchema = new Schema({
  name: { type: String, required: true },
  label: { type: String, required: true },
});

const programSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    // Image will be stored as a Base64 string
    image: { type: String, required: true },
    program_type: {
      type: String,
      required: true,
      enum: ["umrah", "tourism", "other"],
    },
    locations: [ProgramLocationSchema],
    packages: {
      type: Map,
      of: PackageTierSchema,
    },
    includes: [String],
  },
  {
    timestamps: true,
  }
);

const Program = mongoose.model("Program", programSchema);

module.exports = Program;
