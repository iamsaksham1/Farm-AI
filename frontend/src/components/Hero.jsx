import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import MagneticButton from './MagneticButton';

export default function Hero({ onStartScan, onTrySamples, t }) {
  const containerRef = useRef(null);

  // Scroll parallax
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const orbY = useTransform(scrollYProgress, [0, 1], [0, 45]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, 25]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.2]);

  // Cursor 3D tilt on Orb
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { stiffness: 100, damping: 18 };
  const rotateX = useSpring(mouseY, springConfig);
  const rotateY = useSpring(mouseX, springConfig);

  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsTouchDevice(window.matchMedia('(pointer: coarse)').matches);
    }
  }, []);

  const handleMouseMove = (e) => {
    if (isTouchDevice || !containerRef.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = (clientX - (left + width / 2)) / (width / 2);
    const y = (clientY - (top + height / 2)) / (height / 2);
    mouseX.set(x * 12);  // max 12deg tilt
    mouseY.set(-y * 12);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const customEase = [0.22, 1, 0.36, 1];

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative pt-12 pb-10 sm:pt-20 sm:pb-16 text-center max-w-4xl mx-auto px-4 sm:px-6 select-none"
    >
      {/* Visual Centerpiece: Soft-Lit Orb with 3D Tilt & Breathing Shadow */}
      <motion.div
        style={{ y: orbY, opacity }}
        className="flex justify-center mb-10"
      >
        <div className="atmos-orb-container">
          <motion.div
            style={{
              rotateX: isTouchDevice ? 0 : rotateX,
              rotateY: isTouchDevice ? 0 : rotateY,
            }}
            className="atmos-orb animate-float-slow"
          />
          <div className="atmos-orb-shadow" />
        </div>
      </motion.div>

      {/* Editorial Typography Container */}
      <motion.div style={{ y: textY, opacity }} className="space-y-4">
        {/* Small Metadata Header */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: customEase }}
          className="flex items-center justify-center gap-2"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 dark:bg-neutral-500" />
          <span className="label-meta">
            {t.heroBadge}
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 dark:bg-neutral-500" />
        </motion.div>

        {/* Masked Headline Reveal */}
        <div className="overflow-hidden py-1">
          <motion.h1
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.1, ease: customEase }}
            className="text-3xl sm:text-5xl md:text-6xl font-medium tracking-tight text-neutral-900 dark:text-neutral-100 leading-[1.12]"
          >
            {t.heroTitlePrefix}{" "}
            <span className="italic font-serif font-normal text-neutral-800 dark:text-neutral-200">
              {t.heroTitleHighlight}
            </span>
          </motion.h1>
        </div>

        {/* Staggered Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25, ease: customEase }}
          className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 max-w-xl mx-auto leading-relaxed pt-1"
        >
          {t.heroDescription}
        </motion.p>
      </motion.div>

      {/* Action Triggers with Magnetic Hover */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.35, ease: customEase }}
        className="mt-9 flex flex-wrap items-center justify-center gap-3"
      >
        <MagneticButton
          onClick={onStartScan}
          className="px-6 py-2.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 text-xs font-medium tracking-tight shadow-sm"
        >
          {t.heroCtaScan}
        </MagneticButton>

        <MagneticButton
          onClick={onTrySamples}
          className="px-5 py-2.5 rounded-lg border border-black/[0.1] dark:border-white/[0.1] hover:border-black/[0.25] dark:hover:border-white/[0.25] text-neutral-700 dark:text-neutral-300 text-xs font-medium tracking-tight bg-transparent"
        >
          {t.heroCtaSamples}
        </MagneticButton>
      </motion.div>
    </section>
  );
}
