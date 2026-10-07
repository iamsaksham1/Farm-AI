import React, { useState } from 'react';

export default function GradCAMViewer({ originalImage, gradcamImage, t }) {
  const [blend, setBlend] = useState(50);
  const [viewMode, setViewMode] = useState('blend');

  if (!gradcamImage) return null;

  return (
    <div className="border-t border-black/[0.08] dark:border-white/[0.08] pt-5 mt-6">
      <div className="flex items-center justify-between gap-3 mb-3">
        <span className="label-meta">{t.gradcamToggle}</span>
        
        <div className="flex items-center gap-1 border border-black/[0.08] dark:border-white/[0.08] rounded-md p-0.5 text-[11px] font-mono">
          <button
            onClick={() => setViewMode('blend')}
            className={`px-2 py-0.5 rounded transition-all ${viewMode === 'blend' ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900' : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100'}`}
          >
            {t.gradcamBlend}
          </button>
          <button
            onClick={() => setViewMode('side')}
            className={`px-2 py-0.5 rounded transition-all ${viewMode === 'side' ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900' : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100'}`}
          >
            Side-by-Side
          </button>
        </div>
      </div>

      <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4 leading-relaxed">
        {t.gradcamHint}
      </p>

      {viewMode === 'blend' ? (
        <div className="space-y-3">
          <div className="relative aspect-video max-h-64 w-full rounded-lg overflow-hidden border border-black/[0.08] dark:border-white/[0.08] bg-black/5 dark:bg-black/40 flex items-center justify-center">
            <img
              src={originalImage}
              alt="Original leaf"
              className="absolute inset-0 w-full h-full object-contain"
            />
            <img
              src={gradcamImage}
              alt="Grad-CAM"
              className="absolute inset-0 w-full h-full object-contain mix-blend-screen transition-opacity duration-150"
              style={{ opacity: blend / 100 }}
            />
          </div>

          <div className="flex items-center gap-3 px-1 pt-1">
            <span className="text-[11px] font-mono text-neutral-400">
              0% (Leaf)
            </span>
            <input
              type="range"
              min="0"
              max="100"
              value={blend}
              onChange={(e) => setBlend(Number(e.target.value))}
              className="w-full h-1 bg-neutral-200 dark:bg-neutral-800 rounded appearance-none cursor-pointer accent-neutral-800 dark:accent-neutral-200"
            />
            <span className="text-[11px] font-mono text-neutral-600 dark:text-neutral-300">
              {blend}% (Heatmap)
            </span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <div className="border border-black/[0.08] dark:border-white/[0.08] rounded-lg p-2 bg-black/[0.02] dark:bg-white/[0.02]">
            <span className="text-[10px] font-mono uppercase text-neutral-400 block mb-1.5">{t.gradcamOriginal}</span>
            <div className="aspect-video rounded overflow-hidden bg-black/10 flex items-center justify-center">
              <img src={originalImage} alt="Original" className="w-full h-full object-contain" />
            </div>
          </div>
          <div className="border border-black/[0.08] dark:border-white/[0.08] rounded-lg p-2 bg-black/[0.02] dark:bg-white/[0.02]">
            <span className="text-[10px] font-mono uppercase text-neutral-400 block mb-1.5">{t.gradcamHeatmap}</span>
            <div className="aspect-video rounded overflow-hidden bg-black/10 flex items-center justify-center">
              <img src={gradcamImage} alt="Grad-CAM" className="w-full h-full object-contain" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
