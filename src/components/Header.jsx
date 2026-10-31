import React, { useState } from 'react';
import { Activity, Stethoscope, FileText, Sliders, Globe, Compass, Printer, Menu, X, Satellite, Sun, Moon } from 'lucide-react';

export default function Header({
  lang,
  setLang,
  theme,
  setTheme,
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
    <header className="sticky top-0 z-40 bg-white/85 dark:bg-[#050811]/90 backdrop-blur-2xl border-b border-slate-200/80 dark:border-white/[0.08] transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-13 sm:h-14 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Brand Logo & Mission Title */}
        <div 
          className="flex items-center space-x-2 rtl:space-x-reverse cursor-pointer shrink-0 group" 
          onClick={() => handleTabClick('detective')}
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-b from-sky-500/15 to-sky-600/10 border border-sky-400/30 flex items-center justify-center shadow-sm dark:shadow-[0_0_15px_rgba(56,189,248,0.25)] group-hover:border-sky-400/50 transition-all">
            <Activity className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="font-semibold text-sm sm:text-base tracking-tight text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-300 transition-colors">
              {t.appTitle}
            </span>
            <span className="satellite-chip hidden xs:inline-flex items-center gap-1 text-[9px] sm:text-[10px] text-sky-700 bg-sky-50 border-sky-200 dark:text-sky-300/80 dark:bg-sky-950/40 dark:border-sky-800/40">
              <Satellite className="w-2.5 h-2.5 text-sky-500 dark:text-sky-400" />
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
                    : 'text-slate-600 dark:text-white/60 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-white/[0.04]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-sky-600 dark:text-sky-400' : 'text-slate-400 dark:text-white/50'}`} />
                <span className="whitespace-nowrap">{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right: Actions & Theme & Mobile Hamburger */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          
          {/* Guided Tour Pill (Desktop & Large Screens) */}
          <button
            onClick={onOpenWizard}
            className="apple-chip px-2.5 py-1 rounded-full text-xs font-medium items-center gap-1.5 hidden xl:flex shrink-0"
            title={t.btnWizard}
          >
            <Compass className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
            <span className="whitespace-nowrap">{t.btnWizard}</span>
          </button>

          {/* Quick Print Icon */}
          <button
            onClick={() => window.print()}
            className="apple-chip p-1.5 rounded-full hidden sm:flex shrink-0"
            title={t.btnPrintBrief}
          >
            <Printer className="w-3.5 h-3.5 text-slate-500 dark:text-white/60 shrink-0" />
          </button>

          {/* Theme Switcher Button (Clean Lab Dual Theme) */}
          <button
            type="button"
            onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
            className="apple-chip p-1.5 sm:px-2.5 sm:py-1 rounded-full flex items-center gap-1.5 shrink-0 font-medium text-xs"
            title={theme === 'dark' ? t.themeLight : t.themeDark}
            aria-label={t.toggleTheme}
          >
            {theme === 'dark' ? (
              <Sun className="w-3.5 h-3.5 text-amber-400 hover:rotate-45 transition-transform shrink-0" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-slate-700 hover:-rotate-12 transition-transform shrink-0" />
            )}
            <span className="hidden md:inline-block whitespace-nowrap text-[11px]">
              {theme === 'dark' ? t.themeLight : t.themeDark}
            </span>
          </button>

          {/* Language Switcher Pill */}
          <button
            onClick={toggleLanguage}
            className="px-3 py-1 rounded-full bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-all shrink-0 active:scale-95"
          >
            <Globe className="w-3.5 h-3.5 shrink-0" />
            <span className="whitespace-nowrap">{t.langBtn}</span>
          </button>

          {/* Mobile/Tablet Menu Button (< 1024px) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white/80 transition-all shrink-0"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-sky-600 dark:text-sky-400" /> : <Menu className="w-5 h-5" />}
          </button>

        </div>

      </div>

      {/* Mobile & Tablet Mission Control Slide-Down Menu (< 1024px) */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-white/[0.08] bg-white/95 dark:bg-[#050811]/95 backdrop-blur-2xl px-4 py-4 space-y-3 transition-all animate-fadeIn">
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
                      ? 'bg-sky-500/15 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300 border border-sky-400/40'
                      : 'bg-slate-100/70 text-slate-700 dark:bg-white/[0.03] dark:text-white/70 hover:bg-slate-200 dark:hover:bg-white/[0.06] border border-slate-200 dark:border-white/[0.06]'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-sky-600 dark:text-sky-400' : 'text-slate-500 dark:text-white/50'}`} />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-white/[0.08] flex items-center justify-between gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenWizard();
              }}
              className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.05] dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/10 text-xs text-slate-700 dark:text-white/80 font-medium flex items-center justify-center gap-1.5"
            >
              <Compass className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              <span>{t.btnWizard}</span>
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                window.print();
              }}
              className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.05] dark:hover:bg-white/[0.08] border border-slate-200 dark:border-white/10 text-xs text-slate-700 dark:text-white/80 font-medium flex items-center justify-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500 dark:text-white/60" />
              <span>{t.btnPrintBrief}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
