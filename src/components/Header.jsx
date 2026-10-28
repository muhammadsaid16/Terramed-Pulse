import React from 'react';
import { Satellite, Compass, HelpCircle, Printer, Languages, Sparkles } from 'lucide-react';

export default function Header({
  lang,
  setLang,
  t,
  activeTab,
  setActiveTab,
  onOpenWizard,
  onOpenMath,
  onApplyCase,
  activeCase
}) {
  const toggleLanguage = () => {
    const nextLang = lang === 'en' ? 'ar' : 'en';
    setLang(nextLang);
    document.documentElement.lang = nextLang;
    document.documentElement.dir = nextLang === 'ar' ? 'rtl' : 'ltr';
  };

  const navTabs = [
    { id: 'detective', label: t.navTab1, icon: '🕵️‍♂️' },
    { id: 'doctor', label: t.navTab2, icon: '🩺' },
    { id: 'physicians', label: t.navTab3, icon: '📝' },
    { id: 'decision', label: t.navTab4, icon: '📊' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-space-950/85 backdrop-blur-2xl border-b border-white/10 transition-all">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-nasa-blue via-teal-900/60 to-space-950 border-b border-teal-500/30 text-xs py-1.5 px-4 text-center font-medium text-teal-200 flex items-center justify-center gap-2">
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-400/40">
          NASA SPACE APPS 2026
        </span>
        <span className="hidden sm:inline text-teal-500/60">•</span>
        <span className="truncate max-w-2xl text-[11px] sm:text-xs">{t.tagline}</span>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          {/* Logo & Identity */}
          <div className="flex items-center space-x-3 rtl:space-x-reverse cursor-pointer" onClick={() => setActiveTab('detective')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 via-teal-400 to-nasa-blue p-0.5 flex items-center justify-center shadow-apple-glow">
              <div className="w-full h-full bg-space-950 rounded-[10px] flex items-center justify-center">
                <Satellite className="w-5 h-5 text-teal-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-teal-400 via-teal-200 to-blue-400 bg-clip-text text-transparent">
                  {t.appTitle}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  {t.egyptTag}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate hidden md:block">
                {t.appSubtitle}
              </p>
            </div>
          </div>

          {/* Quick-Jump Segmented Navigation Tabs */}
          <nav className="flex items-center bg-slate-900/90 border border-white/10 rounded-xl p-1 gap-1 shadow-inner">
            {navTabs.map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    const el = document.getElementById(`section-${tab.id}`);
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`apple-chip px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    isActive
                      ? 'bg-teal-500 text-slate-950 shadow-md font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span className="hidden lg:inline">{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Utility Action Buttons */}
          <div className="flex items-center gap-2">
            
            {/* 1-Click Cases Dropdown / Buttons */}
            <div className="hidden xl:flex items-center gap-1.5 bg-slate-900/80 border border-white/10 rounded-xl p-1 text-xs">
              <span className="text-slate-400 px-2 font-semibold text-[11px] flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                {t.btnCases}
              </span>
              <button
                onClick={() => onApplyCase(1)}
                className={`apple-chip px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                  activeCase === 1 ? 'bg-teal-600 text-white font-bold' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                }`}
                title="Upper Egypt Heat & Kidney Crisis"
              >
                ⚡ {t.demo1}
              </button>
              <button
                onClick={() => onApplyCase(2)}
                className={`apple-chip px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                  activeCase === 2 ? 'bg-teal-600 text-white font-bold' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                }`}
                title="Nile Delta Water & Agro Shift"
              >
                🌊 {t.demo2}
              </button>
              <button
                onClick={() => onApplyCase(3)}
                className={`apple-chip px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                  activeCase === 3 ? 'bg-teal-600 text-white font-bold' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                }`}
                title="Cairo Urban Heat & Air Quality"
              >
                🏙️ {t.demo3}
              </button>
            </div>

            {/* Guided Wizard */}
            <button
              onClick={onOpenWizard}
              className="apple-btn px-2.5 sm:px-3 py-1.5 rounded-lg bg-teal-600/30 hover:bg-teal-600/50 text-teal-300 border border-teal-500/40 text-xs font-semibold flex items-center gap-1.5"
            >
              <Compass className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.btnWizard}</span>
            </button>

            {/* Math Proof */}
            <button
              onClick={onOpenMath}
              className="apple-btn px-2 sm:px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-white/10 text-xs flex items-center gap-1"
              title="Mathematical Methodology Guide"
            >
              <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">{t.btnMathExplain}</span>
            </button>

            {/* Print Brief */}
            <button
              onClick={() => window.print()}
              className="apple-btn px-2 sm:px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-white/10 text-xs flex items-center gap-1"
              title="Print 1-Page Ministerial Executive Brief"
            >
              <Printer className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">{t.btnPrintBrief}</span>
            </button>

            {/* Bilingual Toggle */}
            <button
              onClick={toggleLanguage}
              className="apple-btn px-3 py-1.5 rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-teal-500/20"
            >
              <Languages className="w-3.5 h-3.5" />
              <span>{t.langBtn}</span>
            </button>

          </div>

        </div>
      </div>
    </header>
  );
}
