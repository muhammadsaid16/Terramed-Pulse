import { buildMigrationChartData } from './chartAdapters.js';

let passed = 0, total = 0, failures = [];
function check(c, d){ total++; if(c){passed++;console.log('  PASS: '+d);}else{failures.push(d);console.log('  FAIL: '+d);}}
function section(t){ console.log('\n--- '+t+' ---'); }

section('1. No reports -> no fabricated chart');
check(buildMigrationChartData([], 'en', {chartMigrationRisk:'Migration Risk (%)'}) === null, 'empty reports yields null (no empty ring)');

section('2. Measured only');
const reports = [
  { specialty:'nephrology', considering_migration:'yes', gov:'aswan' },
  { specialty:'nephrology', considering_migration:'no', gov:'aswan' },
];
const out = buildMigrationChartData(reports, 'en', {chartMigrationRisk:'Migration Risk (%)'});
check(out !== null, 'reports produce chart');
check(out.datasets.length === 1, 'only one dataset (measured migration risk)');
check(!('CLINICAL_DEMAND_PCT' in globalThis), 'no global fabricated constant');
check(out.labels.length === 1, 'one specialty series');

section('3. No demand dataset / modeled labeling');
check(!out.datasets.some(d => /demand/i.test(d.label)), 'no "demand" dataset presented as measured field data');

console.log('\n'+'='.repeat(80));
console.log(`RESULTS: ${passed}/${total}`);
if(failures.length){ failures.forEach(f=>console.log(' - '+f)); process.exit(1);}
process.exit(0);