import { useState, useMemo, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import TierSelector from "./TierSelector";
import HotelSelector from "./HotelSelector";
import RoomSelector from "./RoomSelector";
import PriceDisplay from "./PriceDisplay";
import type { Program, PackageTier, Hotel, Pricing } from "../types/program";
import { BedDouble, CalendarDays } from "lucide-react";

interface ProgramModalProps {
  program: Program;
  onClose: () => void;
}

type SelectedHotels = {
  [locationName: string]: string;
};

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

  for (const combinationKey in pricingCombinations) {
    if (Object.hasOwn(pricingCombinations, combinationKey)) {
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
  }
  return null;
};

const ProgramModal = ({ program, onClose }: ProgramModalProps) => {
  const programTiers = useMemo(() => Object.keys(program.packages), [program]);

  const [selectedTier, setSelectedTier] = useState<string>(
    programTiers[0] || ""
  );
  const [selectedHotels, setSelectedHotels] = useState<SelectedHotels>({});
  const [selectedRoom, setSelectedRoom] = useState<string>("");

  const tierData = useMemo(() => {
    return selectedTier ? program.packages[selectedTier] : null;
  }, [selectedTier, program.packages]);

  useEffect(() => {
    if (!tierData) return;

    const initialHotels: SelectedHotels = {};
    program.locations.forEach((location) => {
      const tierLocationHotels =
        tierData.location_hotels?.[location.name]?.hotels;
      initialHotels[location.name] = tierLocationHotels?.[0]?.name || "";
    });

    setSelectedHotels(initialHotels);
    setSelectedRoom("");
  }, [tierData, program.locations]);

  const pricingData = useMemo(() => {
    if (!tierData) return null;
    const allHotelsSelected = program.locations.every(
      (location) => selectedHotels[location.name]
    );
    if (!allHotelsSelected) return null;
    return findMatchingPricing(program, tierData, selectedHotels);
  }, [tierData, selectedHotels, program]);

  const roomOptions = useMemo(() => {
    return pricingData ? Object.keys(pricingData) : [];
  }, [pricingData]);

  const currentPrice = useMemo(() => {
    return pricingData?.[selectedRoom] || 0;
  }, [pricingData, selectedRoom]);

  const handleTierSelect = useCallback((tier: string) => {
    setSelectedTier(tier);
  }, []);

  const handleHotelSelect = useCallback(
    (hotel: string, locationName: string) => {
      setSelectedHotels((prev) => ({ ...prev, [locationName]: hotel }));
      setSelectedRoom("");
    },
    []
  );

  const handleRoomSelect = useCallback((room: string) => {
    setSelectedRoom(room);
  }, []);

  const handleBookNow = useCallback(() => {
    if (!tierData || !selectedRoom || !currentPrice) return;

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

    const hotelDetails = program.locations
      .map(
        (location) => `- ${location.label}: ${selectedHotels[location.name]}`
      )
      .join("\n");

    const message = encodeURIComponent(
      `مرحبا! أود حجز ${program.title}.\n\n` +
        `تفاصيل الباقة:\n` +
        `- الفئة: ${tierLabel}\n` +
        `- نوع الغرفة: ${roomLabel}\n` +
        `${hotelDetails}\n` +
        `- المدة: ${
          program.nights === 1
            ? "ليلة واحدة"
            : program.nights === 2
            ? "ليلتين"
            : program.nights >= 3 && program.nights <= 10
            ? `${program.nights} ليالي`
            : `${program.nights} ليلة`
        } و ${
          program.days === 1
            ? "يوم واحد"
            : program.days === 2
            ? "يومين"
            : program.days >= 3 && program.days <= 10
            ? `${program.days} أيام`
            : `${program.days} يوم`
        }\n` +
        `- السعر: ${currentPrice} درهم\n\n` +
        `الرجاء تزويدي بمزيد من التفاصيل حول التوافر وعملية الحجز.`
    );

    window.open(`https://wa.me/212778558505?text=${message}`, "_blank");
  }, [program, selectedTier, selectedRoom, selectedHotels, currentPrice]);

  const getHotelsForLocationAndTier = useCallback(
    (locationName: string): Hotel[] => {
      return tierData?.location_hotels?.[locationName]?.hotels || [];
    },
    [tierData]
  );

  const canBook = !!(selectedTier && selectedRoom && currentPrice > 0);

  if (!program) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay bg-black/50"
      dir="rtl"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
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
            tiers={programTiers}
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
                <div className="flex flex-col gap-2">
                  <div className="flex items-center text-gray-700">
                    <CalendarDays className="w-5 h-5 ml-2 text-gray-500" />
                    <p className="font-semibold">
                      {program.days === 1
                        ? "يوم"
                        : program.days === 2
                        ? "يومين"
                        : program.days >= 3 && program.days <= 10
                        ? `${program.days} أيام`
                        : `${program.days} يوم`}
                    </p>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <BedDouble className="w-5 h-5 ml-2 text-gray-500" />
                    <p className="font-semibold">
                      {program.nights === 1
                        ? "ليلة"
                        : program.nights === 2
                        ? "ليلتين"
                        : program.nights >= 3 && program.nights <= 10
                        ? `${program.nights} ليالي`
                        : `${program.nights} ليلة`}
                    </p>
                  </div>
                </div>
              </div>

              {roomOptions.length > 0 && (
                <RoomSelector
                  rooms={roomOptions}
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
