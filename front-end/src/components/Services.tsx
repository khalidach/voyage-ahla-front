
import { Bed, Plane, Globe, Moon } from 'lucide-react';

const services = [
  {
    id: 'hotels',
    title: 'حجوزات الفنادق',
    icon: Bed,
    description: 'نقدم حجوزات في مجموعة واسعة من الفنادق في مكة المكرمة والمدينة المنورة وحول العالم لتناسب جميع الميزانيات.'
  },
  {
    id: 'flights',
    title: 'تذاكر الطيران',
    icon: Plane,
    description: 'ابحث واحجز أفضل عروض الرحلات الجوية لاحتياجات السفر المحلية والدولية الخاصة بك.'
  },
  {
    id: 'tourism',
    title: 'البرامج السياحية',
    icon: Globe,
    description: 'اكتشف العالم مع باقاتنا السياحية المخصصة إلى أجمل الوجهات.'
  },
  {
    id: 'pilgrimage',
    title: 'باقات العمرة والحج',
    icon: Moon,
    description: 'أكمل رحلتك الروحانية مع خدمات العمرة والحج الشاملة والموثوقة التي نقدمها.'
  }
];

const Services = () => {
  return (
    <section id="services" className="py-20 bg-white" dir="rtl">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            ماذا نقدم
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            خدمات سفر شاملة لجعل رحلتك مريحة وممتعة وخالية من المتاعب
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <div
                key={service.id}
                className="text-center p-8 bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 animate-slide-in-left"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className="mb-6 flex justify-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-gold-500 to-gold-600 rounded-full flex items-center justify-center shadow-lg">
                    <IconComponent className="w-10 h-10 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  {service.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {service.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Services;
