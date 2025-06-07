interface PriceDisplayProps {
  price: number;
}

const PriceDisplay = ({ price }: PriceDisplayProps) => {
  return (
    <div className="mb-6 animate-fade-in">
      <div className="bg-gradient-to-r from-gold-50 to-emerald-50 p-4 rounded-lg border border-gold-200">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">السعر:</h3>
        <p className="text-3xl font-bold text-gold-600">{price} درهم</p>
        <p className="text-sm text-gray-600">للشخص الواحد</p>
      </div>
    </div>
  );
};

export default PriceDisplay;
