import React from 'react';
import { motion } from 'framer-motion';
import AnimatedNumber from './AnimatedNumber';

export default function ConfidenceGauge({ confidence, isHealthy, size = 80 }) {
  const strokeWidth = 5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (confidence / 100) * circumference;

  let strokeColor = "#15803d"; // Deep Green
  if (confidence < 60) {
    strokeColor = "#dc2626"; // Crimson
  } else if (confidence < 80) {
    strokeColor = "#d97706"; // Amber
  }

  return (
    <div className="relative inline-flex flex-col items-center justify-center select-none" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-black/[0.06] dark:text-white/[0.06]"
          fill="transparent"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          strokeLinecap="round"
          fill="transparent"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="font-mono font-medium text-base text-neutral-900 dark:text-neutral-100 leading-none">
          <AnimatedNumber value={confidence} />%
        </span>
        <span className="text-[8px] uppercase tracking-wider text-neutral-400 font-mono mt-0.5">
          Match
        </span>
      </div>
    </div>
  );
}
