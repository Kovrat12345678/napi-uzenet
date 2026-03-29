const { kv } = require('@vercel/kv');

module.exports = async function handler(req, res) {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'POST only' });
  }

  try {
    const subscription = req.body;
    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ error: 'Invalid subscription' });
    }

    // Store subscription by endpoint hash (prevents duplicates)
    const key = 'sub:' + Buffer.from(subscription.endpoint).toString('base64url').slice(0, 40);
    await kv.set(key, JSON.stringify(subscription));

    // Also add to the set of all subscriptions
    await kv.sadd('subscriptions', key);

    res.status(201).json({ ok: true });
  } catch (e) {
    console.error('Subscribe error:', e);
    res.status(500).json({ error: 'Server error' });
  }
};
