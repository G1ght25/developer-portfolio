import React, { useState, useEffect } from 'react';
import { UtensilsCrossed } from 'lucide-react';

interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
  referrerPolicy?: 'no-referrer' | 'no-referrer-when-downgrade' | 'origin' | 'origin-when-cross-origin' | 'same-origin' | 'strict-origin' | 'strict-origin-when-cross-origin' | 'unsafe-url';
  placeholderEmoji?: string;
}

export default function ProductImage({
  src,
  alt,
  className = '',
  referrerPolicy = 'origin',
  placeholderEmoji
}: ProductImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Automatically proxy external images (like Unsplash) through our own server to prevent Russian ISP DPI / mobile cellular blocking
  const effectiveSrc = src && (src.startsWith('http://') || src.startsWith('https://'))
    ? `/api/proxy-image?url=${encodeURIComponent(src)}`
    : src;

  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3500);
    return () => clearTimeout(timer);
  }, [effectiveSrc]);

  if (hasError || !src) {
    return (
      <div className={`flex flex-col items-center justify-center bg-gradient-to-br from-panda-charcoal to-panda-gray/50 select-none ${className}`}>
        <div className="h-8 w-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/30 mb-1.5 shadow-inner">
          <UtensilsCrossed className="h-4 w-4 text-white/40" />
        </div>
        <span className="text-[9px] font-extrabold text-white/30 uppercase tracking-widest px-2 text-center truncate max-w-full">
          Суши Панда
        </span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-panda-charcoal ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 z-0 flex items-center justify-center bg-panda-charcoal animate-pulse">
          <div className="h-5 w-5 rounded-full border-2 border-panda-orange border-t-transparent animate-spin" />
        </div>
      )}
      <img
        src={effectiveSrc}
        alt="" // Explicitly empty alt inside img tag to prevent browser from rendering overlapping default broken alt text
        referrerPolicy={referrerPolicy}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
        ref={(el) => {
          if (el && el.complete && el.naturalHeight !== 0 && isLoading) {
            setIsLoading(false);
          }
        }}
        className={`relative z-10 h-full w-full object-cover transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
      />
    </div>
  );
}
