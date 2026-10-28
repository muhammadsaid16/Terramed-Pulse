import React from 'react';
import { Activity, Stethoscope, FileText, Sliders, Globe, Compass, Printer } from 'lucide-react';

export default function Header({
  lang,
  setLang,
  t,
  activeTab,
  setActiveTab,
  onOpenWizard
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
    <header className="sticky top-0 z-40 bg-[#040508]/85 backdrop-blur-2xl border-b border-white/[0.08] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
        
        {/* Brand Logo & Minimalist Title */}
        <div 
          className="flex items-center space-x-2.5 rtl:space-x-reverse cursor-pointer shrink-0 group" 
          onClick={() => setActiveTab('detective')}
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-b from-white/15 to-white/5 border border-white/10 flex items-center justify-center shadow-sm group-hover:border-white/25 transition-all">
            <Activity className="w-4 h-4 text-white" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-base tracking-tight text-white">
              {t.appTitle}
            </span>
            <span className="text-[10px] font-medium tracking-wider px-2 py-0.5 rounded-full bg-white/[0.06] text-white/50 border border-white/10 hidden sm:inline-block">
              NASA 2026
            </span>
          </div>
        </div>

        {/* Center: Apple Segmented Pill Track */}
        <nav className="apple-segmented-track flex items-center gap-0.5 max-w-xl">
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
                className={`apple-segmented-item px-3 py-1 text-xs flex items-center gap-1.5 transition-all ${
                  isActive
                    ? 'apple-segmented-item-active'
                    : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-white/50'}`} />
                <span className="hidden md:inline">{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right: Essential Compact Actions */}
        <div className="flex items-center gap-2 shrink-0">
          
          {/* Guided Tour Pill */}
          <button
            onClick={onOpenWizard}
            className="apple-chip px-2.5 py-1 rounded-full bg-white/[0.06] hover:bg-white/[0.1] text-white/80 hover:text-white border border-white/10 text-xs font-medium flex items-center gap-1.5 hidden sm:flex"
            title="Guided Tour"
          >
            <Compass className="w-3.5 h-3.5 text-sky-400" />
            <span>{t.btnWizard}</span>
          </button>

          {/* Quick Print Icon */}
          <button
            onClick={() => window.print()}
            className="apple-chip p-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white border border-white/10"
            title={t.btnPrintBrief}
          >
            <Printer className="w-3.5 h-3.5 text-white/60" />
          </button>

          {/* Language Switcher Pill */}
          <button
            onClick={toggleLanguage}
            className="apple-chip px-2.5 py-1 rounded-full bg-white text-black hover:bg-neutral-200 font-semibold text-xs flex items-center gap-1 shadow-sm transition-all"
          >
            <Globe className="w-3 h-3 text-black" />
            <span>{t.langBtn}</span>
          </button>

        </div>

      </div>
    </header>
  );
}
