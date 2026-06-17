const { Redis } = require('@upstash/redis');

const MAX_LOGS = 500;

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return res.status(500).json({
      error: 'Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN env vars.',
    });
  }

  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

  try {
    if (req.method === 'GET') {
      const logs = (await redis.get('logs')) || [];
      return res.json(logs);
    }

    if (req.method === 'POST') {
      const logs = (await redis.get('logs')) || [];
      logs.unshift(req.body);
      if (logs.length > MAX_LOGS) logs.splice(MAX_LOGS);
      await redis.set('logs', logs);
      return res.json({ ok: true });
    }

    if (req.method === 'DELETE') {
      await redis.set('logs', []);
      return res.json({ ok: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
