import React, { useState } from 'react';
import { Activity, Stethoscope, FileText, Sliders, Globe, Compass, Printer, Menu, X, Satellite, Sun, Moon } from 'lucide-react';
import { Button, Badge } from './ui';
import { scrollBehavior } from '../lib/motionTokens';

function OrbitMark({ className = '' }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" aria-hidden="true" className={className}>
      <circle cx="20" cy="20" r="6.5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="20" cy="20" r="2.2" fill="currentColor" />
      <ellipse cx="20" cy="20" rx="16" ry="7" stroke="currentColor" strokeWidth="1.1" opacity="0.55" transform="rotate(-28 20 20)" />
      <ellipse cx="20" cy="20" rx="16" ry="7" stroke="currentColor" strokeWidth="1.1" opacity="0.28" transform="rotate(38 20 20)" />
      <circle cx="33.2" cy="10.7" r="1.9" fill="currentColor" />
    </svg>
  );
}

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
      el.scrollIntoView({ behavior: scrollBehavior() });
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[color:var(--line)] bg-[color:var(--bg)] backdrop-blur-2xl transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-3 sm:px-6 lg:px-8">

        {/* Brand & mission */}
        <div
          className="group flex shrink-0 cursor-pointer items-center gap-3"
          onClick={() => handleTabClick('detective')}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[11px] border border-[color:var(--line-strong)] bg-[color:var(--panel-2)] text-[color:var(--accent)] transition-colors group-hover:border-[color:var(--accent)]">
            <OrbitMark className="h-6 w-6" />
          </div>
          <div className="flex flex-col justify-center text-start">
            <div className="flex items-center gap-2">
              <span className="font-display text-[15px] font-semibold leading-tight tracking-[-0.01em] text-[color:var(--ink)]">
                {t.appTitle}
              </span>
              <Badge variant="default" pulse={true} className="hidden items-center gap-1 py-0.5 text-2xs xs:inline-flex">
                <Satellite className="h-2.5 w-2.5 text-[color:var(--info)] dark:text-sky-400" />
                <span>{t.nasaBadge}</span>
              </Badge>
            </div>
            <div
              dir="ltr"
              className="mt-0.5 select-none font-mono text-[10.5px] font-semibold uppercase tracking-[0.26em] text-[color:var(--muted)] transition-colors group-hover:text-[color:var(--accent)]"
            >
              TERRAMED PULSE
            </div>
          </div>
        </div>

        {/* Desktop mission nav */}
        <nav className="hidden max-w-xl items-center gap-0.5 rounded-full border border-[color:var(--line)] bg-[color:var(--panel-2)] p-1 lg:flex">
          {navTabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`flex select-none items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition-[color,background-color,border-color,box-shadow,transform,filter] duration-150 ease-[cubic-bezier(0.2,0,0,1)] active:scale-[0.98] ${
                  isActive
                    ? 'bg-[color:var(--panel)] font-semibold text-[color:var(--ink)] shadow-[0_1px_2px_rgba(0,0,0,0.18)] ring-1 ring-[color:var(--line)]'
                    : 'font-medium text-[color:var(--muted)] hover:bg-[color:var(--panel)] hover:text-[color:var(--ink)]'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 shrink-0 transition-colors ${isActive ? 'text-[color:var(--accent)]' : 'text-[color:var(--muted)]'}`} />
                <span className="whitespace-nowrap">{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">

          <Button
            variant="outline"
            size="chip"
            onClick={onOpenWizard}
            className="hidden items-center gap-1.5 xl:flex"
            title={t.btnWizard}
          >
            <Compass className="h-3.5 w-3.5 shrink-0 text-[color:var(--accent)]" />
            <span className="whitespace-nowrap">{t.btnWizard}</span>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.print()}
            className="hidden h-8 w-8 rounded-full sm:flex"
            title={t.btnPrintBrief}
          >
            <Printer className="h-3.5 w-3.5 shrink-0 text-[color:var(--muted)]" />
          </Button>

          <Button
            variant="outline"
            size="chip"
            onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}
            className="flex items-center gap-1.5"
            title={theme === 'dark' ? t.themeLight : t.themeDark}
            aria-label={t.toggleTheme}
          >
            {theme === 'dark' ? (
              <Sun className="h-3.5 w-3.5 shrink-0 text-amber-400 transition-transform duration-200 hover:rotate-45" />
            ) : (
              <Moon className="h-3.5 w-3.5 shrink-0 text-[color:var(--ink-2)] transition-transform duration-200 hover:-rotate-12" />
            )}
            <span className="hidden whitespace-nowrap text-micro md:inline-block">
              {theme === 'dark' ? t.themeLight : t.themeDark}
            </span>
          </Button>

          <Button
            variant="inverse"
            size="chip"
            onClick={toggleLanguage}
            className="font-semibold"
          >
            <Globe className="h-3.5 w-3.5 shrink-0" />
            <span className="whitespace-nowrap">{t.langBtn}</span>
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="h-8 w-8 lg:hidden"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-4 w-4 text-[color:var(--accent)]" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Scroll progress hairline */}
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-px overflow-hidden">
        <div className="scroll-progress h-full w-full bg-[color:var(--accent)]" />
      </div>

      {/* Mobile mission menu */}
      {mobileMenuOpen && (
        <div className="animate-fadeIn border-t border-[color:var(--line)] bg-[color:var(--bg)] px-4 py-4 backdrop-blur-2xl lg:hidden">
          <div dir="ltr" className="border-b border-[color:var(--line)] py-1 text-center font-mono text-[11px] font-semibold uppercase tracking-[0.28em] text-[color:var(--accent)]">
            TERRAMED PULSE
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {navTabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`flex items-center gap-2 rounded-xl border p-2.5 text-xs font-medium transition-[color,background-color,border-color,box-shadow,transform,filter] ${
                    isActive
                      ? 'border-[rgb(var(--accent-rgb)/0.45)] bg-[color:var(--accent-soft)] text-[color:var(--accent)]'
                      : 'border-[color:var(--line)] bg-[color:var(--panel-2)] text-[color:var(--ink-2)] hover:border-[color:var(--line-strong)]'
                  }`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-[color:var(--accent)]' : 'text-[color:var(--muted)]'}`} />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex items-center justify-between gap-2 border-t border-[color:var(--line)] pt-3">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenWizard();
              }}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[color:var(--line)] bg-[color:var(--panel-2)] px-3 py-2 text-xs font-medium text-[color:var(--ink-2)] hover:border-[color:var(--line-strong)]"
            >
              <Compass className="h-3.5 w-3.5 text-[color:var(--accent)]" />
              <span>{t.btnWizard}</span>
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                window.print();
              }}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-[color:var(--line)] bg-[color:var(--panel-2)] px-3 py-2 text-xs font-medium text-[color:var(--ink-2)] hover:border-[color:var(--line-strong)]"
            >
              <Printer className="h-3.5 w-3.5 text-[color:var(--muted)]" />
              <span>{t.btnPrintBrief}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
