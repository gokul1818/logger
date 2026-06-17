const { kv } = require('@vercel/kv');

const MAX_LOGS = 500;

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
    return res.status(500).json({
      error: 'KV store not connected. Go to your Vercel project → Storage → Create KV Database → Connect to project, then redeploy.',
    });
  }

  try {
    if (req.method === 'GET') {
      const logs = (await kv.get('logs')) || [];
      return res.json(logs);
    }

    if (req.method === 'POST') {
      const logs = (await kv.get('logs')) || [];
      logs.unshift(req.body);
      if (logs.length > MAX_LOGS) logs.splice(MAX_LOGS);
      await kv.set('logs', logs);
      return res.json({ ok: true });
    }

    if (req.method === 'DELETE') {
      await kv.set('logs', []);
      return res.json({ ok: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
