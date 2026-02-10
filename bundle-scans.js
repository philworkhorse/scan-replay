#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const SCAN_DIR = path.join(require('os').homedir(), 'ct-scanner/data');
const OUT = path.join(__dirname, 'scans-bundle.json');

const files = fs.readdirSync(SCAN_DIR)
  .filter(f => f.startsWith('scan-') && f.endsWith('.json'))
  .sort();

console.log(`Found ${files.length} scan files`);

const scans = [];
for (const f of files) {
  try {
    const raw = JSON.parse(fs.readFileSync(path.join(SCAN_DIR, f), 'utf8'));
    scans.push({
      ts: raw.timestamp,
      s: { b: raw.sentiment?.bullish || 0, br: raw.sentiment?.bearish || 0, n: raw.sentiment?.neutral || 0 },
      t: (raw.topTickers || []).slice(0, 10).map(([k, v]) => [k.replace('$',''), v]),
      cat: Object.fromEntries(
        Object.entries(raw.byCategory || {}).map(([cat, arr]) => [cat, arr.map(x => [x.ticker.replace('$',''), x.count])])
      ),
      kw: raw.keywordMentions || {},
      he: (raw.highEngagement || []).slice(0, 5).map(p => ({
        u: p.username || p.author,
        l: p.likes || p.engagement,
        txt: (p.text || p.content || '').slice(0, 200),
        url: p.url || ''
      }))
    });
  } catch (e) {
    console.error(`Skip ${f}: ${e.message}`);
  }
}

scans.sort((a, b) => new Date(a.ts) - new Date(b.ts));
fs.writeFileSync(OUT, JSON.stringify(scans));
console.log(`Bundled ${scans.length} scans → ${(fs.statSync(OUT).size / 1024).toFixed(0)}KB`);
