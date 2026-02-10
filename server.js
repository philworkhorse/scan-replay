const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static
app.use(express.static(path.join(__dirname, 'public')));

// API: all scans
app.get('/api/scans', (req, res) => {
  const bundle = path.join(__dirname, 'scans-bundle.json');
  if (!fs.existsSync(bundle)) return res.status(500).json({ error: 'No scan bundle' });
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'public, max-age=300');
  fs.createReadStream(bundle).pipe(res);
});

app.listen(PORT, () => console.log(`Scan Replay → http://localhost:${PORT}`));
