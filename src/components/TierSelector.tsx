import { Button } from "@/components/ui/button";

interface TierSelectorProps {
  tiers: string[];
  selectedTier: string;
  onTierSelect: (tier: string) => void;
}

const TierSelector = ({
  tiers,
  selectedTier,
  onTierSelect,
}: TierSelectorProps) => {
  const getTierName = (tier: string): string => {
    switch (tier) {
      case "economy":
        return "اقتصادية";
      case "standard":
        return "قياسية";
      case "comfort":
        return "مريحة";
      case "premium":
        return "فاخرة";
      case "luxury":
        return "ذهبية";
      default:
        return tier.charAt(0).toUpperCase() + tier.slice(1);
    }
  };

  return (
    <div className="mb-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">
        اختر فئة البرنامج:
      </h3>
      <div className="grid grid-cols-3 gap-3">
        {tiers.map((tier) => (
          <Button
            key={tier}
            onClick={() => onTierSelect(tier)}
            variant={selectedTier === tier ? "default" : "outline"}
            className={`py-3 font-semibold ${
              selectedTier === tier
                ? "bg-gold-500 hover:bg-gold-600 text-white"
                : "hover:bg-gold-50 hover:border-gold-500"
            }`}
          >
            {getTierName(tier)}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default TierSelector;
