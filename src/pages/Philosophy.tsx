import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

export default function Philosophy() {
  return (
    <div className="bg-[#F5F5F0] min-h-screen">
      {/* Header */}
      <div className="bg-[#1A1A1A] text-white py-20 px-8">
        <div className="max-w-7xl mx-auto">
          <Link to="/" className="flex items-center gap-2 mb-8 hover:opacity-60 transition-opacity">
            <ArrowLeft size={20} />
            <span className="text-sm uppercase tracking-widest">Back</span>
          </Link>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-6xl md:text-8xl font-light mb-6"
          >
            Our Philosophy
          </motion.h1>
        </div>
      </div>

      {/* Content */}
      <section className="py-32 px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-12"
          >
            <div>
              <h2 className="text-4xl font-light mb-6">Design Beyond Function</h2>
              <p className="text-lg text-stone-700 leading-relaxed">
                At 1StudioArch, we believe architecture is not merely about creating functional spaces. It is about orchestrating experiences, emotions, and lasting impressions that resonate through generations. Every line, every material, every transition is deliberately crafted to tell a story.
              </p>
            </div>

            <div>
              <h2 className="text-4xl font-light mb-6">Materiality & Precision</h2>
              <p className="text-lg text-stone-700 leading-relaxed">
                We are obsessed with the raw beauty of materials—the way light dances across a stone surface, the warmth of natural wood, the precision of modern construction. Our designs celebrate the poetry of materiality while maintaining impeccable technical execution.
              </p>
            </div>

            <div>
              <h2 className="text-4xl font-light mb-6">Sustainability & Luxury</h2>
              <p className="text-lg text-stone-700 leading-relaxed">
                True luxury is not wasteful; it is conscious. We integrate sustainable practices into every project without compromising aesthetic excellence. Our goal is to create spaces that are luxurious today and responsible for tomorrow.
              </p>
            </div>

            <div>
              <h2 className="text-4xl font-light mb-6">Timeless Design</h2>
              <p className="text-lg text-stone-700 leading-relaxed">
                We reject trends in favor of timeless principles. Our work transcends fleeting fashions to create spaces that remain relevant and beautiful decades after completion. This is architecture for the ages.
              </p>
            </div>

            <div className="border-t border-stone-300 pt-12 mt-12">
              <blockquote className="text-2xl md:text-3xl font-light italic text-[#1A1A1A]">
                "Architecture is the thoughtful arrangement of space, light, and material to create moments of profound human connection."
              </blockquote>
              <p className="text-sm uppercase tracking-widest text-stone-600 mt-6">1StudioArch Philosophy</p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
