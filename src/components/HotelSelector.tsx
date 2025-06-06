import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Hotel {
  name: string;
  price_modifier: number;
}

interface HotelSelectorProps {
  title: string;
  hotels: Hotel[];
  selectedHotel: string;
  onHotelSelect: (hotel: string) => void;
}

const HotelSelector = ({
  title,
  hotels,
  selectedHotel,
  onHotelSelect,
}: HotelSelectorProps) => {
  if (!hotels || hotels.length === 0) return null;

  return (
    <div className="mb-3">
      <p className="font-semibold text-gray-700 mb-2">{title}:</p>
      {hotels.length > 1 ? (
        <Select value={selectedHotel} onValueChange={onHotelSelect} dir="rtl">
          <SelectTrigger className="w-full bg-white">
            <SelectValue placeholder="اختر فندقاً" />
          </SelectTrigger>
          <SelectContent>
            {hotels.map((hotel) => (
              <SelectItem key={hotel.name} value={hotel.name}>
                {hotel.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <p className="text-gray-600">{selectedHotel}</p>
      )}
    </div>
  );
};

export default HotelSelector;
