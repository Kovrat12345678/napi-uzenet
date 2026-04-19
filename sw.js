const CACHE_NAME = 'dailybot-v34';
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

// Activate — régi cache törlés + azonnal átveszi az irányítást
self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        )
    );
    self.clients.claim();
    // Aktiválás után azonnal ütemezzük az értesítéseket
    scheduleMorningNotification();
});

// Fetch — network first az index.html-hez, cache first a többihez
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

// ========== ÉRTESÍTÉSEK ==========
const NOTIF_MESSAGES = [
    "Ma is vár a napi üzeneted! ✨",
    "A robotod már izgatottan vár rád! 🤖",
    "Nyisd meg és kapd meg a mai gondolatot! 💛",
    "Egy kis inspiráció vár rád ma! 🌟",
    "A mai üzeneted különleges — nézd meg! 🎁",
    "Ne feledd megnézni a napi üzeneted! 🔥",
    "A DailyBot robotod üzen neked! 💬",
    "Ma is készült neked valami szép! 🌈",
];

function getRandomNotifMsg() {
    return NOTIF_MESSAGES[Math.floor(Math.random() * NOTIF_MESSAGES.length)];
}

// Értesítés küldés
function showDailyNotification() {
    return self.registration.showNotification('DailyBot 🤖', {
        body: getRandomNotifMsg(),
        icon: './icon/dailybot-icon.png',
        badge: './icon/dailybot-icon.png',
        tag: 'daily-' + new Date().toDateString(),
        renotify: true,
        requireInteraction: false,
        silent: false
    });
}

// Reggel 6:00 értesítés ütemezése — ismétlődő
function scheduleMorningNotification() {
    const now = new Date();
    const target = new Date(now);
    target.setHours(6, 0, 0, 0);

    // Ha ma már elmúlt 6 óra, holnapra ütemezünk
    if (target <= now) {
        target.setDate(target.getDate() + 1);
    }

    const delay = target - now;

    setTimeout(() => {
        showDailyNotification();
        // Következő napra újra ütemez (24 óra múlva)
        setTimeout(() => {
            scheduleMorningNotification();
        }, 1000); // 1 mp múlva újra ütemez a következő napra
    }, delay);
}

// Üzenet a főoldalról
self.addEventListener('message', e => {
    if (e.data && e.data.type === 'schedule') {
        scheduleMorningNotification();
    }
    // Azonnali aktiválás ha az app kéri (frissítés után)
    if (e.data && e.data.type === 'skipWaiting') {
        self.skipWaiting();
    }
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

// Periodic Background Sync (Android Chrome) — emlékeztető ha nem nyitottad meg
self.addEventListener('periodicsync', e => {
    if (e.tag === 'daily-notification') {
        e.waitUntil(
            self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(cls => {
                const hasVisibleClient = cls.some(c => c.visibilityState === 'visible');
                if (hasVisibleClient) return; // App nyitva van, nem kell értesítés
                return showDailyNotification();
            })
        );
    }
});
