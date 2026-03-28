const CACHE_NAME = 'dailybot-v5';
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
        // Network first — mindig friss HTML
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

// ========== ÉRTESÍTÉSEK ==========
const NOTIF_MESSAGES = [
    "Ma is vár a napi üzeneted! ✨",
    "A robotod már izgatottan vár rád! 🤖",
    "Nyisd meg és kapd meg a mai motivációt! 💛",
    "Egy kis inspiráció vár rád ma! 🌟",
    "A mai üzeneted különleges — nézd meg! 🎁",
    "Ne feledd megnézni a napi üzeneted! 🔥",
    "A DailyBot robotod üzen neked! 💬",
    "Ma is készült neked valami szép! 🌈",
];

function getRandomNotifMsg() {
    return NOTIF_MESSAGES[Math.floor(Math.random() * NOTIF_MESSAGES.length)];
}

// Értesítés küldés — naponta max 1x (tag alapján)
function showDailyNotification() {
    const today = new Date().toDateString();
    return self.registration.showNotification('DailyBot 🤖', {
        body: getRandomNotifMsg(),
        icon: './icon/dailybot-icon.png',
        badge: './icon/dailybot-icon.png',
        tag: 'daily-' + today,
        renotify: false,
        requireInteraction: false,
        silent: false
    });
}

// Üzenet a főoldalról — csak ütemezés, nem küldünk értesítést azonnal
self.addEventListener('message', e => {
    if (e.data && e.data.type === 'schedule') {
        scheduleDaily();
    }
});

// setTimeout alapú ütemezés (működik amíg a SW él)
let scheduled = false;
function scheduleDaily() {
    if (scheduled) return;
    scheduled = true;

    const now = new Date();
    const next8am = new Date();
    next8am.setHours(8, 0, 0, 0);
    if (now >= next8am) {
        next8am.setDate(next8am.getDate() + 1);
    }
    const delay = next8am - now;

    setTimeout(() => {
        showDailyNotification();
        scheduled = false;
        scheduleDaily();
    }, delay);
}

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

// Periodic Background Sync (Android Chrome) — csak reggel 8-kor küld
self.addEventListener('periodicsync', e => {
    if (e.tag === 'daily-notification') {
        const hour = new Date().getHours();
        if (hour < 8 || hour > 9) return; // Csak 8-9 óra között
        e.waitUntil(
            self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cls => {
                const hasVisibleClient = cls.some(c => c.visibilityState === 'visible');
                if (hasVisibleClient) return; // App nyitva van
                return showDailyNotification();
            })
        );
    }
});
