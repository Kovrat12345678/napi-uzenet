const webpush = require('web-push');
const { kv } = require('@vercel/kv');

const VAPID_PUBLIC = process.env.VAPID_PUBLIC_KEY;
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY;
const VAPID_EMAIL = process.env.VAPID_EMAIL || 'mailto:noreply@example.com';

const MESSAGES = [
  "Ma is vár a napi üzeneted! ✨",
  "A robotod már izgatottan vár rád! 🤖",
  "Nyisd meg és kapd meg a mai gondolatot! 💛",
  "Egy kis inspiráció vár rád ma! 🌟",
  "A mai üzeneted különleges — nézd meg! 🎁",
  "Ne feledd megnézni a napi üzeneted! 🔥",
  "A DailyBot robotod üzen neked! 💬",
  "Ma is készült neked valami szép! 🌈",
];

module.exports = async function handler(req, res) {
  // Only allow GET (cron) or POST with secret
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC, VAPID_PRIVATE);

    // Get all subscription keys
    const keys = await kv.smembers('subscriptions');
    if (!keys || keys.length === 0) {
      return res.status(200).json({ sent: 0, message: 'No subscriptions' });
    }

    const msg = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
    const payload = JSON.stringify({
      title: 'DailyBot 🤖',
      body: msg,
      icon: '/icon/dailybot-icon.png',
      badge: '/icon/dailybot-icon.png',
      tag: 'daily-' + new Date().toISOString().slice(0, 10),
    });

    let sent = 0;
    let failed = 0;

    for (const key of keys) {
      try {
        const subJson = await kv.get(key);
        if (!subJson) {
          await kv.srem('subscriptions', key);
          continue;
        }

        const subscription = typeof subJson === 'string' ? JSON.parse(subJson) : subJson;
        await webpush.sendNotification(subscription, payload);
        sent++;
      } catch (e) {
        // 410 Gone or 404 = subscription expired, remove it
        if (e.statusCode === 410 || e.statusCode === 404) {
          await kv.del(key);
          await kv.srem('subscriptions', key);
        }
        failed++;
      }
    }

    res.status(200).json({ sent, failed, total: keys.length });
  } catch (e) {
    console.error('Notify error:', e);
    res.status(500).json({ error: 'Server error' });
  }
};
