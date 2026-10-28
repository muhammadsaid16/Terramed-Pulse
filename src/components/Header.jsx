import React from 'react';
import { Activity, Stethoscope, FileText, Sliders, HelpCircle, Printer, Globe, Sparkles, Orbit, Compass } from 'lucide-react';

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
    { id: 'detective', label: t.navTab1, icon: Activity },
    { id: 'doctor', label: t.navTab2, icon: Stethoscope },
    { id: 'physicians', label: t.navTab3, icon: FileText },
    { id: 'decision', label: t.navTab4, icon: Sliders }
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#040508]/80 backdrop-blur-2xl border-b border-white/[0.08] transition-all">
      {/* Subtle Apple Keynote Top Status Strip */}
      <div className="bg-gradient-to-r from-transparent via-white/[0.03] to-transparent border-b border-white/[0.04] text-xs py-1.5 px-4 text-center text-neutral-400 flex items-center justify-center gap-2">
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-white/[0.06] text-white/90 border border-white/10 tracking-wide">
          <Orbit className="w-3 h-3 text-sky-400" />
          NASA Space Apps Challenge 2026
        </span>
        <span className="hidden sm:inline text-white/20">•</span>
        <span className="truncate max-w-2xl text-[11px] sm:text-xs text-white/60">{t.tagline}</span>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          {/* Brand Identity */}
          <div 
            className="flex items-center space-x-3 rtl:space-x-reverse cursor-pointer group" 
            onClick={() => setActiveTab('detective')}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-b from-white/15 to-white/5 border border-white/10 flex items-center justify-center shadow-sm group-hover:border-white/25 transition-all">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <span className="font-semibold text-lg tracking-tight text-white group-hover:text-white/90 transition-colors">
                  {t.appTitle}
                </span>
                <span className="text-[10px] font-medium tracking-wider px-2 py-0.5 rounded-full bg-white/[0.06] text-neutral-300 border border-white/10">
                  {t.egyptTag}
                </span>
              </div>
              <p className="text-[11px] text-white/45 truncate hidden md:block">
                {t.appSubtitle}
              </p>
            </div>
          </div>

          {/* Apple Segmented Navigation Pill Track */}
          <nav className="apple-segmented-track flex items-center gap-0.5">
            {navTabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    const el = document.getElementById(`section-${tab.id}`);
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`apple-segmented-item px-3 py-1.5 text-xs flex items-center gap-1.5 transition-all ${
                    isActive
                      ? 'apple-segmented-item-active'
                      : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-white/50'}`} />
                  <span className="hidden lg:inline">{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Action & Utility Buttons */}
          <div className="flex items-center gap-2">
            
            {/* Quick Case Demonstrations */}
            <div className="hidden xl:flex items-center gap-1 bg-white/[0.03] border border-white/[0.08] rounded-full p-1 text-xs">
              <span className="text-white/40 px-2 font-medium text-[11px] flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400/80" />
                {t.btnCases}
              </span>
              <button
                onClick={() => onApplyCase(1)}
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-all ${
                  activeCase === 1 ? 'bg-white text-black font-semibold' : 'text-white/70 hover:text-white hover:bg-white/[0.06]'
                }`}
                title="Upper Egypt Heat & Kidney Crisis"
              >
                {t.demo1}
              </button>
              <button
                onClick={() => onApplyCase(2)}
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-all ${
                  activeCase === 2 ? 'bg-white text-black font-semibold' : 'text-white/70 hover:text-white hover:bg-white/[0.06]'
                }`}
                title="Nile Delta Water & Agro Shift"
              >
                {t.demo2}
              </button>
              <button
                onClick={() => onApplyCase(3)}
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-all ${
                  activeCase === 3 ? 'bg-white text-black font-semibold' : 'text-white/70 hover:text-white hover:bg-white/[0.06]'
                }`}
                title="Cairo Urban Heat & Air Quality"
              >
                {t.demo3}
              </button>
            </div>

            {/* Guided Tour Wizard */}
            <button
              onClick={onOpenWizard}
              className="apple-chip px-3 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.1] text-white/80 hover:text-white border border-white/10 text-xs font-medium flex items-center gap-1.5"
            >
              <Compass className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">{t.btnWizard}</span>
            </button>

            {/* Math Proof Guide */}
            <button
              onClick={onOpenMath}
              className="apple-chip px-2.5 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white border border-white/10 text-xs flex items-center gap-1"
              title="Mathematical Methodology Guide"
            >
              <HelpCircle className="w-3.5 h-3.5 text-white/50" />
              <span className="hidden sm:inline">{t.btnMathExplain}</span>
            </button>

            {/* Print Brief */}
            <button
              onClick={() => window.print()}
              className="apple-chip px-2.5 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white border border-white/10 text-xs flex items-center gap-1"
              title="Print 1-Page Ministerial Executive Brief"
            >
              <Printer className="w-3.5 h-3.5 text-white/50" />
              <span className="hidden sm:inline">{t.btnPrintBrief}</span>
            </button>

            {/* Language Switcher Pill */}
            <button
              onClick={toggleLanguage}
              className="apple-chip px-3 py-1.5 rounded-full bg-white text-black hover:bg-neutral-200 font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{t.langBtn}</span>
            </button>

          </div>

        </div>
      </div>
    </header>
  );
}
