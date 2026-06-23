import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useGallery } from '../hooks/useSupabaseData';
import { LoadingScreenWithText } from '../components/LoadingScreen';

interface GalleryItem {
  id: number;
  url: string;
  title?: string;
  folder_id?: number;
}

interface GalleryFolder {
  id: number;
  name: string;
  display_order: number;
  gallery_items: GalleryItem[];
}

export default function Gallery() {
  const { data: folders, loading } = useGallery();
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);
  const [hoveredImageId, setHoveredImageId] = useState<number | null>(null);

  // Flatten all gallery items from all folders
  const allImages = (folders as GalleryFolder[])?.flatMap(folder => folder.gallery_items || []) || [];

  if (loading) {
    return <LoadingScreenWithText text="Loading Gallery..." />;
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black/95 backdrop-blur border-b border-stone-900 px-8 py-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 hover:opacity-60 transition-opacity">
          <ArrowLeft size={20} className="text-white" />
          <span className="text-sm uppercase tracking-widest text-white">Back</span>
        </Link>
        <Link to="/" className="hover:opacity-80 transition-opacity">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="relative w-40 h-12 md:w-48 md:h-16"
          >
            <motion.img
              src="/logo-bw.png"
              alt="1StudioArch"
              className="absolute inset-0 w-full h-full object-contain"
              animate={{ opacity: 1 }}
              whileHover={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            />
            <motion.img
              src="/logo-color.png"
              alt="1StudioArch"
              className="absolute inset-0 w-full h-full object-contain"
              animate={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
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
          Gallery
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-stone-400 text-lg max-w-2xl"
        >
          Explore our collection of architectural photography
        </motion.p>
      </div>

      {/* Gallery Grid */}
      <div className="px-8 pb-32 bg-black">
        {allImages.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-stone-400 text-lg">No images in gallery yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {allImages.map((image, idx) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05, duration: 0.4 }}
                className="cursor-pointer relative overflow-hidden rounded-lg h-64 md:h-80 group"
                onClick={() => setSelectedImage(image)}
                onHoverStart={() => setHoveredImageId(image.id)}
                onHoverEnd={() => setHoveredImageId(null)}
              >
                {/* Image */}
                <motion.img
                  src={image.url}
                  alt={image.title || 'Gallery Image'}
                  className="w-full h-full object-cover"
                  animate={{
                    opacity: hoveredImageId === image.id ? 1 : 0.7,
                    scale: hoveredImageId === image.id ? 1.05 : 1,
                  }}
                  transition={{ duration: 0.4 }}
                />

                {/* Overlay on Hover */}
                <motion.div
                  className="absolute inset-0 bg-black/40"
                  animate={{ opacity: hoveredImageId === image.id ? 0.6 : 0 }}
                  transition={{ duration: 0.3 }}
                />

                {/* Title */}
                {image.title && (
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent"
                    animate={{
                      opacity: hoveredImageId === image.id ? 1 : 0,
                      y: hoveredImageId === image.id ? 0 : 10,
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <p className="text-white text-sm font-light">{image.title}</p>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Image Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl w-full h-auto max-h-[90vh] rounded-lg overflow-hidden"
            >
              <img
                src={selectedImage.url}
                alt={selectedImage.title || 'Gallery Image'}
                className="w-full h-full object-contain"
              />

              {/* Close Button */}
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 p-2 bg-black/60 hover:bg-black/80 rounded-full transition-colors z-10"
              >
                <X size={24} className="text-white" />
              </button>

              {/* Title */}
              {selectedImage.title && (
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                  <p className="text-white text-lg font-light">{selectedImage.title}</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
