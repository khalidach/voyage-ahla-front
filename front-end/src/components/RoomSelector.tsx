import { Button } from "@/components/ui/button";

interface RoomSelectorProps {
  rooms: string[];
  selectedRoom: string;
  onRoomSelect: (room: string) => void;
}

const RoomSelector = ({
  rooms,
  selectedRoom,
  onRoomSelect,
}: RoomSelectorProps) => {
  const getRoomName = (room: string): string => {
    switch (room) {
      case "quintuple":
        return "خماسية";
      case "quad":
        return "رباعية";
      case "triple":
        return "ثلاثية";
      case "double":
        return "مزدوجة";
      case "single":
        return "فردية";
      default:
        return room.charAt(0).toUpperCase() + room.slice(1);
    }
  };

  return (
    <div>
      <h4 className="text-lg font-semibold text-gray-800 mb-3">
        اختر نوع الغرفة:
      </h4>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {rooms.map((room) => (
          <Button
            key={room}
            onClick={() => onRoomSelect(room)}
            variant={selectedRoom === room ? "default" : "outline"}
            className={`py-2 font-semibold text-sm ${
              selectedRoom === room
                ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                : "hover:bg-emerald-50 hover:border-emerald-500"
            }`}
          >
            {getRoomName(room)}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default RoomSelector;
