import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import TierSelector from "./TierSelector";
import HotelSelector from "./HotelSelector";
import RoomSelector from "./RoomSelector";
import PriceDisplay from "./PriceDisplay";
import type { Program, PackageTier, Hotel, Pricing } from "../types/program";
import { BedDouble } from "lucide-react";

interface ProgramModalProps {
  program: Program;
  onClose: () => void;
}

type SelectedHotels = {
  [locationName: string]: string;
};

// Fixed the return type from 'any' to 'Pricing | null'
const findMatchingPricing = (
  program: Program,
  tierData: PackageTier,
  selectedHotels: SelectedHotels
): Pricing | null => {
  const pricingCombinations = tierData.pricing_combinations;
  if (!pricingCombinations) return null;

  const userSelectedHotels = program.locations.map(
    (location) => selectedHotels[location.name]
  );

  // The rest of this function's logic remains correct
  for (const combinationKey in pricingCombinations) {
    const keySegments = combinationKey.split("_");
    if (keySegments.length !== program.locations.length) continue;

    let keyMatchesSelection = true;
    for (let i = 0; i < keySegments.length; i++) {
      const segment = keySegments[i];
      const selectedHotelForLocation = userSelectedHotels[i];
      if (!selectedHotelForLocation) {
        keyMatchesSelection = false;
        break;
      }
      const hotelsInSegment = segment.split(",");
      if (!hotelsInSegment.includes(selectedHotelForLocation)) {
        keyMatchesSelection = false;
        break;
      }
    }
    if (keyMatchesSelection) {
      return pricingCombinations[combinationKey];
    }
  }
  return null;
};

const ProgramModal = ({ program, onClose }: ProgramModalProps) => {
  const [selectedTier, setSelectedTier] = useState<string>("");
  const [selectedHotels, setSelectedHotels] = useState<SelectedHotels>({});
  const [selectedRoom, setSelectedRoom] = useState<string>("");
  const [currentPrice, setCurrentPrice] = useState<number>(0);

  useEffect(() => {
    const tiers = Object.keys(program.packages);
    if (tiers.length > 0) {
      handleTierSelect(tiers[0]);
    }
  }, [program]);

  useEffect(() => {
    if (!selectedTier) return;
    const initialHotels: SelectedHotels = {};
    const tierData = program.packages[selectedTier];
    if (!tierData) return;
    program.locations.forEach((location) => {
      const tierLocationHotels =
        tierData.location_hotels?.[location.name]?.hotels;
      initialHotels[location.name] =
        tierLocationHotels && tierLocationHotels.length > 0
          ? tierLocationHotels[0].name
          : "";
    });
    setSelectedHotels(initialHotels);
    setSelectedRoom("");
    setCurrentPrice(0);
  }, [selectedTier, program]);

  useEffect(() => {
    if (!selectedTier || !selectedRoom) {
      setCurrentPrice(0);
      return;
    }
    const allHotelsSelected = program.locations.every(
      (location) => selectedHotels[location.name]
    );
    if (allHotelsSelected) {
      const tierData = program.packages[selectedTier];
      if (!tierData) return;
      const pricingData = findMatchingPricing(
        program,
        tierData,
        selectedHotels
      );
      const price = pricingData ? pricingData[selectedRoom] : 0;
      setCurrentPrice(price || 0);
    } else {
      setCurrentPrice(0);
    }
  }, [selectedHotels, selectedRoom, selectedTier, program]);

  const handleTierSelect = (tier: string) => setSelectedTier(tier);
  const handleRoomSelect = (room: string) => setSelectedRoom(room);
  const handleHotelSelect = (hotel: string, locationName: string) =>
    setSelectedHotels((prev) => ({ ...prev, [locationName]: hotel }));

  // Implemented the full booking logic
  const handleBookNow = () => {
    if (!program || !selectedTier || !selectedRoom || !currentPrice) return;
    const allHotelsSelected = program.locations.every(
      (loc) => selectedHotels[loc.name]
    );
    if (!allHotelsSelected) return;
    const tierData = program.packages[selectedTier];
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
        `- السعر: ${currentPrice} درهم\n\n` +
        `الرجاء تزويدي بمزيد من التفاصيل حول التوافر وعملية الحجز.`
    );

    window.open(`https://wa.me/212778558505?text=${message}`, "_blank");
  };

  const getRoomOptions = () => {
    if (!program || !selectedTier) return [];
    const allHotelsSelected = program.locations.every(
      (loc) => selectedHotels[loc.name]
    );
    if (!allHotelsSelected) return [];
    const tierData = program.packages[selectedTier];
    if (!tierData) return [];
    const pricingData = findMatchingPricing(program, tierData, selectedHotels);
    return pricingData ? Object.keys(pricingData) : [];
  };

  const getHotelsForLocationAndTier = (locationName: string): Hotel[] => {
    if (!program || !selectedTier) return [];
    const tierData = program.packages[selectedTier];
    return tierData?.location_hotels?.[locationName]?.hotels || [];
  };

  const canBook =
    selectedTier &&
    selectedRoom &&
    program.locations.every((loc) => selectedHotels[loc.name]) &&
    currentPrice > 0;

  if (!program) return null;

  const currentTierData = program.packages[selectedTier];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay bg-black/50"
      dir="rtl"
    >
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="p-6">
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

          <TierSelector
            tiers={Object.keys(program.packages)}
            selectedTier={selectedTier}
            onTierSelect={handleTierSelect}
          />

          {selectedTier && (
            <div className="mb-6 animate-fade-in">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                تفاصيل الإقامة:
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg mb-4 space-y-3">
                {program.locations.map((location) => (
                  <HotelSelector
                    key={`${selectedTier}-${location.name}`}
                    title={location.label}
                    hotels={getHotelsForLocationAndTier(location.name)}
                    selectedHotel={selectedHotels[location.name] || ""}
                    onHotelSelect={(hotel) =>
                      handleHotelSelect(hotel, location.name)
                    }
                  />
                ))}
                {/* Display number of nights */}
                {currentTierData && (
                  <div>
                    <p className="font-semibold text-gray-700">عدد الليالي:</p>
                    <div className="flex items-center text-gray-700">
                      <BedDouble className="w-5 h-5 ml-2 text-gray-500" />
                      <p className="font-semibold">
                        {currentTierData.nights} ليالي
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {program.locations.every((loc) => selectedHotels[loc.name]) && (
                <RoomSelector
                  rooms={getRoomOptions()}
                  selectedRoom={selectedRoom}
                  onRoomSelect={handleRoomSelect}
                />
              )}
            </div>
          )}

          {currentPrice > 0 && <PriceDisplay price={currentPrice} />}

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
