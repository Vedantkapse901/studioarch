import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

export default function Philosophy() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  return (
    <div className="bg-black text-white min-h-screen">
      {/* Logo with enhanced visibility */}
      <Link to="/">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="fixed top-4 md:top-6 right-4 md:right-8 z-40 bg-black/60 backdrop-blur-md px-4 md:px-6 py-2 md:py-3 rounded-full hover:opacity-80 transition-opacity border border-white/20"
        >
          <h1 className="text-sm md:text-xl font-light tracking-widest uppercase text-white">1StudioArch</h1>
        </motion.div>
      </Link>

      {/* Side Menu Button - Center Position */}
      <motion.button
        initial={{ opacity: 1 }}
        animate={{ opacity: menuOpen ? 0 : 1 }}
        transition={{ duration: 0.3 }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (toggleTimeoutRef.current) clearTimeout(toggleTimeoutRef.current);
          setMenuOpen(true);
          toggleTimeoutRef.current = setTimeout(() => {
            toggleTimeoutRef.current = null;
          }, 500);
        }}
        disabled={menuOpen}
        className="fixed left-4 md:left-8 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-md p-3 md:p-4 rounded-full border border-white/20 transition-colors cursor-pointer pointer-events-auto disabled:pointer-events-none"
      >
        <span className="w-5 md:w-6 h-0.5 bg-white transition-all duration-300 pointer-events-none" />
        <span className="w-5 md:w-6 h-0.5 bg-white transition-all duration-300 pointer-events-none" />
      </motion.button>

      {/* Side Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, x: -300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            transition={{ duration: 0.3 }}
            className="fixed left-0 top-0 h-screen w-56 md:w-64 bg-black/95 backdrop-blur-md text-white z-40 flex flex-col justify-between px-6 md:px-8 border-r border-white/10 py-12"
          >
            <div className="space-y-8 md:space-y-12">
              <Link
                to="/"
                onClick={() => setMenuOpen(false)}
                className="text-xl md:text-2xl font-light tracking-widest uppercase hover:opacity-60 transition-opacity block"
              >
                Home
              </Link>
              <Link
                to="/philosophy"
                onClick={() => setMenuOpen(false)}
                className="text-xl md:text-2xl font-light tracking-widest uppercase hover:opacity-60 transition-opacity block"
              >
                Philosophy
              </Link>
              <Link
                to="/journal"
                onClick={() => setMenuOpen(false)}
                className="text-xl md:text-2xl font-light tracking-widest uppercase hover:opacity-60 transition-opacity block"
              >
                Journal
              </Link>
              <Link
                to="/contact"
                onClick={() => setMenuOpen(false)}
                className="text-xl md:text-2xl font-light tracking-widest uppercase hover:opacity-60 transition-opacity block"
              >
                Contact
              </Link>
            </div>

            {/* Close Button at Bottom */}
            <motion.button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (toggleTimeoutRef.current) clearTimeout(toggleTimeoutRef.current);
                setMenuOpen(false);
                toggleTimeoutRef.current = setTimeout(() => {
                  toggleTimeoutRef.current = null;
                }, 500);
              }}
              className="flex flex-col gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-md p-3 md:p-4 rounded-full border border-white/20 transition-colors cursor-pointer pointer-events-auto"
            >
              <span className="w-5 md:w-6 h-0.5 bg-white transition-all duration-300 rotate-45 translate-y-2 origin-center pointer-events-none" />
              <span className="w-5 md:w-6 h-0.5 bg-white transition-all duration-300 -rotate-45 -translate-y-2 origin-center pointer-events-none" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="bg-black border-b border-white/10 py-20 px-8">
        <div className="max-w-7xl mx-auto">
          <Link to="/" className="flex items-center gap-2 mb-8 hover:opacity-60 transition-opacity">
            <ArrowLeft size={20} />
            <span className="text-sm uppercase tracking-widest">Back</span>
          </Link>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-6xl md:text-8xl font-light mb-6 text-white"
          >
            Our Philosophy
          </motion.h1>
        </div>
      </div>

      {/* Content */}
      <section className="py-32 px-8 bg-black">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-12"
          >
            <div>
              <h2 className="text-4xl font-light mb-6 text-white">Design Beyond Function</h2>
              <p className="text-lg text-stone-400 leading-relaxed">
                At 1StudioArch, we believe architecture is not merely about creating functional spaces. It is about orchestrating experiences, emotions, and lasting impressions that resonate through generations. Every line, every material, every transition is deliberately crafted to tell a story.
              </p>
            </div>

            <div>
              <h2 className="text-4xl font-light mb-6 text-white">Materiality & Precision</h2>
              <p className="text-lg text-stone-400 leading-relaxed">
                We are obsessed with the raw beauty of materials—the way light dances across a stone surface, the warmth of natural wood, the precision of modern construction. Our designs celebrate the poetry of materiality while maintaining impeccable technical execution.
              </p>
            </div>

            <div>
              <h2 className="text-4xl font-light mb-6 text-white">Sustainability & Luxury</h2>
              <p className="text-lg text-stone-400 leading-relaxed">
                True luxury is not wasteful; it is conscious. We integrate sustainable practices into every project without compromising aesthetic excellence. Our goal is to create spaces that are luxurious today and responsible for tomorrow.
              </p>
            </div>

            <div>
              <h2 className="text-4xl font-light mb-6 text-white">Timeless Design</h2>
              <p className="text-lg text-stone-400 leading-relaxed">
                We reject trends in favor of timeless principles. Our work transcends fleeting fashions to create spaces that remain relevant and beautiful decades after completion. This is architecture for the ages.
              </p>
            </div>

            <div className="border-t border-white/10 pt-12 mt-12">
              <blockquote className="text-2xl md:text-3xl font-light italic text-white">
                "Architecture is the thoughtful arrangement of space, light, and material to create moments of profound human connection."
              </blockquote>
              <p className="text-sm uppercase tracking-widest text-stone-500 mt-6">1StudioArch Philosophy</p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
