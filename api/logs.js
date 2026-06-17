const MAX_LOGS = 500;

async function upstash(url, token, ...args) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(args),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data.result;
}

async function getLogs(url, token) {
  const raw = await upstash(url, token, 'GET', 'logs');
  return raw ? JSON.parse(raw) : [];
}

async function setLogs(url, token, logs) {
  await upstash(url, token, 'SET', 'logs', JSON.stringify(logs));
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
      return res.json(await getLogs(url, token));
    }

    if (req.method === 'POST') {
      const logs = await getLogs(url, token);
      logs.unshift(req.body);
      if (logs.length > MAX_LOGS) logs.splice(MAX_LOGS);
      await setLogs(url, token, logs);
      return res.json({ ok: true });
    }

    if (req.method === 'DELETE') {
      await setLogs(url, token, []);
      return res.json({ ok: true });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
