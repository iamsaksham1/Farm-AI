import React, { useState, useEffect } from 'react';
import { translations } from './i18n/translations';
import { predictImage, getSamples } from './services/api';

import Navbar from './components/Navbar';
import Hero from './components/Hero';
import StatsSection from './components/StatsSection';
import HowItWorks from './components/HowItWorks';
import ScanUploader from './components/ScanUploader';
import ResultCard from './components/ResultCard';
import HistoryDrawer from './components/HistoryDrawer';
import DashboardAnalytics from './components/DashboardAnalytics';

export default function App() {
  const [lang, setLang] = useState('en');
  const [isDark, setIsDark] = useState(false); // Default to Atmos warm light mode
  const [currentView, setCurrentView] = useState('scan');

  const [samples, setSamples] = useState([]);
  const [diagnosticResult, setDiagnosticResult] = useState(null);
  const [originalImageUrl, setOriginalImageUrl] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const t = translations[lang] || translations.en;

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  useEffect(() => {
    getSamples()
      .then((data) => setSamples(data))
      .catch((err) => console.error("Error loading samples:", err));
  }, []);

  const handleScan = async (file) => {
    setIsAnalyzing(true);
    const preview = URL.createObjectURL(file);
    setOriginalImageUrl(preview);

    try {
      const result = await predictImage(file, true);
      setDiagnosticResult(result);
    } catch (err) {
      console.error("Scan error:", err);
      alert(err.message || "Failed to analyze leaf image. Ensure backend is running.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSampleSelect = async (sample) => {
    setIsAnalyzing(true);
    try {
      const res = await fetch(sample.image_url);
      const blob = await res.blob();
      const file = new File([blob], sample.filename, { type: 'image/jpeg' });
      setOriginalImageUrl(sample.image_url);
      const result = await predictImage(file, true);
      setDiagnosticResult(result);
    } catch (err) {
      console.error("Sample scan error:", err);
      alert("Failed to analyze demo sample leaf.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setDiagnosticResult(null);
    setOriginalImageUrl(null);
  };

  const scrollToScanner = () => {
    setCurrentView('scan');
    handleReset();
    const el = document.getElementById('scanner-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f3] dark:bg-[#141413] text-[#1a1a1a] dark:text-[#f3f3ef] transition-colors duration-200">
      {/* Navbar */}
      <Navbar
        currentView={currentView}
        setView={(v) => {
          setCurrentView(v);
          if (v === 'scan' && !diagnosticResult) {
            handleReset();
          }
        }}
        lang={lang}
        setLang={setLang}
        isDark={isDark}
        setIsDark={setIsDark}
        t={t}
      />

      {/* Main Container */}
      <main className="flex-1">
        {currentView === 'scan' && (
          <div>
            {!diagnosticResult ? (
              <>
                <Hero
                  onStartScan={scrollToScanner}
                  onTrySamples={scrollToScanner}
                  t={t}
                />

                <StatsSection t={t} />

                <div id="scanner-section" className="py-8 max-w-4xl mx-auto px-4 sm:px-6">
                  <ScanUploader
                    onScan={handleScan}
                    samples={samples}
                    onSampleSelect={handleSampleSelect}
                    isAnalyzing={isAnalyzing}
                    lang={lang}
                    t={t}
                  />
                </div>

                <HowItWorks t={t} />
              </>
            ) : (
              <div className="py-10 px-4 sm:px-6">
                <ResultCard
                  result={diagnosticResult}
                  originalImageUrl={originalImageUrl}
                  onReset={handleReset}
                  lang={lang}
                  t={t}
                />
              </div>
            )}
          </div>
        )}

        {currentView === 'dashboard' && (
          <DashboardAnalytics lang={lang} t={t} />
        )}

        {currentView === 'history' && (
          <HistoryDrawer
            lang={lang}
            t={t}
            onStartScan={scrollToScanner}
          />
        )}
      </main>

      {/* Minimalist Editorial Footer */}
      <footer className="mt-16 border-t border-black/[0.08] dark:border-white/[0.08] py-8 px-4 sm:px-6 text-xs text-neutral-500">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-medium text-neutral-800 dark:text-neutral-200">AgriVision</span>
            <span>·</span>
            <span>{t.footerTagline}</span>
          </div>

          <div className="flex items-center gap-3 font-mono text-[11px] text-neutral-400">
            <span>PlantVillage (38 Classes)</span>
            <span>·</span>
            <span>MobileNetV2 + Grad-CAM</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
