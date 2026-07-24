import { useState, useEffect, useRef } from 'react';
import { Image as ImageIcon } from 'lucide-react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  loading?: 'lazy' | 'eager';
}

/**
 * Optimized image component with lazy loading and better caching
 */
export function OptimizedImage({
  src,
  alt,
  className = 'w-full h-full object-cover',
  width,
  height,
  loading = 'lazy',
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!src) {
      setIsLoading(false);
      return;
    }

    const img = imgRef.current;
    if (!img) return;

    // Preload image
    const preloadImg = new Image();
    preloadImg.onload = () => {
      setIsLoading(false);
      setHasError(false);
    };
    preloadImg.onerror = () => {
      setIsLoading(false);
      setHasError(true);
    };
    preloadImg.src = src;
  }, [src]);

  if (!src) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-stone-900">
        <ImageIcon size={24} className="text-stone-600" />
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-stone-900 z-10">
          <div className="animate-pulse">
            <ImageIcon size={24} className="text-stone-600" />
          </div>
        </div>
      )}

      {hasError && (
        <div className="w-full h-full flex items-center justify-center bg-stone-900">
          <div className="text-center">
            <ImageIcon size={24} className="text-stone-600 mx-auto mb-2" />
            <p className="text-xs text-stone-500">Failed to load</p>
          </div>
        </div>
      )}

      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className={className}
        loading={loading}
        width={width}
        height={height}
        style={{ display: hasError || isLoading ? 'none' : 'block' }}
        onLoad={() => {
          setIsLoading(false);
          setHasError(false);
        }}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
      />
    </div>
  );
}
