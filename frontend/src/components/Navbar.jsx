import React, { useState } from 'react';
import LanguageToggle from './LanguageToggle';
import ThemeToggle from './ThemeToggle';

export default function Navbar({ currentView, setView, lang, setLang, isDark, setIsDark, t }) {
  const navItems = [
    { id: 'scan', label: t.navScan },
    { id: 'dashboard', label: t.navDashboard },
    { id: 'history', label: t.navHistory },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#f5f5f3]/90 dark:bg-[#141413]/90 backdrop-blur-md border-b border-black/[0.06] dark:border-white/[0.06] transition-colors">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Brand / Logo */}
        <button
          onClick={() => setView('scan')}
          className="flex items-center gap-2.5 text-left group"
        >
          <span className="w-2 h-2 rounded-full bg-neutral-900 dark:bg-neutral-100" />
          <span className="font-sans font-medium text-sm tracking-tight text-neutral-900 dark:text-neutral-100">
            AgriVision
          </span>
          <span className="text-[11px] font-mono text-neutral-400 dark:text-neutral-500 pl-1">
            01.0
          </span>
        </button>

        {/* Center Nav Items */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                currentView === item.id
                  ? 'text-neutral-900 dark:text-neutral-100 bg-black/[0.05] dark:bg-white/[0.08]'
                  : 'text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-2">
          <LanguageToggle
            lang={lang}
            onToggle={() => setLang(lang === 'en' ? 'hi' : 'en')}
          />
          <ThemeToggle
            isDark={isDark}
            onToggle={() => setIsDark(!isDark)}
          />
        </div>
      </div>
    </header>
  );
}
