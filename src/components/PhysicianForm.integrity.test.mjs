import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..');
const read = (rel) => readFileSync(join(ROOT, rel), 'utf8');

let passed=0,total=0,failures=[];
function check(c,d){total++; if(c){passed++;console.log('  PASS: '+d);}else{failures.push(d);console.log('  FAIL: '+d);}}
const FORM=read('src/components/PhysicianForm.jsx');
const APP=read('src/App.jsx');
const CA=read('src/lib/chartAdapters.js');

console.log('\n--- PhysicianForm fabricated values ---');
check(!/t\.defaultDoctor/.test(FORM), 'no default doctor name fallback');
check(!/t\.defaultHospital/.test(FORM), 'no fallback hospital');
check(!/t\.defaultComment/.test(FORM), 'no canned clinical comment');
check(!/gov: selectedGov \|\| 'aswan'/.test(FORM), 'no hidden Aswan default in form');
check(/required/.test(FORM) || /is required/.test(FORM), 'required field validation present');
check(/هذا الحقل مطلوب/.test(FORM), 'Arabic error message present');
check(/is required/.test(FORM), 'English error message present');

console.log('\n--- Governorate selection ---');
check(!/return 'aswan'/.test(APP), 'no silent Aswan default in App');
check(/terrapulse_selected_gov/.test(APP), 'governorate persisted across reloads');

console.log('\n--- Chart labeling ---');
check(!/CLINICAL_DEMAND_PCT/.test(CA), 'CLINICAL_DEMAND_PCT removed');
check(!/chartClimateDemand/.test(CA), 'no measured-presented demand series');

console.log('\n'+'='.repeat(80));
console.log(`RESULTS: ${passed}/${total}`);
if(failures.length){failures.forEach(f=>console.log(' - '+f));process.exit(1);}
process.exit(0);