const CACHE_NAME = 'dailybot-v2';
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

// Fetch — cache first
self.addEventListener('fetch', e => {
    e.respondWith(
        caches.match(e.request).then(r => r || fetch(e.request))
    );
});

// Napi értesítés ütemezés
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

// Értesítés küldés
function showDailyNotification() {
    const today = new Date().toDateString();
    // Ellenőrizzük, hogy ma küldtünk-e már
    return self.registration.getNotifications().then(() => {
        return self.registration.showNotification('DailyBot 🤖', {
            body: getRandomNotifMsg(),
            icon: './icon/dailybot-icon.png',
            badge: './icon/dailybot-icon.png',
            tag: 'daily-' + today, // Naponta 1 értesítés
            renotify: false,
            requireInteraction: false,
            silent: false
        });
    });
}

// Üzenet a főoldalról
self.addEventListener('message', e => {
    if (e.data && e.data.type === 'schedule') {
        scheduleDaily();
    }
});

// Napi időzítés
function scheduleDaily() {
    const now = new Date();
    const next8am = new Date();
    next8am.setHours(8, 0, 0, 0);
    if (now >= next8am) {
        next8am.setDate(next8am.getDate() + 1);
    }
    const delay = next8am - now;

    setTimeout(() => {
        showDailyNotification();
        // Következő nap újra
        setInterval(() => {
            showDailyNotification();
        }, 24 * 60 * 60 * 1000);
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

// Periodic Background Sync (ha támogatott — Android Chrome)
self.addEventListener('periodicsync', e => {
    if (e.tag === 'daily-notification') {
        e.waitUntil(showDailyNotification());
    }
});
