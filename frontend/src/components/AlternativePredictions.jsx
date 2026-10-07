import React from 'react';

export default function AlternativePredictions({ top3, lang, t }) {
  if (!top3 || top3.length <= 1) return null;

  const isHindi = lang === 'hi';

  return (
    <div className="border-t border-black/[0.08] dark:border-white/[0.08] pt-5 mt-6">
      <span className="label-meta block mb-3">{t.top3Title}</span>

      <div className="space-y-2">
        {top3.slice(1).map((item, idx) => {
          const diseaseName = isHindi ? item.disease_name_hi || item.disease_name : item.disease_name;
          const cropName = isHindi ? item.crop_hi || item.crop : item.crop;
          return (
            <div key={idx} className="flex justify-between items-center text-xs py-1.5 border-b border-black/[0.04] dark:border-white/[0.04]">
              <span className="text-neutral-700 dark:text-neutral-300">
                <span className="font-medium text-neutral-900 dark:text-neutral-100">{cropName}</span>: {diseaseName}
              </span>
              <span className="font-mono text-neutral-500 dark:text-neutral-400 font-medium">
                {item.confidence}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
