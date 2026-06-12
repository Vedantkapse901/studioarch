import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';
import { Mail, Instagram, Linkedin, MapPin } from 'lucide-react';

const INITIAL_CAROUSEL_IMAGES = [
  "/architecture-1.jpg",
  "/architecture-2.jpg",
  "/architecture-3.jpg",
  "/architecture-4.jpg",
  "/architecture-5.jpg",
];

// Book-opening transition variants
const transitionVariants = [
  // Variant 1: Book opens from bottom-right to top-left
  {
    initial: { clipPath: 'polygon(100% 100%, 100% 100%, 100% 100%, 100% 100%)' },
    animate: { clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)' },
    exit: { clipPath: 'polygon(0% 0%, 0% 0%, 0% 0%, 0% 0%)' },
  },
  // Variant 2: Book opens from top-left to bottom-right
  {
    initial: { clipPath: 'polygon(0% 0%, 0% 0%, 0% 0%, 0% 0%)' },
    animate: { clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)' },
    exit: { clipPath: 'polygon(100% 100%, 100% 100%, 100% 100%, 100% 100%)' },
  },
];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [autoCarouselIndex, setAutoCarouselIndex] = useState(0);
  const [autoCarouselActive, setAutoCarouselActive] = useState(true);
  const [hasScrolledPastCarousel, setHasScrolledPastCarousel] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress, scrollY } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  // Get current transition variant based on index
  const getCurrentVariant = (index: number) => {
    return transitionVariants[index % transitionVariants.length];
  };

  // Auto carousel effect
  useEffect(() => {
    if (!autoCarouselActive) return;

    const interval = setInterval(() => {
      setAutoCarouselIndex((prev) => (prev + 1) % INITIAL_CAROUSEL_IMAGES.length);
    }, 10000);

    return () => clearInterval(interval);
  }, [autoCarouselActive]);

  // Handle scroll - restart carousel if user scrolls back up
  useEffect(() => {
    const unsubscribe = scrollY.onChange((value) => {
      if (value > 100) {
        setAutoCarouselActive(false);
        setHasScrolledPastCarousel(true);
      } else if (value < 50 && hasScrolledPastCarousel) {
        // User scrolled back to top
        setAutoCarouselActive(true);
        setHasScrolledPastCarousel(false);
      }
    });

    return unsubscribe;
  }, [scrollY, hasScrolledPastCarousel]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [menuOpen]);

  const currentVariant = getCurrentVariant(autoCarouselIndex);

  return (
    <div ref={containerRef} className="bg-black text-white min-h-screen overflow-x-hidden selection:bg-white selection:text-black">
      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-white origin-left z-50"
        style={{ scaleX }}
      />

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

      {/* Side Menu Button */}
      <motion.button
        initial={{ opacity: 0.5 }}
        animate={{ opacity: 0.5 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setMenuOpen(!menuOpen);
        }}
        className="fixed left-4 md:left-8 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md p-3 md:p-4 rounded-full border border-white/20 transition-colors cursor-pointer pointer-events-auto"
      >
        <span className={`w-5 md:w-6 h-0.5 bg-white transition-all duration-300 pointer-events-none ${menuOpen ? 'rotate-45 translate-y-2 origin-center' : ''}`} />
        <span className={`w-5 md:w-6 h-0.5 bg-white transition-all duration-300 pointer-events-none ${menuOpen ? '-rotate-45 -translate-y-2 origin-center' : ''}`} />
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
            className="fixed left-0 top-0 h-screen w-56 md:w-64 bg-black/95 backdrop-blur-md text-white z-40 flex flex-col justify-center px-6 md:px-8 border-r border-white/10"
          >
            <div className="space-y-8 md:space-y-12">
              <Link
                to="/projects"
                onClick={() => setMenuOpen(false)}
                className="text-xl md:text-2xl font-light tracking-widest uppercase hover:opacity-60 transition-opacity block"
              >
                Projects
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auto-Carousel Section - Layered Onion Peeling Effect */}
      <section className="relative h-screen w-full overflow-hidden sticky top-0 bg-black z-10">
        {/* Background/Next Image Layer */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('${INITIAL_CAROUSEL_IMAGES[(autoCarouselIndex + 1) % INITIAL_CAROUSEL_IMAGES.length]}')`,
            backgroundSize: 'cover',
            zIndex: 1,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" style={{ zIndex: 2 }} />

        {/* Top Layer - Peels Away */}
        <AnimatePresence mode="wait">
          <motion.div
            key={autoCarouselIndex}
            initial={currentVariant.initial}
            animate={currentVariant.animate}
            exit={currentVariant.exit}
            transition={{
              duration: 3,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            className="absolute inset-0"
            style={{
              originX: 0.5,
              originY: 0.5,
              zIndex: 3,
            }}
          >
            <div
              className="w-full h-full bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url('${INITIAL_CAROUSEL_IMAGES[autoCarouselIndex]}')`,
                backgroundSize: 'cover',
              }}
            />

            {/* Architecture Quote - Transitions with image */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-12 right-12 max-w-sm bg-black/40 backdrop-blur-md px-6 py-4 rounded-lg border border-white/20"
            >
              <p className="text-base md:text-lg font-light italic text-white leading-relaxed">
                "Space is the beginning of all architecture. The creation of light and shade, the volume of material, and the void between them define the soul of design."
              </p>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-black border-t border-white/10 py-24 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-16 mb-16">
            {/* Brand */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h4 className="text-2xl font-light mb-6">1StudioArch</h4>
              <p className="text-stone-400 mb-8 leading-relaxed">
                Redefining contemporary luxury through precision, materiality, and light. Creating spaces that endure beyond aesthetics.
              </p>
              <div className="flex gap-6">
                <motion.a
                  href="#"
                  whileHover={{ scale: 1.2 }}
                  className="text-stone-400 hover:text-white transition-colors"
                >
                  <Instagram size={20} />
                </motion.a>
                <motion.a
                  href="#"
                  whileHover={{ scale: 1.2 }}
                  className="text-stone-400 hover:text-white transition-colors"
                >
                  <Mail size={20} />
                </motion.a>
              </div>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <h5 className="uppercase tracking-widest text-xs text-stone-500 mb-8 font-semibold">Contact</h5>
              <div className="space-y-4">
                <motion.div
                  className="flex items-center gap-3 group cursor-pointer"
                  whileHover={{ x: 5 }}
                >
                  <Mail size={16} className="text-stone-400 group-hover:text-white transition-colors" />
                  <a href="mailto:inquiry@1studioarch.com" className="text-sm hover:text-stone-300 transition-colors">
                    inquiry@1studioarch.com
                  </a>
                </motion.div>
                <motion.div
                  className="flex items-center gap-3 group"
                  whileHover={{ x: 5 }}
                >
                  <MapPin size={16} className="text-stone-400 group-hover:text-white transition-colors" />
                  <span className="text-sm">London • New York • Singapore</span>
                </motion.div>
              </div>
            </motion.div>

            {/* Newsletter */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h5 className="uppercase tracking-widest text-xs text-stone-500 mb-8 font-semibold">Newsletter</h5>
              <p className="text-sm text-stone-400 mb-6">Subscribe for curated insights and project updates.</p>
              <div className="relative">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="bg-transparent border-b border-white/20 w-full py-3 outline-none focus:border-white transition-colors text-sm placeholder:text-stone-600"
                />
                <motion.button
                  whileHover={{ x: 3 }}
                  className="absolute right-0 bottom-3 text-white/60 hover:text-white transition-colors"
                >
                  →
                </motion.button>
              </div>
            </motion.div>
          </div>

          {/* Footer Bottom */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="pt-8 border-t border-white/10 text-[10px] uppercase tracking-widest text-stone-600 flex flex-col md:flex-row justify-between gap-4"
          >
            <span>© 2026 1StudioArch. All rights reserved.</span>
            <div className="flex gap-6">
              <a href="#" className="hover:text-stone-400 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-stone-400 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-stone-400 transition-colors">Cookies</a>
            </div>
          </motion.div>
        </div>
      </footer>
    </div>
  );
}
