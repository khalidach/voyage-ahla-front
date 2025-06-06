
import Header from '@/components/Header';
import Slider from '@/components/Slider';
import Programs from '@/components/Programs';
import Services from '@/components/Services';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <Slider />
      <Programs />
      <Services />
      <Contact />
      <Footer />
    </div>
  );
};

export default Index;
