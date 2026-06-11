import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, X } from 'lucide-react';
import { useState, useRef } from 'react';

const PROJECTS = [
  {
    id: 1,
    name: "The Obsidian Villa",
    location: "Mykonos, Greece",
    year: "2024",
    category: "Luxury Residence",
    description: "A stunning cliffside villa featuring panoramic Aegean views with cutting-edge sustainable architecture and minimalist design.",
    images: [
      "/architecture-1.jpg",
      "/architecture-2.jpg",
    ],
    size: 'large',
  },
  {
    id: 2,
    name: "Nexus Headquarters",
    location: "Singapore",
    year: "2023",
    category: "Commercial",
    description: "A futuristic corporate headquarters integrating smart building technology with luxury office spaces.",
    images: [
      "/architecture-3.jpg",
    ],
    size: 'medium',
  },
  {
    id: 3,
    name: "Alpine Retreat",
    location: "Zermatt, Switzerland",
    year: "2024",
    category: "Hospitality",
    description: "Exclusive mountain retreat combining traditional Alpine aesthetics with modern luxury amenities.",
    images: [
      "/architecture-4.jpg",
    ],
    size: 'medium',
  },
  {
    id: 4,
    name: "Lumina Pavilion",
    location: "Kyoto, Japan",
    year: "2022",
    category: "Cultural",
    description: "An avant-garde cultural center showcasing the fusion of Eastern philosophy and Western design.",
    images: [
      "/architecture-5.jpg",
      "/architecture-1.jpg",
    ],
    size: 'large',
  },
  {
    id: 5,
    name: "Urban Sanctuary",
    location: "New York, USA",
    year: "2023",
    category: "Residential",
    description: "A contemporary urban residence blending industrial elements with warm minimalist interiors.",
    images: [
      "/architecture-2.jpg",
    ],
    size: 'small',
  },
  {
    id: 6,
    name: "Coastal Living",
    location: "Malibu, California",
    year: "2024",
    category: "Luxury Residence",
    description: "Oceanfront masterpiece with breathtaking views and sustainable coastal architecture.",
    images: [
      "/architecture-3.jpg",
      "/architecture-4.jpg",
    ],
    size: 'large',
  },
];

