import React from 'react';

export default function SampleLeafPicker({ samples, onSelectSample, lang, t, isLoading }) {
  if (!samples || samples.length === 0) return null;

  const isHindi = lang === 'hi';

  return (
    <div className="mt-8 pt-6 border-t border-black/[0.06] dark:border-white/[0.06]">
      <div className="flex items-center justify-between mb-3">
        <span className="label-meta">
          {t.trySampleTitle}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {samples.map((sample) => {
          const diseaseName = isHindi ? sample.disease_name_hi || sample.disease_name : sample.disease_name;
          const cropName = sample.crop;

          return (
            <button
              key={sample.id}
              disabled={isLoading}
              onClick={() => onSelectSample(sample)}
              className="p-2.5 rounded-lg bg-black/[0.02] hover:bg-black/[0.05] dark:bg-white/[0.02] dark:hover:bg-white/[0.05] border border-black/[0.06] dark:border-white/[0.06] transition-all text-left disabled:opacity-50 group"
            >
              <div className="aspect-[4/3] w-full rounded overflow-hidden mb-2 bg-neutral-200 dark:bg-neutral-800">
                <img
                  src={sample.image_url}
                  alt={sample.disease_name}
                  className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-300"
                />
              </div>
              <span className="text-xs font-medium text-neutral-900 dark:text-neutral-100 block truncate">
                {cropName}
              </span>
              <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block truncate">
                {diseaseName}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
