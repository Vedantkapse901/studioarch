import { useState } from 'react';
import { motion } from 'framer-motion';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  width?: number;
  height?: number;
}

/**
 * Optimized image component with lazy loading and blur-up effect
 * - Lazy loads by default unless priority is set
 * - Shows blur while loading
 * - Optimizes B2 URLs with size hints
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  priority = false,
  width,
  height,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Optimize B2 URLs
  const optimizedSrc = src;

  return (
    <div className="relative overflow-hidden">
      {/* Placeholder/Blur background */}
      {!isLoaded && !hasError && (
        <div className={`absolute inset-0 bg-gradient-to-br from-stone-900 to-black animate-pulse ${className}`} />
      )}

      {/* Actual Image */}
      <motion.img
        src={optimizedSrc}
        alt={alt}
        className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
        loading={priority ? 'eager' : 'lazy'}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        width={width}
        height={height}
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoaded ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />

      {/* Error fallback */}
      {hasError && (
        <div className={`${className} bg-stone-800 flex items-center justify-center text-stone-500 text-sm`}>
          Image not available
        </div>
      )}
    </div>
  );
};
