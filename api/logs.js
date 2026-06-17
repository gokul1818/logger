const MAX_LOGS = 500;

async function kvGet(url, token, key) {
  const res = await fetch(`${url}/get/${key}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  return data.result ? JSON.parse(data.result) : null;
}

async function kvSet(url, token, key, value) {
  await fetch(`${url}/set/${key}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ value: JSON.stringify(value) }),
  });
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;

  if (!url || !token) {
    return res.status(500).json({ error: 'Missing KV_REST_API_URL or KV_REST_API_TOKEN' });
  }

  try {
    if (req.method === 'GET') {
      const logs = (await kvGet(url, token, 'logs')) || [];
      return res.json(logs);
    }

    if (req.method === 'POST') {
      const logs = (await kvGet(url, token, 'logs')) || [];
      logs.unshift(req.body);
      if (logs.length > MAX_LOGS) logs.splice(MAX_LOGS);
      await kvSet(url, token, 'logs', logs);
      return res.json({ ok: true });
    }

    if (req.method === 'DELETE') {
      await kvSet(url, token, 'logs', []);
      return res.json({ ok: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
