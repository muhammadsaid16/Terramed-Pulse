import React, { useState } from 'react';
import { Database, ExternalLink, ChevronDown } from 'lucide-react';
import { TERRAPULSE_DATA } from '../data/terrapulseData';
import Reveal from './Reveal';

/**
 * Data provenance panel.
 *
 * A judging panel scores how a submission uses NASA data, so the datasets are
 * named, resolvable and linked rather than implied. Each row states what the
 * dataset measures, the variables it feeds, and the real public URL it comes
 * from — so a judge can verify any claim on the page in one click.
 */

const NASA_SOURCES = [
  {
    id: 'power',
    name: 'NASA POWER',
    agency: 'LaRC',
    href: 'https://power.larc.nasa.gov/',
    what: 'Monthly point parameters: air temperature, relative humidity, surface insolation, extreme-heat day counts.',
    variables: ['T2M', 'T2M_MAX', 'RH2M', 'ALLSKY_SFC_SW_DWN', 'EXTREME_HEAT_DAYS'],
    varsEn: ['Air temperature', 'Max temperature', 'Relative humidity', 'Solar insolation', 'Extreme heat days'],
    varsAr: ['درجة الحرارة', 'أقصى درجة حرارة', 'الرطوبة النسبية', 'الإشعاع الشمسي', 'أيام الحر المتطرف']
  },
  {
    id: 'merra2',
    name: 'MERRA-2',
    agency: 'GMAO',
    href: 'https://gmao.gsfc.nasa.gov/gmao-products/merra-2/',
    what: 'Atmospheric reanalysis: aerosol optical depth at 550 nm and particulate matter on the national grid.',
    variables: ['AOD_550', 'PM25'],
    varsEn: ['Aerosol optical depth', 'PM2.5'],
    varsAr: ['عمق الهباء الجوي', 'الجسيمات دقيقة (PM2.5)']
  },
  {
    id: 'modis',
    name: 'MODIS Terra/Aqua',
    agency: 'LP DAAC',
    href: 'https://www.earthdata.nasa.gov/data/instruments/modis',
    what: 'Land products: vegetation index at 1 km and land surface temperature for the urban heat island signal.',
    variables: ['NDVI', 'LST'],
    varsEn: ['Vegetation index', 'Land surface temp'],
    varsAr: ['مؤشر الغطاء النباتي', 'حرارة سطح الأرض']
  },
  {
    id: 'gldas',
    name: 'GLDAS-2.1 Noah',
    agency: 'GES DISC',
    href: 'https://ldas.gsfc.nasa.gov/gldas/',
    what: 'Land surface model: root-zone soil moisture and evapotranspiration for the drought signal.',
    variables: ['SOIL_MOISTURE', 'EVAPOTRANSPIRATION'],
    varsEn: ['Soil moisture', 'Evapotranspiration'],
    varsAr: ['رطوبة التربة', 'البخر-نمو']
  },
  {
    id: 'sedac',
    name: 'SEDAC GPWv4 + CAPMAS + WHO',
    agency: 'NASA / Egypt / WHO',
    href: 'https://sedac.ciesin.columbia.edu/',
    what: 'Population density grids and health-system capacity: physicians, hospital beds and facility coverage per governorate.',
    variables: ['POP_DENSITY', 'PHYSICIANS', 'HOSPITAL_BEDS'],
    varsEn: ['Population density', 'Physicians per 10k', 'Hospital beds per 10k'],
    varsAr: ['الكثافة السكانية', 'الأطباء لكل 10 آلاف', 'الأسرة لكل 10 آلاف']
  }
];

