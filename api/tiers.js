// Vercel Serverless Function: /api/tiers
// Connects to Cloud Storage with real-time sync across devices and users
const CLOUD_BIN_URL = 'https://extendsclass.com/api/json-storage/bin/cdbfeab';

module.exports = async function handler(req, res) {
  // CORS & Cache control headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET: Fetch latest tiers from cloud storage
  if (req.method === 'GET') {
    try {
      const response = await fetch(`${CLOUD_BIN_URL}?t=${Date.now()}`, {
        headers: { 'Cache-Control': 'no-cache' }
      });
      if (response.ok) {
        const data = await response.json();
        return res.status(200).json(data || {});
      }
      return res.status(200).json({});
    } catch (err) {
      console.error('Error fetching tiers from cloud:', err);
      return res.status(200).json({});
    }
  }

  // POST: Save and merge tiers to cloud storage
  if (req.method === 'POST') {
    try {
      let payload = req.body;
      if (typeof payload === 'string') {
        try { payload = JSON.parse(payload); } catch(e) {}
      }

      if (!payload || typeof payload !== 'object') {
        return res.status(400).json({ error: 'Invalid payload' });
      }

      // Check if reset action requested
      if (payload.action === 'reset' && payload.dept) {
        let current = {};
        try {
          const r = await fetch(`${CLOUD_BIN_URL}?t=${Date.now()}`, { headers: { 'Cache-Control': 'no-cache' } });
          if (r.ok) current = await r.json();
        } catch(e) {}
        delete current[payload.dept];

        await fetch(CLOUD_BIN_URL, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(current)
        });
        return res.status(200).json({ success: true, tiers: current });
      }

      // Standard save: fetch existing cloud data to safely merge
      let existingData = {};
      try {
        const curr = await fetch(`${CLOUD_BIN_URL}?t=${Date.now()}`, {
          headers: { 'Cache-Control': 'no-cache' }
        });
        if (curr.ok) {
          existingData = await curr.json();
        }
      } catch (e) {}

      // Merge departments
      const merged = { ...(existingData || {}) };
      for (const dept in payload) {
        if (dept === 'action' || !payload[dept] || typeof payload[dept] !== 'object') continue;
        if (!merged[dept]) {
          merged[dept] = {};
        }
        for (const appId in payload[dept]) {
          const numId = Number(appId);
          if (!isNaN(numId) && numId > 0) {
            merged[dept][appId] = payload[dept][appId];
          }
        }
      }

      // Cleanse any non-numeric/dummy keys across all departments
      for (const dept in merged) {
        if (!merged[dept] || typeof merged[dept] !== 'object') {
          delete merged[dept];
          continue;
        }
        for (const appId in merged[dept]) {
          const numId = Number(appId);
          if (isNaN(numId) || numId <= 0) {
            delete merged[dept][appId];
          }
        }
        if (Object.keys(merged[dept]).length === 0) {
          delete merged[dept];
        }
      }

      const saveRes = await fetch(CLOUD_BIN_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(merged)
      });

      if (saveRes.ok) {
        return res.status(200).json({ success: true, tiers: merged });
      } else {
        const errText = await saveRes.text();
        return res.status(500).json({ error: 'Cloud storage write failed', details: errText });
      }
    } catch (err) {
      console.error('Error saving tiers to cloud:', err);
      return res.status(500).json({ error: 'Internal server error', message: err.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
};
