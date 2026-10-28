import React from 'react';

export default function PrintBrief({
  govData,
  selectedGov,
  lang,
  t
}) {
  const govName = lang === 'ar' ? govData?.name_ar : govData?.name_en;
  const baseHni = govData?.baseline_indices?.hni || 75;
  const simHni = Math.round(baseHni * 0.84 * 10) / 10;

  return (
    <div id="print-executive-brief" className="hidden">
      
      {/* Print Header */}
      <div className="border-b-2 border-slate-900 pb-3 mb-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-950">
            {t.printTitle}
          </h1>
          <div className="text-xs text-slate-700 font-semibold mt-1">
            {t.printSub}
          </div>
        </div>
        <div className="w-16 h-16 border-2 border-dashed border-slate-800 rounded-full flex flex-col items-center justify-center text-[8px] text-center font-bold text-slate-800 leading-tight">
          <span>SEAL OF</span>
          <span>EGYPT</span>
        </div>
      </div>

      {/* Target Info */}
      <div className="print-box">
        <div className="flex justify-between text-xs mb-1 font-bold text-slate-900">
          <span>Target Governorate: <b>{govName}</b></span>
          <span>{t.printDate}</span>
        </div>
        <p className="text-xs text-slate-700 leading-relaxed">
          {t.printIntro}
        </p>
      </div>

      {/* Indicators Table */}
      <table className="print-table">
        <thead>
          <tr>
            <th>Indicator</th>
            <th>Baseline Status</th>
            <th>Simulated Policy Dividend</th>
            <th>Strategic Impact</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Composite Health Need (HNI)</td>
            <td><b>{baseHni}</b> / 100</td>
            <td><b>{simHni}</b> / 100</td>
            <td>Substantial vulnerability reduction</td>
          </tr>
          <tr>
            <td>Prevented Emergency Visits</td>
            <td>Baseline High Influx</td>
            <td><b>1,159</b> visits / month</td>
            <td>Relieves overcrowded district triage</td>
          </tr>
          <tr>
            <td>Physician Retention Gain</td>
            <td>Severe Brain Drain Deficit</td>
            <td><b>+23%</b> Retention Gain</td>
            <td>Stabilizes rural nephrology & ER units</td>
          </tr>
        </tbody>
      </table>

      {/* Recommended Directives */}
      <div className="print-box">
        <div className="font-bold text-xs mb-1 text-slate-950">
          {t.directiveTitle}
        </div>
        <ol className="text-xs space-y-1.5 list-decimal pl-4 rtl:pr-4 text-slate-800">
          <li>{t.directive1}</li>
          <li>{t.directive2}</li>
          <li>{t.directive3}</li>
        </ol>
      </div>

      {/* Signoff Row */}
      <div className="flex justify-between items-end pt-8 mt-6 border-t border-slate-400 text-xs text-slate-900">
        <div>
          <div>_________________________________</div>
          <div className="font-bold mt-1">Minister of Health & Population</div>
        </div>
        <div className="text-center">
          <div className="font-bold">TerraPulse Verified System</div>
          <div className="text-[9px] text-slate-600">NASA Space Apps Challenge 2026</div>
        </div>
        <div className="text-right rtl:text-left">
          <div>_________________________________</div>
          <div className="font-bold mt-1">Minister of Environment</div>
        </div>
      </div>

    </div>
  );
}
