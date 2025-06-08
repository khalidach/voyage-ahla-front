import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import ProgramModal from "./ProgramModal";
import type { Program as ProgramType } from "../types/program";

// Get the API URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Programs = () => {
  const [programs, setPrograms] = useState<ProgramType[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<ProgramType | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/programs/`) // Use the environment variable
      .then((response) => {
        setPrograms(response.data);
      })
      .catch((error) => {
        console.error(
          "There was an error fetching the programs for the main site!",
          error
        );
      });
  }, []);

  const openModal = (program: ProgramType) => {
    setSelectedProgram(program);
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
            {programs.length > 0 ? (
              programs.map((program, index) => (
                <div
                  key={program._id}
                  className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 animate-scale-in flex flex-col"
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
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">
                      {program.title}
                    </h3>
                    <p className="text-gray-600 mb-6 leading-relaxed flex-grow">
                      {program.description}
                    </p>
                    <Button
                      onClick={() => openModal(program)}
                      className="w-full bg-gold-500 hover:bg-gold-600 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 font-semibold text-lg"
                    >
                      معرفة المزيد
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-10 text-gray-500">
                لا توجد برامج متاحة حالياً.
              </div>
            )}
          </div>
        </div>
      </section>

      {isModalOpen && selectedProgram && (
        <ProgramModal program={selectedProgram} onClose={closeModal} />
      )}
    </>
  );
};

export default Programs;
