import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';

const ARTICLES = [
  {
    id: 1,
    title: "The Future of Sustainable Luxury Architecture",
    date: "June 2024",
    excerpt: "Exploring how cutting-edge sustainable practices are reshaping the landscape of luxury architecture without compromising on aesthetic excellence.",
    category: "Sustainability"
  },
  {
    id: 2,
    title: "Materiality in Modern Design: A Deep Dive",
    date: "May 2024",
    excerpt: "Understanding how the choice of materials can elevate a space from functional to extraordinary, and the artistry behind material selection.",
    category: "Design"
  },
  {
    id: 3,
    title: "Light as Architecture: Creating Spaces Through Illumination",
    date: "April 2024",
    excerpt: "Discover how we leverage light—both natural and artificial—as a fundamental design element to transform architectural spaces.",
    category: "Design"
  },
  {
    id: 4,
    title: "Case Study: The Obsidian Villa's Journey",
    date: "March 2024",
    excerpt: "Behind the scenes of one of our most ambitious projects. From conceptualization to completion, exploring the challenges and triumphs.",
    category: "Projects"
  },
];

export default function Journal() {
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
            Journal
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-stone-400 text-lg"
          >
            Insights, thoughts, and stories from our studio
          </motion.p>
        </div>
      </div>

      {/* Articles */}
      <section className="py-32 px-8 bg-black">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-16">
            {ARTICLES.map((article, idx) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.15, duration: 0.8 }}
                className="group border-b border-white/10 pb-16 last:border-b-0"
              >
                <div className="flex items-start justify-between gap-8">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-xs uppercase tracking-widest bg-white/10 text-white px-3 py-1 rounded border border-white/20">
                        {article.category}
                      </span>
                      <span className="text-sm text-stone-500">{article.date}</span>
                    </div>
                    <h3 className="text-3xl font-light mb-4 group-hover:opacity-60 transition-opacity text-white">
                      {article.title}
                    </h3>
                    <p className="text-lg text-stone-400 leading-relaxed">
                      {article.excerpt}
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ x: 5 }}
                    className="flex-shrink-0 text-stone-700 hover:text-[#1A1A1A] transition-colors mt-2"
                  >
                    <ArrowRight size={24} />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
