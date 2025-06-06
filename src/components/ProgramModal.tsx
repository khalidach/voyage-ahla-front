import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import TierSelector from "./TierSelector";
import HotelSelector from "./HotelSelector";
import RoomSelector from "./RoomSelector";
import PriceDisplay from "./PriceDisplay";
import { programsData } from "../data/programsData";
// Import interfaces matching the new structure
import type {
  Program,
  PackageTier,
  Hotel,
  Pricing,
} from "../data/programsData";

interface ProgramModalProps {
  programId: string;
  onClose: () => void;
}

// Helper type for selected hotels state
type SelectedHotels = {
  [locationName: string]: string; // { madinah: "Hotel A", makkah: "Hotel B" }
};

// Helper function to find the correct pricing data based on selected hotels,
// supporting grouped keys (e.g., "HotelA,HotelB_HotelC")
const findMatchingPricing = (
  program: Program,
  tierData: PackageTier,
  selectedHotels: SelectedHotels
): Pricing | null => {
  const pricingCombinations = tierData.pricing_combinations;
  if (!pricingCombinations) return null;

  // Get the array of selected hotel names in the correct order of program.locations
  const userSelectedHotels = program.locations.map(
    (location) => selectedHotels[location.name]
  );

  // Iterate through all available pricing combination keys for the tier
  for (const combinationKey in pricingCombinations) {
    const keySegments = combinationKey.split("_"); // Split key like "HotelA,HotelB_HotelC" into ["HotelA,HotelB", "HotelC"]

    // Check if the number of segments matches the number of locations
    if (keySegments.length !== program.locations.length) {
      console.warn(
        `Skipping pricing key '${combinationKey}': Segment count (${keySegments.length}) does not match location count (${program.locations.length}).`
      );
      continue; // Skip this key
    }

    let keyMatchesSelection = true;
    // Check each segment against the user's selection for that location index
    for (let i = 0; i < keySegments.length; i++) {
      const segment = keySegments[i];
      const selectedHotelForLocation = userSelectedHotels[i];

      // If the user hasn't selected a hotel for this location yet, this key can't match
      if (!selectedHotelForLocation) {
        keyMatchesSelection = false;
        break;
      }

      // Check if the selected hotel is in this segment (either directly or in a comma-separated list)
      const hotelsInSegment = segment.split(",");
      if (!hotelsInSegment.includes(selectedHotelForLocation)) {
        keyMatchesSelection = false; // This key doesn't match the user's selection for this location
        break; // No need to check further segments for this key
      }
    }

    // If all segments matched the user's selection
    if (keyMatchesSelection) {
      return pricingCombinations[combinationKey]; // Found the correct pricing object
    }
  }

  // No matching key found after checking all possibilities
  console.warn(
    `No matching pricing combination found for selection: ${userSelectedHotels.join(
      "_"
    )} in tier '${
      tierData.location_hotels
        ? Object.keys(tierData.location_hotels)
        : "unknown"
    }'. Check programsData.ts.`
  );
  return null;
};

