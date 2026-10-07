import React from 'react';
import AnimatedNumber from './AnimatedNumber';

export default function StatsSection({ t }) {
  const stats = [
    { num: 38, suffix: "", label: t.statClasses, sub: t.statClassesSub },
    { num: 98.4, suffix: "%", label: t.statAccuracy, sub: t.statAccuracySub },
    { num: 1200, prefix: "₹", suffix: "+", label: t.statCostSaved, sub: t.statCostSavedSub },
    { num: 250, prefix: "<", suffix: "ms", label: t.statLatency, sub: t.statLatencySub },
  ];

  return (
    <section className="py-6 max-w-4xl mx-auto px-4 sm:px-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-black/[0.08] dark:bg-white/[0.08] rounded-xl overflow-hidden border border-black/[0.08] dark:border-white/[0.08]">
        {stats.map((s, idx) => (
          <div key={idx} className="bg-[#f5f5f3] dark:bg-[#141413] p-4 text-center">
            <span className="font-mono text-xl sm:text-2xl font-medium text-neutral-900 dark:text-neutral-100 block">
              {s.prefix || ""}<AnimatedNumber value={s.num} suffix={s.suffix} />
            </span>
            <span className="label-meta block mt-1">
              {s.label}
            </span>
            <span className="text-[10px] font-mono text-neutral-400 block mt-0.5">
              {s.sub}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
