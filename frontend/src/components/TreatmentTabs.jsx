import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TreatmentTabs({ advisory, lang, t }) {
  const [activeTab, setActiveTab] = useState('organic');

  const isHindi = lang === 'hi';
  const organicText = isHindi ? advisory.organic_treatment_hi || advisory.organic_treatment : advisory.organic_treatment;
  const chemicalText = isHindi ? advisory.chemical_treatment_hi || advisory.chemical_treatment : advisory.chemical_treatment;
  const costText = isHindi ? advisory.cost_estimate_inr_hi || advisory.cost_estimate_inr : advisory.cost_estimate_inr;
  const preventionText = isHindi ? advisory.prevention_hi || advisory.prevention : advisory.prevention;

  const tabs = [
    { id: 'organic', label: isHindi ? 'जैविक उपाय' : 'Organic & Bio' },
    { id: 'chemical', label: isHindi ? 'जेनेरिक रासायनिक' : 'Generic Chemical' },
    { id: 'prevention', label: isHindi ? 'जलवायु बचाव' : 'Field Prevention' },
  ];

  const customEase = [0.22, 1, 0.36, 1];

  return (
    <div className="border-t border-black/[0.08] dark:border-white/[0.08] pt-5 mt-6">
      <span className="label-meta block mb-3">{t.treatmentTabsTitle}</span>

      {/* Sliding Hairline Tabs */}
      <div className="flex border-b border-black/[0.08] dark:border-white/[0.08] gap-6 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-2 text-xs font-medium tracking-tight transition-colors relative ${
              activeTab === tab.id
                ? 'text-neutral-900 dark:text-neutral-100 font-semibold'
                : 'text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200'
            }`}
          >
            <span>{tab.label}</span>
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTreatmentTab"
                transition={{ type: "spring", stiffness: 220, damping: 25 }}
                className="absolute bottom-0 inset-x-0 h-0.5 bg-neutral-900 dark:bg-neutral-100"
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content with subtle cross-fade and vertical offset */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.25, ease: customEase }}
          className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed min-h-[72px]"
        >
          {activeTab === 'organic' && (
            <p>{organicText}</p>
          )}

          {activeTab === 'chemical' && (
            <div className="space-y-3">
              <p>{chemicalText}</p>
              <div className="pt-2 flex items-center gap-2 font-mono text-xs text-neutral-900 dark:text-neutral-100 border-t border-black/[0.06] dark:border-white/[0.06]">
                <span className="text-neutral-400 uppercase text-[10px] tracking-wider">{t.estimatedCostLabel}</span>
                <span className="font-semibold">{costText}</span>
              </div>
            </div>
          )}

          {activeTab === 'prevention' && (
            <p>{preventionText}</p>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
