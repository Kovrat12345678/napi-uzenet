const CACHE_NAME = 'dailybot-v7';
const ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './icon/dailybot-icon.png'
];

// Install — cache fájlok
self.addEventListener('install', e => {
    e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
    self.skipWaiting();
});

// Activate — régi cache törlés
self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        )
    );
    self.clients.claim();
});

// Fetch — network first az index.html-hez (friss tartalom), cache first a többihez
self.addEventListener('fetch', e => {
    const url = new URL(e.request.url);
    if (url.pathname.endsWith('/') || url.pathname.endsWith('index.html')) {
        e.respondWith(
            fetch(e.request).then(r => {
                const clone = r.clone();
                caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
                return r;
            }).catch(() => caches.match(e.request))
        );
    } else {
        e.respondWith(
            caches.match(e.request).then(r => r || fetch(e.request))
        );
    }
});

// ========== PUSH ÉRTESÍTÉS (szerver küldi) ==========
self.addEventListener('push', e => {
    let data = { title: 'DailyBot 🤖', body: 'Ma is vár a napi üzeneted! ✨' };
    try {
        if (e.data) data = e.data.json();
    } catch (err) {}

    e.waitUntil(
        self.registration.showNotification(data.title, {
            body: data.body,
            icon: data.icon || './icon/dailybot-icon.png',
            badge: data.badge || './icon/dailybot-icon.png',
            tag: data.tag || 'daily',
            renotify: false,
            requireInteraction: false,
            silent: false
        })
    );
});

// Értesítésre kattintás → app megnyitás
self.addEventListener('notificationclick', e => {
    e.notification.close();
    e.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cls => {
            if (cls.length > 0) {
                return cls[0].focus();
            }
            return clients.openWindow('./');
        })
    );
});
