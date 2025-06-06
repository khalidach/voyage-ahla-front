import { Button } from "@/components/ui/button";

const Contact = () => {
  return (
    <section
      id="contact"
      className="py-20 bg-gradient-to-br from-gold-50 to-emerald-50"
      dir="rtl"
    >
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            للحجز أو الاستفسارات، اتصل بنا
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            فريقنا ذو الخبرة جاهز لمساعدتك في تخطيط رحلتك المثالية. تواصل معنا
            اليوم!
          </p>
        </div>

        <div className="max-w-md mx-auto space-y-6">
          <Button
            asChild
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 text-lg rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <a
              href="https://wa.me/212778558505"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center space-x-3"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
              </svg>
              <span>تواصل عبر واتساب</span>
            </a>
          </Button>

          <Button
            asChild
            variant="outline"
            className="w-full border-2 border-gold-500 text-gold-600 hover:bg-gold-500 hover:text-white font-bold py-4 text-lg rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <a
              href="tel:+212661495138"
              className="flex items-center justify-center space-x-3"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              <span>اتصل بنا مباشرة</span>
            </a>
          </Button>
        </div>

        <div className="mt-16 text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 max-w-2xl mx-auto shadow-lg">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              توقيت العمل
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-1 gap-6 text-right">
              <div className="flex items-start space-x-reverse space-x-3">
                <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-semibold text-gray-800">
                    من الاثنين الى الجمعة
                  </p>
                  <p className="text-gray-600 text-sm">9:00am - 18:30pm</p>
                </div>
              </div>
              <div className="flex items-start space-x-reverse space-x-3">
                <div className="w-2 h-2 bg-gold-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-semibold text-gray-800">السبت</p>
                  <p className="text-gray-600 text-sm">9:00am - 18:00pm</p>
                </div>
              </div>
              <div className="flex items-start space-x-reverse space-x-3">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                <div>
                  <p className="font-semibold text-gray-800">الأحد</p>
                  <p className="text-gray-600 text-sm">مغلق</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
