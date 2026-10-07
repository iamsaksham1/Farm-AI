import React from 'react';

export default function HowItWorks({ t }) {
  const steps = [
    {
      num: "01",
      title: t.hiwStep1Title,
      desc: t.hiwStep1Desc,
    },
    {
      num: "02",
      title: t.hiwStep2Title,
      desc: t.hiwStep2Desc,
    },
    {
      num: "03",
      title: t.hiwStep3Title,
      desc: t.hiwStep3Desc,
    },
  ];

  return (
    <section className="py-16 max-w-4xl mx-auto px-4 sm:px-6">
      <div className="border-t border-black/[0.08] dark:border-white/[0.08] pt-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
          {/* Asymmetric Left Column: Heading & Lead */}
          <div className="md:col-span-5 space-y-2">
            <span className="label-meta block">01.0 / {t.hiwTitle}</span>
            <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-neutral-900 dark:text-neutral-100 leading-snug">
              {t.hiwSubtitle}
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed pt-2">
              Designed for zero-training deployment in rural extension centers, field trials, and farmer cooperatives.
            </p>
          </div>

          {/* Asymmetric Right Column: Numbered Sequence with Hairlines */}
          <div className="md:col-span-7 divide-y divide-black/[0.08] dark:divide-white/[0.08] border-y md:border-y-0 border-black/[0.08] dark:border-white/[0.08]">
            {steps.map((s, idx) => (
              <div key={idx} className="py-4 first:pt-0 last:pb-0 space-y-1.5">
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-xs text-neutral-400 dark:text-neutral-500">
                    {s.num}
                  </span>
                  <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                    {s.title}
                  </h3>
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed pl-7">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
