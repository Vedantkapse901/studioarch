import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';
import { Mail, Instagram, Linkedin, MapPin } from 'lucide-react';
import { PROJECTS } from './Projects';

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
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [hoveredProjectId, setHoveredProjectId] = useState<number | null>(null);
  const fadeTimeoutRef = useRef<{ [key: number]: NodeJS.Timeout }>({});
  const menuRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const toggleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { scrollYProgress, scrollY } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  // Get unique categories
  const categories = Array.from(new Set(PROJECTS.map((p) => p.category)));

  // Filter projects based on selected category
  const filteredProjects = selectedCategory
    ? PROJECTS.filter((p) => p.category === selectedCategory)
    : PROJECTS;

  // Handle project hover
  const handleProjectHoverStart = (projectId: number) => {
    if (fadeTimeoutRef.current[projectId]) {
      clearTimeout(fadeTimeoutRef.current[projectId]);
    }
    setHoveredProjectId(projectId);
  };

  const handleProjectHoverEnd = (projectId: number) => {
    if (hoveredProjectId === projectId) {
      fadeTimeoutRef.current[projectId] = setTimeout(() => {
        setHoveredProjectId(null);
      }, 4000);
    }
  };

  // Get grid class for masonry layout
  const getGridClass = (size: string) => {
    if (size === 'large') return 'md:col-span-2 md:row-span-2';
    if (size === 'medium') return 'md:col-span-1 md:row-span-1';
    return 'md:col-span-1 md:row-span-1';
  };

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

      {/* Projects Section */}
      <section className="relative bg-black py-24 px-8">
        <div className="max-w-7xl mx-auto">
          {/* Section Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <h2 className="text-5xl md:text-7xl font-light mb-6">Our Projects</h2>
            <p className="text-stone-400 text-lg max-w-2xl">
              Explore our portfolio of architectural masterpieces across diverse sectors
            </p>
          </motion.div>

          {/* Category Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            viewport={{ once: true }}
            className="mb-12 flex flex-wrap gap-3"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory(null)}
              className={`px-6 py-2 rounded-full font-light uppercase tracking-widest text-sm transition-all ${
                selectedCategory === null
                  ? 'bg-white text-black'
                  : 'bg-white/10 border border-white/20 text-white hover:bg-white/20'
              }`}
            >
              All
            </motion.button>
            {categories.map((category) => (
              <motion.button
                key={category}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 rounded-full font-light uppercase tracking-widest text-sm transition-all ${
                  selectedCategory === category
                    ? 'bg-white text-black'
                    : 'bg-white/10 border border-white/20 text-white hover:bg-white/20'
                }`}
              >
                {category}
              </motion.button>
            ))}
          </motion.div>

          {/* Projects Masonry Grid */}
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px] md:auto-rows-[350px]"
          >
            {filteredProjects.map((project, idx) => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                viewport={{ once: true }}
                className={`${getGridClass(project.size)} cursor-pointer relative overflow-hidden rounded-lg shadow-2xl`}
                onMouseEnter={() => handleProjectHoverStart(project.id)}
                onMouseLeave={() => handleProjectHoverEnd(project.id)}
                onTouchStart={() => handleProjectHoverStart(project.id)}
                onTouchEnd={() => handleProjectHoverEnd(project.id)}
              >
                <Link to="/projects" className="block w-full h-full relative">
                  <div className="w-full h-full relative bg-black">
                    {/* Image with opacity control */}
                    <div className="w-full h-full overflow-hidden">
                      <motion.img
                        src={project.images[0]}
                        alt={project.name}
                        className="w-full h-full object-cover"
                        animate={{
                          opacity: hoveredProjectId === project.id ? 1 : 0.2,
                          scale: hoveredProjectId === project.id ? 1.08 : 1,
                        }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>

                    {/* Gradient Overlay */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"
                      animate={{ opacity: hoveredProjectId === project.id ? 0.7 : 0.4 }}
                      transition={{ duration: 0.5 }}
                    />

                    {/* Project Info Overlay */}
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 p-6"
                      animate={{
                        opacity: hoveredProjectId === project.id ? 1 : 0,
                        y: hoveredProjectId === project.id ? 0 : 20,
                      }}
                      transition={{ duration: 0.4 }}
                    >
                      <span className="inline-block bg-white/20 text-white px-3 py-1 text-xs uppercase tracking-widest rounded mb-3 border border-white/20">
                        {project.category}
                      </span>
                      <h3 className="text-xl font-light mb-2 text-white">{project.name}</h3>
                      <p className="text-sm text-stone-300">{project.location} • {project.year}</p>
                    </motion.div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          {/* View All Button */}
          {selectedCategory && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-12 text-center"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(null)}
                className="border border-white/20 text-white px-8 py-3 rounded-lg font-light uppercase tracking-widest hover:bg-white/10 transition-colors"
              >
                View All Projects
              </motion.button>
            </motion.div>
          )}
        </div>
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
