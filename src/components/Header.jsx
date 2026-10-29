import React, { useState } from 'react';
import { Activity, Stethoscope, FileText, Sliders, Globe, Compass, Printer, Menu, X, Satellite } from 'lucide-react';

export default function Header({
  lang,
  setLang,
  t,
  activeTab,
  setActiveTab,
  onOpenWizard
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
    const el = document.getElementById(`section-${tabId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#030508]/90 backdrop-blur-2xl border-b border-white/[0.08] transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-13 sm:h-14 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Brand Logo & Mission Title */}
        <div 
          className="flex items-center space-x-2 rtl:space-x-reverse cursor-pointer shrink-0 group" 
          onClick={() => handleTabClick('detective')}
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-b from-sky-400/20 to-sky-600/10 border border-sky-400/30 flex items-center justify-center shadow-[0_0_15px_rgba(56,189,248,0.25)] group-hover:border-sky-400/50 transition-all">
            <Activity className="w-4 h-4 text-sky-400" />
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="font-semibold text-sm sm:text-base tracking-tight text-white group-hover:text-sky-300 transition-colors">
              {t.appTitle}
            </span>
            <span className="satellite-chip hidden xs:inline-flex items-center gap-1 text-[9px] sm:text-[10px] text-sky-300/80 bg-sky-950/40 border-sky-800/40">
              <Satellite className="w-2.5 h-2.5 text-sky-400" />
              <span>{t.nasaBadge}</span>
            </span>
          </div>
        </div>

        {/* Center: Desktop Mission Control Segmented Track (Visible on lg: 1024px+) */}
        <nav className="hidden lg:flex items-center apple-segmented-track gap-0.5 max-w-xl">
          {navTabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`apple-segmented-item px-3 py-1 text-xs flex items-center gap-1.5 transition-all ${
                  isActive
                    ? 'apple-segmented-item-active'
                    : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-sky-400' : 'text-white/50'}`} />
                <span className="whitespace-nowrap">{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right: Actions & Mobile Hamburger */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          
          {/* Guided Tour Pill (Desktop & Large Screens) */}
          <button
            onClick={onOpenWizard}
            className="apple-chip px-2.5 py-1 rounded-full bg-white/[0.06] hover:bg-white/[0.1] text-white/80 hover:text-white border border-white/10 text-xs font-medium items-center gap-1.5 hidden xl:flex shrink-0"
            title={t.btnWizard}
          >
            <Compass className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span className="whitespace-nowrap">{t.btnWizard}</span>
          </button>

          {/* Quick Print Icon */}
          <button
            onClick={() => window.print()}
            className="apple-chip p-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white border border-white/10 hidden sm:flex shrink-0"
            title={t.btnPrintBrief}
          >
            <Printer className="w-3.5 h-3.5 text-white/60 shrink-0" />
          </button>

          {/* Language Switcher Pill - Always fully visible without clipping */}
          <button
            onClick={toggleLanguage}
            className="apple-chip px-3 py-1 rounded-full bg-white text-black hover:bg-neutral-200 font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all shrink-0"
          >
            <Globe className="w-3.5 h-3.5 text-black shrink-0" />
            <span className="whitespace-nowrap">{t.langBtn}</span>
          </button>

          {/* Mobile/Tablet Menu Button (< 1024px) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-white/80 hover:text-white transition-all shrink-0"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-sky-400" /> : <Menu className="w-5 h-5" />}
          </button>

        </div>

      </div>

      {/* Mobile & Tablet Mission Control Slide-Down Menu (< 1024px) */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-white/[0.08] bg-[#030508]/95 backdrop-blur-2xl px-4 py-4 space-y-3 transition-all animate-fadeIn">
          <div className="grid grid-cols-2 gap-2">
            {navTabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`p-2.5 rounded-xl text-xs font-medium flex items-center gap-2 transition-all ${
                    isActive
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-400/30'
                      : 'bg-white/[0.03] text-white/70 hover:text-white hover:bg-white/[0.06] border border-white/[0.06]'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-sky-400' : 'text-white/50'}`} />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenWizard();
              }}
              className="flex-1 py-2 px-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] border border-white/10 text-xs text-white/80 font-medium flex items-center justify-center gap-1.5"
            >
              <Compass className="w-3.5 h-3.5 text-sky-400" />
              <span>{t.btnWizard}</span>
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                window.print();
              }}
              className="py-2 px-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] border border-white/10 text-xs text-white/80 font-medium flex items-center justify-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5 text-white/60" />
              <span>{t.btnPrintBrief}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
