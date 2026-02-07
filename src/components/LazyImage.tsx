import React, { useState, useEffect, useRef } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { cn } from '../lib/utils';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  placeholderClassName?: string;
}

export function LazyImage({ src, alt, className, placeholderClassName, ...props }: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px',
        threshold: 0.01,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
  };

  return (
    <div ref={imgRef} className={cn("relative overflow-hidden bg-gray-100", className)}>
      {!isInView && (
        <div className={cn("absolute inset-0 flex items-center justify-center text-gray-300", placeholderClassName)}>
          <ImageIcon className="h-8 w-8" />
        </div>
      )}
      
      {isInView && !hasError && (
        <img
          src={src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-300",
            isLoaded ? "opacity-100" : "opacity-0",
            className
          )}
          {...props}
        />
      )}

      {isInView && !isLoaded && !hasError && (
        <div className={cn("absolute inset-0 flex items-center justify-center bg-gray-200 animate-pulse", placeholderClassName)}>
          <ImageIcon className="h-8 w-8 text-gray-400" />
        </div>
      )}

      {hasError && (
        <div className={cn("absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400", placeholderClassName)}>
          <div className="flex flex-col items-center">
            <ImageIcon className="h-8 w-8 mb-1" />
            <span className="text-xs">Failed to load</span>
          </div>
        </div>
      )}
    </div>
  );
}
