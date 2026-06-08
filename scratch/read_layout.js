import fs from 'fs';
import * as XLSX from 'xlsx';

const templatePath = './新機種製作需求一覽表2026 v2.xlsx';
if (!fs.existsSync(templatePath)) {
  console.error('Template not found:', templatePath);
  process.exit(1);
}

const buf = fs.readFileSync(templatePath);
const wb = XLSX.read(buf, { type: 'buffer' });
const sheet = wb.Sheets['產品基本資料'];

console.log('--- Sheet: 產品基本資料 ---');
for (let r = 1; r <= 30; r++) {
  const line = [];
  for (let c = 0; c < 8; c++) {
    const colName = String.fromCharCode(65 + c);
    const addr = `${colName}${r}`;
    const val = sheet[addr] ? sheet[addr].v : '';
    line.push(`${addr}: [${val}]`);
  }
  console.log(`Row ${r.toString().padStart(2, '0')}: ` + line.join(' | '));
}
