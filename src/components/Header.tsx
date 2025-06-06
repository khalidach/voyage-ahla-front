import { useState } from "react";
import { Button } from "@/components/ui/button";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const scrollToSection = (elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm"
      dir="rtl"
    >
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-gold-500 to-gold-600 rounded-full flex items-center justify-center mx-3">
            <span className="text-white font-bold text-lg">VA</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">اسفار اهل الخير</h1>
            <p className="text-sm text-gray-600">راحــــتك أولويتنا</p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8 text-lg font-extrabold">
          <button
            onClick={() => scrollToSection("home")}
            className="text-gray-700 hover:text-gold-600 transition-colors font-medium mx-8"
          >
            الرئيسية
          </button>
          <button
            onClick={() => scrollToSection("programs")}
            className="text-gray-700 hover:text-gold-600 transition-colors font-medium"
          >
            برامجنا
          </button>
          <button
            onClick={() => scrollToSection("services")}
            className="text-gray-700 hover:text-gold-600 transition-colors font-medium"
          >
            خدماتنا
          </button>
          <button
            onClick={() => scrollToSection("contact")}
            className="text-gray-700 hover:text-gold-600 transition-colors font-medium"
          >
            اتصل بنا
          </button>
        </nav>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <div className="flex flex-col space-y-1">
            <span className="w-6 h-0.5 bg-gray-600 block"></span>
            <span className="w-6 h-0.5 bg-gray-600 block"></span>
            <span className="w-6 h-0.5 bg-gray-600 block"></span>
          </div>
        </Button>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white shadow-lg md:hidden">
            <nav className="flex flex-col p-4 space-y-4">
              <button
                onClick={() => scrollToSection("home")}
                className="text-gray-700 hover:text-gold-600 transition-colors font-medium text-right"
              >
                الرئيسية
              </button>
              <button
                onClick={() => scrollToSection("programs")}
                className="text-gray-700 hover:text-gold-600 transition-colors font-medium text-right"
              >
                برامجنا
              </button>
              <button
                onClick={() => scrollToSection("services")}
                className="text-gray-700 hover:text-gold-600 transition-colors font-medium text-right"
              >
                خدماتنا
              </button>
              <button
                onClick={() => scrollToSection("contact")}
                className="text-gray-700 hover:text-gold-600 transition-colors font-medium text-right"
              >
                اتصل بنا
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
