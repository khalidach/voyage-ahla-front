// This file defines the shapes of our data for TypeScript

export interface Hotel {
  name: string;
  id: string; // Add a client-side ID for stable keys
  _id?: string; // Optional because it comes from MongoDB
}

export interface TierLocationHotels {
  hotels: Hotel[];
}

// This defines the object for room prices (e.g., { quad: 14500, triple: 15500 })
export interface Pricing {
  [roomType: string]: number;
}

export interface PackageTier {
  // nights: number; // REMOVED
  // days?: number; // REMOVED
  location_hotels: {
    [locationName: string]: TierLocationHotels;
  };
  pricing_combinations: {
    [combinationKey: string]: Pricing;
  };
}

export interface ProgramLocation {
  name: string;
  label: string;
  id: string; // Add a client-side ID for stable keys
  _id?: string;
}

export interface Program {
  _id: string; // From MongoDB
  title: string;
  description: string;
  image: string; // Now explicitly a URL
  program_type: "umrah" | "tourism" | "other";
  days: number; // ADDED
  nights: number; // ADDED
  locations: ProgramLocation[];
  packages: {
    [tierName: string]: PackageTier;
  };
  includes: string[];
  createdAt: string;
  updatedAt: string;
}
