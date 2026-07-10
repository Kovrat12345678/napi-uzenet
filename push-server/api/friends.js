const { kv } = require('@vercel/kv');

module.exports = async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

    try {
        const { action } = req.body;

        // ========== REGISTER / UPDATE PROFILE ==========
        if (action === 'register') {
            const { id, name, level, gems, bots, activeSkin, nameColor } = req.body;
            if (!id || !name) return res.status(400).json({ error: 'id and name required' });

            const existing = await kv.get(`user:${id}`) || {};
            const profile = {
                id,
                name: name || existing.name || 'Unknown',
                level: level ?? existing.level ?? 1,
                gems: gems ?? existing.gems ?? 0,
                bots: bots ?? existing.bots ?? 0,
                activeSkin: activeSkin || existing.activeSkin || '',
                nameColor: nameColor || existing.nameColor || 'default',
                friends: existing.friends || [],
                updatedAt: Date.now()
            };
            await kv.set(`user:${id}`, profile);
            return res.status(200).json({ ok: true, profile });
        }

        // ========== LOOKUP USER ==========
        if (action === 'lookup') {
            const { id } = req.body;
            if (!id) return res.status(400).json({ error: 'id required' });
            const user = await kv.get(`user:${id}`);
            if (!user) return res.status(404).json({ error: 'not_found' });
            return res.status(200).json({ ok: true, user: { id: user.id, name: user.name, level: user.level, gems: user.gems, bots: user.bots, activeSkin: user.activeSkin, nameColor: user.nameColor } });
        }

        // ========== ADD FRIEND ==========
        if (action === 'add_friend') {
            const { myId, friendId } = req.body;
            if (!myId || !friendId) return res.status(400).json({ error: 'myId and friendId required' });
            if (myId === friendId) return res.status(400).json({ error: 'cannot_add_self' });

            const me = await kv.get(`user:${myId}`);
            const friend = await kv.get(`user:${friendId}`);
            if (!me) return res.status(404).json({ error: 'user_not_found' });
            if (!friend) return res.status(404).json({ error: 'friend_not_found' });

            // Bidirectional add
            if (!me.friends) me.friends = [];
            if (!friend.friends) friend.friends = [];

            if (!me.friends.includes(friendId)) me.friends.push(friendId);
            if (!friend.friends.includes(myId)) friend.friends.push(myId);

            await kv.set(`user:${myId}`, me);
            await kv.set(`user:${friendId}`, friend);

            return res.status(200).json({ ok: true, friend: { id: friend.id, name: friend.name, level: friend.level, gems: friend.gems, bots: friend.bots, activeSkin: friend.activeSkin, nameColor: friend.nameColor } });
        }

        // ========== REMOVE FRIEND ==========
        if (action === 'remove_friend') {
            const { myId, friendId } = req.body;
            if (!myId || !friendId) return res.status(400).json({ error: 'myId and friendId required' });

            const me = await kv.get(`user:${myId}`);
            const friend = await kv.get(`user:${friendId}`);

            if (me && me.friends) {
                me.friends = me.friends.filter(f => f !== friendId);
                await kv.set(`user:${myId}`, me);
            }
            if (friend && friend.friends) {
                friend.friends = friend.friends.filter(f => f !== myId);
                await kv.set(`user:${friendId}`, friend);
            }
            return res.status(200).json({ ok: true });
        }

        // ========== GET FRIENDS LIST ==========
        if (action === 'get_friends') {
            const { myId } = req.body;
            if (!myId) return res.status(400).json({ error: 'myId required' });

            const me = await kv.get(`user:${myId}`);
            if (!me) return res.status(404).json({ error: 'user_not_found' });

            const friends = [];
            for (const fId of (me.friends || [])) {
                const f = await kv.get(`user:${fId}`);
                if (f) {
                    // Check unread messages
                    const msgs = await kv.get(`msgs:${myId}:${fId}`) || [];
                    const unread = msgs.filter(m => !m.read && m.from === fId).length;
                    friends.push({
                        id: f.id, name: f.name, level: f.level, gems: f.gems,
                        bots: f.bots, activeSkin: f.activeSkin, nameColor: f.nameColor,
                        unread
                    });
                }
            }
            return res.status(200).json({ ok: true, friends });
        }

        // ========== SEND MESSAGE ==========
        if (action === 'send_message') {
            const { from, to, fromName, text } = req.body;
            if (!from || !to || !text) return res.status(400).json({ error: 'from, to, text required' });
            if (text.length > 200) return res.status(400).json({ error: 'message_too_long' });

            // Verify they are friends
            const sender = await kv.get(`user:${from}`);
            if (!sender || !(sender.friends || []).includes(to)) {
                return res.status(403).json({ error: 'not_friends' });
            }

            const msg = {
                from, fromName: fromName || sender.name || 'Unknown',
                to, text: text.trim(),
                timestamp: Date.now(), read: false
            };

            // Store in both directions for easy retrieval
            const key1 = `msgs:${from}:${to}`;
            const key2 = `msgs:${to}:${from}`;

            const msgs1 = await kv.get(key1) || [];
            const msgs2 = await kv.get(key2) || [];

            msgs1.push({ ...msg, read: true }); // Sender sees their own as read
            msgs2.push(msg);

            // Keep last 50 messages per conversation
            if (msgs1.length > 50) msgs1.splice(0, msgs1.length - 50);
            if (msgs2.length > 50) msgs2.splice(0, msgs2.length - 50);

            await kv.set(key1, msgs1);
            await kv.set(key2, msgs2);

            return res.status(200).json({ ok: true, msg });
        }

        // ========== GET MESSAGES ==========
        if (action === 'get_messages') {
            const { myId, friendId } = req.body;
            if (!myId || !friendId) return res.status(400).json({ error: 'myId and friendId required' });

            const msgs = await kv.get(`msgs:${myId}:${friendId}`) || [];
            return res.status(200).json({ ok: true, messages: msgs });
        }

        // ========== MARK READ ==========
        if (action === 'mark_read') {
            const { myId, friendId } = req.body;
            if (!myId || !friendId) return res.status(400).json({ error: 'myId and friendId required' });

            const key = `msgs:${myId}:${friendId}`;
            const msgs = await kv.get(key) || [];
            msgs.forEach(m => { if (m.from === friendId) m.read = true; });
            await kv.set(key, msgs);

            return res.status(200).json({ ok: true });
        }

        return res.status(400).json({ error: 'unknown_action' });

    } catch (err) {
        console.error('Friends API error:', err);
        return res.status(500).json({ error: 'server_error' });
    }
};
