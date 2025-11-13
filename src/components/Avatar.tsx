import { useState } from 'react';

interface AvatarProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  size?: number;
}

export default function Avatar({ src, alt, className = '', size }: AvatarProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Generate a consistent fallback avatar based on the username
  const getFallbackAvatar = () => {
    const seed = alt || 'user';
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;
  };

  const avatarSrc = imageError || !src ? getFallbackAvatar() : src;

  const handleError = () => {
    if (!imageError) {
      setImageError(true);
    }
  };

  const handleLoad = () => {
    setImageLoaded(true);
  };

  return (
    <img
      src={avatarSrc}
      alt={alt}
      className={`${className} ${!imageLoaded ? 'avatar-loading' : ''}`}
      onError={handleError}
      onLoad={handleLoad}
      style={size ? { width: size, height: size } : undefined}
      loading="lazy"
    />
  );
}
