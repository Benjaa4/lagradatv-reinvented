import React, { useRef, useEffect } from 'react';

export const BackgroundVideo: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Forzar play programático silenciado para navegadores estrictos
    if (videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
      videoRef.current.play().catch((err) => {
        console.warn('Autoplay bloqueado o video no encontrado:', err);
      });
    }
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none">
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover opacity-60"
      >
        <source src="/189845-886596453.mp4" type="video/mp4" />
        <source src="/bg-video.mp4" type="video/mp4" />
      </video>

      {/* Velo de contraste (asegúrate de que no sea 100% opaco) */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#090a0f]/50 via-[#090a0f]/40 to-[#090a0f]/70" />

      {/* Orbes de soporte */}
      <div className="absolute -top-32 -left-32 w-80 h-80 bg-blue-600/15 rounded-full blur-[120px]" />
      <div className="absolute top-1/2 -right-32 w-80 h-80 bg-purple-600/10 rounded-full blur-[120px]" />
    </div>
  );
};

export default BackgroundVideo;
