const fs = require('fs');
const path = require('path');
const zip = require('unzipper');

const excelPath = process.argv[2];

if (!fs.existsSync(excelPath)) {
  console.error('File not found:', excelPath);
  process.exit(1);
}

fs.createReadStream(excelPath)
  .pipe(zip.Parse())
  .on('entry', (entry) => {
    if (entry.path === 'xl/worksheets/sheet1.xml') {
      let xml = '';
      entry.on('data', chunk => xml += chunk);
      entry.on('end', () => {
        // Find first row
        const rowMatch = xml.match(/<row r="1"[^>]*>(.*?)<\/row>/s);
        if (rowMatch) {
          const cells = rowMatch[1].match(/<c[^>]*>.*?<\/c>/g) || [];
          const headers = cells.map(cell => {
            const valueMatch = cell.match(/<v>(.*?)<\/v>/);
            return valueMatch ? valueMatch[1] : '';
          });
          console.log('Headers found:');
          headers.forEach((h, i) => console.log(`  ${i}: ${h}`));
        }
      });
    } else {
      entry.autodrain();
    }
  });