const ProgramModal = ({ programId, onClose }: ProgramModalProps) => {
  const [selectedTier, setSelectedTier] = useState<string>("");
  const [selectedHotels, setSelectedHotels] = useState<SelectedHotels>({});
  const [selectedRoom, setSelectedRoom] = useState<string>("");
  const [currentPrice, setCurrentPrice] = useState<number>(0);

  const program = programsData[programId as keyof typeof programsData] as
    | Program
    | undefined;

  // Initialize/Reset hotel selections when program or tier changes
  useEffect(() => {
    if (program && selectedTier) {
      const initialHotels: SelectedHotels = {};
      const tierData = program.packages[
        selectedTier as keyof typeof program.packages
      ] as PackageTier | undefined;

      if (!tierData) {
        console.error(`Tier data not found for tier: ${selectedTier}`);
        setSelectedHotels({});
        setSelectedRoom("");
        setCurrentPrice(0);
        return;
      }

      program.locations.forEach((location) => {
        const tierLocationHotels =
          tierData.location_hotels?.[location.name]?.hotels;
        if (tierLocationHotels && tierLocationHotels.length > 0) {
          initialHotels[location.name] = tierLocationHotels[0].name;
        } else {
          console.warn(
            `No hotels defined for tier '${selectedTier}' at location '${location.name}'`
          );
          initialHotels[location.name] = "";
        }
      });

      setSelectedHotels(initialHotels);
      setSelectedRoom("");
      setCurrentPrice(0);
    } else {
      setSelectedHotels({});
      setSelectedRoom("");
      setCurrentPrice(0);
    }
  }, [selectedTier, program]);

  // Calculate price when all selections are made
  useEffect(() => {
    if (!program || !selectedTier || !selectedRoom) {
      setCurrentPrice(0);
      return;
    }

    const allHotelsSelected = program.locations.every(
      (location) =>
        selectedHotels[location.name] && selectedHotels[location.name] !== ""
    );

    if (allHotelsSelected) {
      calculatePrice(selectedHotels, selectedRoom);
    } else {
      setCurrentPrice(0);
    }
  }, [selectedHotels, selectedRoom, selectedTier, program]);

  const calculatePrice = (
    currentHotels: SelectedHotels,
    currentRoom: string
  ) => {
    if (!program || !selectedTier || !currentRoom) return;

    const tierData = program.packages[
      selectedTier as keyof typeof program.packages
    ] as PackageTier | undefined;
    if (!tierData) {
      console.error(
        `Tier data not found for price calculation: ${selectedTier}`
      );
      setCurrentPrice(0);
      return;
    }

    // Use the helper function to find the matching pricing data
    const pricingData = findMatchingPricing(program, tierData, currentHotels);

    if (pricingData && pricingData[currentRoom as keyof typeof pricingData]) {
      setCurrentPrice(pricingData[currentRoom as keyof typeof pricingData]);
    } else {
      // Warning is logged inside findMatchingPricing if no key found
      // Log specific warning if key found but room type is missing
      if (
        pricingData &&
        !pricingData[currentRoom as keyof typeof pricingData]
      ) {
        console.warn(
          `Room type '${currentRoom}' not found in the matched pricing data for tier '${selectedTier}'.`
        );
      }
      setCurrentPrice(0); // Set price to 0 if no match or room type invalid
    }
  };

  const handleTierSelect = (tier: string) => {
    setSelectedTier(tier);
  };

  const handleRoomSelect = (room: string) => {
    setSelectedRoom(room);
  };

  const handleHotelSelect = (hotel: string, locationName: string) => {
    setSelectedHotels((prev) => ({
      ...prev,
      [locationName]: hotel,
    }));
    setSelectedRoom("");
    setCurrentPrice(0);
  };

  const handleBookNow = () => {
    if (!program || !selectedTier || !selectedRoom) return;

    const allHotelsSelected = program.locations.every(
      (loc) => selectedHotels[loc.name]
    );
    if (!allHotelsSelected) return;

    const tierData = program.packages[
      selectedTier as keyof typeof program.packages
    ] as PackageTier | undefined;
    if (!tierData) return;

    let tierLabel =
      selectedTier.charAt(0).toUpperCase() + selectedTier.slice(1);
    switch (selectedTier.toLowerCase()) {
      case "economy":
        tierLabel = "اقتصادية";
        break;
      case "standard":
        tierLabel = "قياسية";
        break;
      case "comfort":
        tierLabel = "مريحة";
        break;
      case "premium":
        tierLabel = "فاخرة";
        break;
      case "luxury":
        tierLabel = "فخمة";
        break;
      case "deluxe":
        tierLabel = "ديلوكس";
        break;
    }

    let roomLabel =
      selectedRoom.charAt(0).toUpperCase() + selectedRoom.slice(1);
    switch (selectedRoom.toLowerCase()) {
      case "single":
        roomLabel = "فردية";
        break;
      case "double":
        roomLabel = "مزدوجة";
        break;
      case "triple":
        roomLabel = "ثلاثية";
        break;
      case "quad":
        roomLabel = "رباعية";
        break;
      case "quintuple":
        roomLabel = "خماسية";
        break;
    }

    let hotelDetails = "";
    program.locations.forEach((location) => {
      hotelDetails += `- ${location.label}: ${selectedHotels[location.name]}\n`;
    });

    const message = encodeURIComponent(
      `مرحبا! أود حجز ${program.title}.\n\n` +
        `تفاصيل الباقة:\n` +
        `- الفئة: ${tierLabel}\n` +
        `- نوع الغرفة: ${roomLabel}\n` +
        `${hotelDetails}` +
        `- المدة: ${tierData.nights} ليالي\n` +
        `- السعر: $${currentPrice}\n\n` +
        `الرجاء تزويدي بمزيد من التفاصيل حول التوافر وعملية الحجز.`
    );

    window.open(`https://wa.me/212778558505?text=${message}`, "_blank");
  };

  // Function to get available room options for the current selection
  const getRoomOptions = () => {
    if (!program || !selectedTier) return [];

    const allHotelsSelected = program.locations.every(
      (loc) => selectedHotels[loc.name]
    );
    if (!allHotelsSelected) return [];

    const tierData = program.packages[
      selectedTier as keyof typeof program.packages
    ] as PackageTier | undefined;
    if (!tierData) return [];

    // Use the helper function to find the matching pricing data
    const pricingData = findMatchingPricing(program, tierData, selectedHotels);

    // Return the room types (keys) available for this specific hotel combination
    return pricingData ? Object.keys(pricingData) : [];
  };

  const getHotelsForLocationAndTier = (locationName: string): Hotel[] => {
    if (!program || !selectedTier) return [];
    const tierData = program.packages[
      selectedTier as keyof typeof program.packages
    ] as PackageTier | undefined;
    return tierData?.location_hotels?.[locationName]?.hotels || [];
  };

  if (!program) return null;

  const canBook =
    selectedTier &&
    selectedRoom &&
    program.locations.every((loc) => selectedHotels[loc.name]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay bg-black/50"
      dir="rtl"
    >
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800">
              {program.title}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold w-8 h-8 flex items-center justify-center"
            >
              ×
            </button>
          </div>

          {/* Tier Selection */}
          <TierSelector
            tiers={Object.keys(program.packages)}
            selectedTier={selectedTier}
            onTierSelect={handleTierSelect}
          />

          {/* Hotel & Room Details */}
          {selectedTier && (
            <div className="mb-6 animate-fade-in">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                تفاصيل الإقامة:
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <div className="grid grid-cols-1 gap-4">
                  {/* Dynamic Hotel Selectors */}
                  {program.locations.map((location) => {
                    const hotelsForTier = getHotelsForLocationAndTier(
                      location.name
                    );
                    return hotelsForTier.length > 0 ? (
                      <HotelSelector
                        key={`${selectedTier}-${location.name}`}
                        title={location.label}
                        hotels={hotelsForTier}
                        selectedHotel={selectedHotels[location.name] || ""}
                        onHotelSelect={(hotel) =>
                          handleHotelSelect(hotel, location.name)
                        }
                      />
                    ) : (
                      <div key={`${selectedTier}-${location.name}`}>
                        <p className="font-semibold text-gray-700">
                          {location.label}:
                        </p>
                        <p className="text-gray-500 italic">
                          لا توجد فنادق متاحة لهذه الفئة في هذا الموقع.
                        </p>
                      </div>
                    );
                  })}

                  {/* Display Nights */}
                  <div>
                    <p className="font-semibold text-gray-700">عدد الليالي:</p>
                    <p className="text-gray-600">
                      {program.packages[
                        selectedTier as keyof typeof program.packages
                      ]?.nights || "N/A"}{" "}
                      ليالي
                    </p>
                  </div>
                </div>
              </div>

              {/* Room Selection */}
              {program.locations.every((loc) => selectedHotels[loc.name]) && (
                <RoomSelector
                  rooms={getRoomOptions()} // Uses the updated logic
                  selectedRoom={selectedRoom}
                  onRoomSelect={handleRoomSelect}
                />
              )}
            </div>
          )}

          {/* Price Display */}
          {currentPrice > 0 && <PriceDisplay price={currentPrice} />}

          {/* Package Includes */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              الباقة تشمل:
            </h3>
            <ul className="space-y-2">
              {program.includes.map((item, index) => (
                <li key={index} className="flex items-center text-gray-600">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full ml-3"></div>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Book Now Button */}
          <Button
            onClick={handleBookNow}
            disabled={!canBook}
            className="w-full bg-gradient-to-r from-gold-500 to-emerald-500 hover:from-gold-600 hover:to-emerald-600 text-white font-bold py-4 text-lg rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            احجز الآن عبر واتساب
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProgramModal;