export default function Projects() {
  const [selectedProject, setSelectedProject] = useState<typeof PROJECTS[0] | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [hoveredProjectId, setHoveredProjectId] = useState<number | null>(null);
  const fadeTimeoutRef = useRef<{ [key: number]: NodeJS.Timeout }>({});

  const getGridClass = (size: string) => {
    if (size === 'large') return 'md:col-span-2 md:row-span-2';
    if (size === 'medium') return 'md:col-span-1 md:row-span-1';
    return 'md:col-span-1 md:row-span-1';
  };

  const handleHoverStart = (projectId: number) => {
    // Clear any pending timeout when hovering
    if (fadeTimeoutRef.current[projectId]) {
      clearTimeout(fadeTimeoutRef.current[projectId]);
    }
    setHoveredProjectId(projectId);
  };

  const handleHoverEnd = (projectId: number) => {
    // Only start fade timeout if we're leaving the currently hovered project
    if (hoveredProjectId === projectId) {
      // Set a 3-second delay before fading back
      fadeTimeoutRef.current[projectId] = setTimeout(() => {
        setHoveredProjectId(null);
      }, 3000);
    }
  };

  return (
    <div className="bg-black text-white min-h-screen">
      {/* Header with visible back button and logo */}
      <div className="fixed top-0 w-full z-40 px-8 py-6 flex justify-between items-center bg-black/80 backdrop-blur-md border-b border-white/10">
        <Link to="/" className="flex items-center gap-2 hover:opacity-60 transition-opacity">
          <ArrowLeft size={20} className="text-white" />
          <span className="text-sm uppercase tracking-widest text-white">Back</span>
        </Link>
        <Link to="/">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-full hover:opacity-80 transition-opacity border border-white/20"
          >
            <h1 className="text-sm font-light tracking-widest uppercase text-white">1StudioArch</h1>
          </motion.div>
        </Link>
        <div className="w-20" />
      </div>

      {/* Title */}
      <div className="pt-32 px-8 pb-12 bg-black">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-7xl font-light mb-4 text-white"
        >
          Our Projects
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-stone-400 text-lg max-w-2xl"
        >
          Explore our portfolio of architectural masterpieces
        </motion.p>
      </div>

      {/* Masonry Gallery */}
      <div className="px-8 pb-32 bg-black">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px] md:auto-rows-[350px]">
          {PROJECTS.map((project, idx) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.6 }}
              className={`${getGridClass(project.size)} cursor-pointer relative overflow-hidden rounded-lg shadow-2xl`}
              onClick={() => {
                setSelectedProject(project);
                setSelectedImageIndex(0);
              }}
              onHoverStart={() => handleHoverStart(project.id)}
              onHoverEnd={() => handleHoverEnd(project.id)}
            >
              <div className="w-full h-full relative bg-black">
                {/* Image with fade on hover */}
                <div className="w-full h-full overflow-hidden">
                  <motion.img
                    src={project.images[0]}
                    alt={project.name}
                    className="w-full h-full object-cover"
                    animate={{
                      opacity: hoveredProjectId === project.id ? 1 : 0.15,
                      scale: hoveredProjectId === project.id ? 1.08 : 1,
                    }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
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
                  <h3 className="text-xl md:text-2xl font-light mb-2 text-white">{project.name}</h3>
                  <p className="text-sm text-stone-300">{project.location} • {project.year}</p>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Project Detail Modal */}
      <AnimatePresence mode="wait">
        {selectedProject && (
          <motion.div
            initial={{ clipPath: 'polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)' }}
            animate={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)' }}
            exit={{ clipPath: 'polygon(calc(100% - 80px) 24px, calc(100% - 80px) 24px, calc(100% - 80px) 64px, calc(100% - 80px) 64px)' }}
            transition={{ duration: 2.5, ease: [0.43, 0.13, 0.23, 0.96] }}
            className="fixed inset-0 bg-black z-50 overflow-y-auto"
            style={{ originX: 1, originY: 0 }}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedProject(null)}
              className="fixed top-6 right-8 z-50 hover:opacity-60 transition-opacity"
            >
              <X size={24} className="text-white" />
            </button>

            <div className="pt-20 px-8 pb-24 bg-black">
              {/* Project Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="max-w-6xl mx-auto mb-16"
              >
                <span className="inline-block bg-white/10 text-white px-4 py-2 text-xs uppercase tracking-widest rounded mb-6 border border-white/20">
                  {selectedProject.category}
                </span>
                <h1 className="text-6xl md:text-7xl font-light mb-6 text-white">{selectedProject.name}</h1>
                <div className="grid md:grid-cols-2 gap-8 mb-12">
                  <div>
                    <p className="text-stone-400 text-lg leading-relaxed">{selectedProject.description}</p>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-stone-500 mb-2">Location</p>
                      <p className="text-lg text-white">{selectedProject.location}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest text-stone-500 mb-2">Year</p>
                      <p className="text-lg text-white">{selectedProject.year}</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Main Image */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="max-w-6xl mx-auto mb-12"
              >
                <div className="h-[600px] rounded-lg overflow-hidden shadow-lg mb-8">
                  <img
                    src={selectedProject.images[selectedImageIndex]}
                    alt={`${selectedProject.name} - View ${selectedImageIndex + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Image Navigation */}
                {selectedProject.images.length > 1 && (
                  <div className="flex gap-4">
                    {selectedProject.images.map((_, idx) => (
                      <motion.button
                        key={idx}
                        onClick={() => setSelectedImageIndex(idx)}
                        className={`h-20 rounded-lg overflow-hidden border-2 transition-all ${
                          selectedImageIndex === idx ? 'border-white' : 'border-stone-600'
                        }`}
                        whileHover={{ scale: 1.05 }}
                      >
                        <img
                          src={selectedProject.images[idx]}
                          alt={`Thumbnail ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </motion.button>
                    ))}
                  </div>
                )}
              </motion.div>

              {/* Description Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="max-w-6xl mx-auto"
              >
                <div className="border-t border-white/10 pt-12">
                  <h2 className="text-3xl font-light mb-6 text-white">Project Details</h2>
                  <p className="text-lg text-stone-400 leading-relaxed max-w-3xl">
                    {selectedProject.description} This architectural masterpiece represents the pinnacle of luxury design, combining innovative materials with timeless aesthetic principles. Every detail has been meticulously crafted to create spaces that not only function flawlessly but also inspire and elevate the human experience.
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
