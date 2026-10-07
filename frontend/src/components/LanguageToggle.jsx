import React from 'react';

export default function LanguageToggle({ lang, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className="px-2.5 py-1 rounded-md text-xs font-mono tracking-wider uppercase text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors border border-black/[0.08] dark:border-white/[0.08]"
      title="Toggle Language / भाषा बदलें"
    >
      {lang === 'en' ? 'HI' : 'EN'}
    </button>
  );
}
