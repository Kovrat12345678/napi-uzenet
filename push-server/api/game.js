// DailyBot multiplayer game endpoint
// Single endpoint with action param. Stores rooms in Vercel KV.
// Room TTL: 5 minutes (auto-expires inactive rooms).
const { kv } = require('@vercel/kv');

const ROOM_TTL = 300; // 5 minutes
const POLL_TIMEOUT = 25000;

function genCode() {
  return Math.floor(10000 + Math.random() * 89999).toString();
}

async function getRoom(code) {
  const data = await kv.get('game:' + code);
  return data ? (typeof data === 'string' ? JSON.parse(data) : data) : null;
}

async function saveRoom(code, room) {
  await kv.set('game:' + code, JSON.stringify(room), { ex: ROOM_TTL });
}

module.exports = async function handler(req, res) {
  // CORS
  if (req.method === 'OPTIONS') return res.status(200).end();

  const params = req.method === 'GET' ? req.query : (req.body || {});
  const action = params.action;
  const code = params.code;

  try {
    if (action === 'create') {
      // Create new room with random code
      let newCode = genCode();
      let attempts = 0;
      while (await getRoom(newCode) && attempts < 5) {
        newCode = genCode();
        attempts++;
      }
      const room = {
        code: newCode,
        host: { id: params.uid || 'host', name: params.name || 'Host', skin: params.skin || '', hp: 3, x: 50, ready: true, lastSeen: Date.now() },
        guest: null,
        events: [],
        ts: Date.now(),
        status: 'waiting'
      };
      await saveRoom(newCode, room);
      return res.status(200).json({ ok: true, code: newCode, role: 'host', room });
    }

    if (action === 'join') {
      if (!code) return res.status(400).json({ error: 'no code' });
      const room = await getRoom(code);
      if (!room) return res.status(404).json({ error: 'no room' });
      if (room.guest) return res.status(409).json({ error: 'room full' });
      room.guest = { id: params.uid || 'guest', name: params.name || 'Guest', skin: params.skin || '', hp: 3, x: 50, ready: true, lastSeen: Date.now() };
      room.status = 'playing';
      room.events.push({ type: 'start', ts: Date.now() });
      await saveRoom(code, room);
      return res.status(200).json({ ok: true, code, role: 'guest', room });
    }

    if (action === 'poll') {
      if (!code) return res.status(400).json({ error: 'no code' });
      const room = await getRoom(code);
      if (!room) return res.status(404).json({ error: 'no room' });
      // Update lastSeen
      const role = params.role;
      if (role === 'host' && room.host) room.host.lastSeen = Date.now();
      if (role === 'guest' && room.guest) room.guest.lastSeen = Date.now();
      await saveRoom(code, room);
      return res.status(200).json({ ok: true, room });
    }

    if (action === 'event') {
      if (!code) return res.status(400).json({ error: 'no code' });
      const room = await getRoom(code);
      if (!room) return res.status(404).json({ error: 'no room' });
      const ev = { type: params.evt, from: params.from, x: params.x, ts: Date.now() };
      room.events.push(ev);
      // Trim events to last 50
      if (room.events.length > 50) room.events = room.events.slice(-50);
      // Update HP if hit
      if (params.evt === 'hit') {
        const target = params.target === 'host' ? room.host : room.guest;
        if (target) target.hp = Math.max(0, (target.hp || 3) - 1);
        if (room.host && room.guest && (room.host.hp <= 0 || room.guest.hp <= 0)) {
          room.status = 'ended';
        }
      }
      // Update position
      if (params.evt === 'move') {
        const player = params.from === 'host' ? room.host : room.guest;
        if (player) player.x = parseFloat(params.x) || 50;
      }
      await saveRoom(code, room);
      return res.status(200).json({ ok: true, room });
    }

    if (action === 'leave') {
      if (!code) return res.status(400).json({ error: 'no code' });
      const room = await getRoom(code);
      if (!room) return res.status(404).json({ error: 'no room' });
      if (params.role === 'host') room.host = null;
      else room.guest = null;
      if (!room.host && !room.guest) {
        await kv.del('game:' + code);
      } else {
        room.status = 'ended';
        await saveRoom(code, room);
      }
      return res.status(200).json({ ok: true });
    }

    return res.status(400).json({ error: 'unknown action' });
  } catch (e) {
    console.error('Game endpoint error:', e);
    return res.status(500).json({ error: 'server error', detail: String(e) });
  }
};
