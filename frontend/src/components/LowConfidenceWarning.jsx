import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function LowConfidenceWarning({ t, onRetake }) {
  return (
    <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 text-neutral-800 dark:text-neutral-200 mb-6 flex items-start gap-3">
      <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
      <div className="space-y-1">
        <h4 className="text-xs font-semibold text-amber-800 dark:text-amber-300">
          {t.lowConfidenceWarningTitle}
        </h4>
        <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
          {t.lowConfidenceWarningDesc}
        </p>
      </div>
    </div>
  );
}
