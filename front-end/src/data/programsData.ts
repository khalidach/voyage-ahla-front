// Define interfaces for better type safety

export interface Hotel {
  name: string;
  // price_modifier is likely less useful now, but kept for potential future needs
  price_modifier?: number;
}

// Defines a location involved in the program (name and display label)
export interface ProgramLocation {
  name: string; // Internal identifier, e.g., "madinah", "istanbul"
  label: string; // Display label, e.g., "فندق المدينة المنورة", "Hotel in Istanbul"
}

// Defines the list of hotels available for a specific location within a specific tier
export interface TierLocationHotels {
  hotels: Hotel[];
}

export interface Pricing {
  [roomType: string]: number;
}

export interface PricingCombinations {
  // Key is constructed dynamically based on selected hotel names for the program's locations
  // Key format: "HotelNameLoc1_HotelNameLoc2_..."
  // NEW: A part for a location can be a comma-separated list of hotels with the same price (NO SPACES after comma)
  // e.g., "HotelA,HotelB_HotelC_..." means HotelA and HotelB in Loc1 have the same price when combined with HotelC in Loc2
  [combinationKey: string]: Pricing;
}

// Defines the structure for a specific package tier (e.g., economy, standard)
export interface PackageTier {
  nights: number;
  // Holds the hotel lists for each location, specific to this tier
  location_hotels: {
    [locationName: string]: TierLocationHotels; // e.g., { "madinah": { hotels: [...] }, "makkah": { hotels: [...] } }
  };
  pricing_combinations: PricingCombinations;
}

// Defines the overall structure for a program
export interface Program {
  title: string;
  program_type: "umrah" | "tourism" | "other";
  // Lists the locations involved in this program
  locations: ProgramLocation[];
  packages: {
    [tierName: string]: PackageTier;
  };
  includes: string[];
}

// Defines the top-level data structure holding all programs
export interface ProgramsData {
  [programId: string]: Program;
}

// Updated Data Structure with Tier-Specific Hotels & Corrected Grouped Pricing Key
export const programsData: ProgramsData = {
  umrah_july: {
    title: "عمرة لشهر يوليوز",
    program_type: "umrah",
    locations: [
      { name: "madinah", label: "فندق المدينة المنورة" },
      { name: "makkah", label: "فندق مكة المكرمة" },
    ],
    packages: {
      economy: {
        nights: 15,
        location_hotels: {
          madinah: {
            hotels: [{ name: "قصر الانصار او مايعادله" }],
          },
          makkah: {
            hotels: [{ name: "ابراج التيسير" }, { name: "سفير المسك" }],
          },
        },
        pricing_combinations: {
          // Keys must match the *actual* hotel names selected from the tier-specific lists
          "قصر الانصار او مايعادله_ابراج التيسير": {
            quintuple: 13500,
            quad: 14500,
            triple: 15500,
            double: 16500,
          },
          "قصر الانصار او مايعادله_سفير المسك": {
            quintuple: 14000,
            quad: 15000,
            triple: 16000,
            double: 17000,
          },
        },
      },
      standard: {
        nights: 15,
        location_hotels: {
          madinah: {
            hotels: [{ name: "قصر الانصار او مايعادله" }],
          },
          makkah: {
            hotels: [{ name: "ميسان المقام" }],
          },
        },
        pricing_combinations: {
          "قصر الانصار او مايعادله_ميسان المقام": {
            quintuple: 16000,
            quad: 17000,
            triple: 18000,
            double: 19500,
          },
        },
      },
      premium: {
        nights: 12,
        location_hotels: {
          madinah: {
            hotels: [{ name: "فندق العقيق او مايعادله (بالافطار)" }],
          },
          makkah: {
            hotels: [{ name: "فندق انجم (بالافطار)" }],
          },
        },
        pricing_combinations: {
          "فندق العقيق او مايعادله (بالافطار)_فندق انجم (بالافطار)": {
            quad: 22500,
            triple: 23500,
            double: 25500,
          },
        },
      },
    },
    includes: [
      "تذكرة الطيران ذهاب واياب",
      "السكن في المدينة المنورة ومكة المكرمة بالفنادق المذكورة اعلاه",
      "التأشيرة",
      "زيارة مدينة الطائف والقيام بعمرة تانية",
      "مرشد طيلة مدة الرحلة",
    ],
  },

  turkey_tour_8d: {
    title: "برنامج تركيا",
    program_type: "tourism",
    locations: [
      { name: "istanbul", label: "فندق في اسطنبول" },
      // { name: "cappadocia", label: "Hotel in Cappadocia" }, // Assuming Cappadocia is removed as per user's previous test
    ],
    packages: {
      comfort: {
        nights: 7,
        location_hotels: {
          istanbul: {
            hotels: [
              { name: "CVK Park Bosphorus Hotel (Comfort)" },
              { name: "Point Hotel Barbaros (Comfort)" },
            ],
          },
          // No Cappadocia hotels needed if only Istanbul
        },
        pricing_combinations: {
          // *** CORRECTED GROUPED KEY (No space after comma) ***
          // This key applies if *either* CVK or Point Hotel is selected
          "CVK Park Bosphorus Hotel (Comfort),Point Hotel Barbaros (Comfort)": {
            quintuple: 18000,
            quad: 19000,
            triple: 20000,
            double: 22000,
          },
        },
      },
      luxury: {
        nights: 7,
        location_hotels: {
          istanbul: {
            hotels: [{ name: "Swissôtel The Bosphorus Istanbul (Luxury)" }],
          },
          // No Cappadocia hotels needed if only Istanbul
        },
        pricing_combinations: {
          // Key is just the single hotel name
          "Swissôtel The Bosphorus Istanbul (Luxury)": {
            quad: 21000,
            triple: 22000,
            double: 25000,
          },
        },
      },
    },
    includes: [
      "تذكرة الطيران ذهاب واياب",
      "الاقامة في الفنادق المذكورة اعلاه مع الافطار",
      "رحلة بالباخرة في مضيق بوسفور",
      "زيارة المعالم الموجودة في المدينة (اية صوفيا، المسجد الازرق، قصر توبكابي...)",
    ],
  },
};
