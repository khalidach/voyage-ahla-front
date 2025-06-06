import { useState } from "react";
import { Button } from "@/components/ui/button";
import ProgramModal from "./ProgramModal";

const programs = [
  {
    id: "umrah_july",
    title: "باقة عمرة لشهر يوليوز",
    image:
      "https://images.unsplash.com/photo-1466442929976-97f336a657be?w=600&h=400&fit=crop",
    description:
      "قم بعمل عمرة شهر يوليوز في افضل حلة مع باقتنا الشاملة. تتضمن تذكرة الطيران ذهاب واياب، التأشيرة، النقل ، السكن في المدينة المنورة ومكة المكرمة وكذلك مرشد طيلة مدة الرحلة",
  },
  {
    id: "turkey_tour_8d",
    title: "برنامج اسطنبول الساحرة",
    image:
      "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=600&h=400&fit=crop",
    description:
      "اكتشف جمال اسطنبول وتاريخها العريق مع جولاتنا الشاملة التي تأخذك عبر أجمل المعالم الموجودة في المدينة.",
  },
];

const Programs = () => {
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = (programId: string) => {
    setSelectedProgram(programId);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProgram(null);
  };

  return (
    <>
      <section id="programs" className="py-20 bg-gray-50" dir="rtl">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              برامجنا المميزة
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              اكتشف برامج السفر المُنتقاة بعناية والمُصممة لتمنحك تجارب روحانية
              وثقافية لا تُنسى
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {programs.map((program, index) => (
              <div
                key={program.id}
                // Add 'flex', 'flex-col', and 'justify-between' to the card itself
                className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 animate-scale-in
                 flex flex-col" // Added flex and flex-col
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="relative overflow-hidden">
                  <img
                    src={program.image}
                    alt={program.title}
                    className="w-full h-64 object-cover transition-transform duration-300 hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  {" "}
                  {/* Added flex, flex-col, and flex-grow */}
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">
                    {program.title}
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed flex-grow">
                    {" "}
                    {/* Added flex-grow here */}
                    {program.description}
                  </p>
                  {/* The Button component already looks like it will take full width */}
                  <Button
                    onClick={() => openModal(program.id)}
                    className="w-full bg-gold-500 hover:bg-gold-600 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 font-semibold text-lg"
                  >
                    معرفة المزيد
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Program Modal */}
      {isModalOpen && selectedProgram && (
        <ProgramModal programId={selectedProgram} onClose={closeModal} />
      )}
    </>
  );
};

export default Programs;