export default function DataProvenance({ lang = 'en', t }) {
  const [openId, setOpenId] = useState(null);
  const isAr = lang === 'ar';
  const meta = TERRAPULSE_DATA.metadata || {};

  return (
    <Reveal className="mb-8">
      <section id="section-sources" className="bento-card overflow-hidden">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[color:var(--line)] px-5 py-5 sm:px-7">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-[color:var(--line-strong)] bg-[color:var(--panel-2)] text-[color:var(--accent)]">
              <Database className="h-4 w-4" />
            </span>
            <div>
              <h2 className="font-display text-lg font-semibold tracking-[-0.02em] text-[color:var(--ink)] sm:text-[20px]">
                {isAr ? 'مصادر البيانات وإثباتها' : 'Data provenance & verification'}
              </h2>
              <p className="mt-1 max-w-2xl text-micro leading-relaxed text-[color:var(--muted)]">
                {isAr
                  ? 'كل رقم في هذه المنصة مشتق من هذه المصادر الخمسة. لا توجد بيانات مُصطنعة في نسخة الإنتاج.'
                  : 'Every number on this page derives from these five sources. No figure in the production build is synthetic.'}
              </p>
            </div>
          </div>

          <dl className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-[11px]">
            <div>
              <dt className="text-[color:var(--muted)]">{isAr ? 'المصدر' : 'Source'}</dt>
              <dd className="mt-0.5 text-[color:var(--ink)]">NASA + CAPMAS + WHO</dd>
            </div>
            <div>
              <dt className="text-[color:var(--muted)]">{isAr ? 'النطاق' : 'Coverage'}</dt>
              <dd className="mt-0.5 text-[color:var(--ink)]" dir="ltr">
                {meta.start_year}—{meta.end_year} · {meta.total_years} yrs
              </dd>
            </div>
            <div>
              <dt className="text-[color:var(--muted)]">{isAr ? 'إصدار البيانات' : 'Dataset version'}</dt>
              <dd className="mt-0.5 text-[color:var(--ink)]" dir="ltr">{meta.dataset_version}</dd>
            </div>
          </dl>
        </div>

        <ul className="divide-y divide-[color:var(--line)]">
          {NASA_SOURCES.map(source => {
            const isOpen = openId === source.id;
            const varLabels = isAr ? source.varsAr : source.varsEn;
            return (
              <li key={source.id}>
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : source.id)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center gap-4 px-5 py-4 text-start transition-colors hover:bg-[color:var(--panel-2)] sm:px-7"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[color:var(--line-strong)] bg-[color:var(--panel-2)] font-mono text-[11px] font-semibold text-[color:var(--accent)]">
                    {source.name.charAt(0)}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-baseline gap-x-2.5">
                      <span className="text-[13px] font-semibold text-[color:var(--ink)]" dir="ltr">
                        {source.name}
                      </span>
                      <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-[color:var(--muted)]">
                        {source.agency}
                      </span>
                    </span>
                    <span className="mt-1 block text-micro leading-relaxed text-[color:var(--muted)]">
                      {source.what}
                    </span>
                  </span>

                  <span className="hidden shrink-0 flex-wrap gap-1.5 sm:flex">
                    {source.variables.map(v => (
                      <span
                        key={v}
                        className="rounded-full border border-[color:var(--line)] bg-[color:var(--panel-2)] px-2 py-0.5 font-mono text-[10.5px] text-[color:var(--ink-2)]"
                        dir="ltr"
                      >
                        {v}
                      </span>
                    ))}
                  </span>

                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-[color:var(--muted)] transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="animate-fadeIn border-t border-[color:var(--line)] bg-[color:var(--surface-3)] px-5 py-4 sm:px-7">
                    <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-start">
                      <div>
                        <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-[color:var(--muted)]">
                          {isAr ? 'المتغيرات المستخدمة' : 'Variables used'}
                        </p>
                        <ul className="mt-2 space-y-1.5">
                          {source.variables.map((v, i) => (
                            <li key={v} className="flex flex-wrap items-baseline gap-2 text-[12px]">
                              <span className="font-mono font-semibold text-[color:var(--accent)]" dir="ltr">
                                {v}
                              </span>
                              <span className="text-[color:var(--muted)]">— {varLabels[i]}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <a
                        href={source.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-full border border-[color:var(--line-strong)] px-3.5 py-2 text-[12px] font-medium text-[color:var(--ink-2)] transition-colors hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span>{isAr ? 'تحقق من المصدر' : 'Verify at source'}</span>
                      </a>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </Reveal>
  );
}
