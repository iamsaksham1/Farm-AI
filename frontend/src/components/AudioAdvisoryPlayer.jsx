import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Sparkles, Loader2 } from 'lucide-react';
import { speechService } from '../services/speech';

export default function AudioAdvisoryPlayer({ text, lang = 'en', t }) {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    return () => {
      speechService.stop();
    };
  }, []);

  const handleToggle = () => {
    if (isPlaying) {
      speechService.stop();
      setIsPlaying(false);
    } else {
      speechService.speak(
        text,
        lang,
        () => setIsPlaying(true),
        () => setIsPlaying(false),
        (err) => {
          console.error("Speech error:", err);
          setIsPlaying(false);
        }
      );
    }
  };

  return (
    <button
      onClick={handleToggle}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm ${
        isPlaying
          ? 'bg-rose-500 hover:bg-rose-600 text-white animate-pulse'
          : 'bg-emerald-500 hover:bg-emerald-600 text-white hover:scale-[1.02]'
      }`}
      title={isPlaying ? t.stopAudioButton : t.listenButton}
    >
      {isPlaying ? (
        <>
          <VolumeX className="w-4 h-4" />
          <span>{t.stopAudioButton}</span>
        </>
      ) : (
        <>
          <Volume2 className="w-4 h-4" />
          <span>{t.listenButton}</span>
        </>
      )}
    </button>
  );
}
