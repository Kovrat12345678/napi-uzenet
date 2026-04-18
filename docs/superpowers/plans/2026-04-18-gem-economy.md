# Gém-gazdaság Implementációs Terv

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bevezetni egy gém-alapú loot gazdaságot (Spin/DailyBox/DailyPouch), átalakítani a shopot gémes árazásra, eltávolítani a Sárkány-specifikus ikon/zene override-ot, és új halk ambient app zenét hozzáadni.

**Architecture:** Minden változtatás az `index.html` fájlba kerül (3803 soros single-file PWA). Új localStorage kulcsok a gém/napi loot állapot kezelésére. Új CSS overlay-ek a box/pouch UX-hez. Web Audio API a dragon zene helyett új ambient loopra. A meglévő `msgDay()` (reggel 6) logika kezeli a napi reseteket.

**Tech Stack:** Vanilla JS, CSS3, Web Audio API, localStorage, Service Worker (cache bump).

**Verifikáció**: A projektben nincs automatizált teszt keretrendszer. Minden task végén **browser-teszt** lépés: nyissa meg `http://localhost/napi%20üzenet%20hivatalos/`, végezze el a leírt interakciót, ellenőrizze a DevTools Application → Local Storage-ben a kulcsokat. Commit kézzel a task végén.

**Fájl struktúra:**
- `index.html` — minden kódváltozás ide
- `sw.js` — csak cache verzió bump a legvégén
- `icon/` — változatlan (dragon-icon.svg marad a jövőbeli Sárkány Hétre, csak nem használja az ikon override)
- `docs/superpowers/specs/2026-04-18-gem-economy-design.md` — referencia spec

---

### Task 1: Sárkány ikon override eltávolítása

**Cél**: Az app ikon mindig a `icon/dailybot-icon.png`, nincs dinamikus Sárkány Hét SVG→PNG konverzió.

**Files:**
- Modify: `C:/xampp/htdocs/napi üzenet hivatalos/index.html`

- [ ] **Step 1: Keresd meg a dragon icon override kódot**

Grep keresés: `dragon-icon.svg` és `canvas.toDataURL` minták az `index.html`-ben. Keresd meg azt a blokkot ami az SVG-t betölti egy `Image`-be, canvas-ra rajzolja, és a favicon/apple-touch-icon/manifest href-jeit cseréli.

- [ ] **Step 2: Töröld a dragon icon override blokkot**

Távolítsd el a teljes blokkot. A favicon és apple-touch-icon link tag-ek eredeti `href="icon/dailybot-icon.png"` értéke maradjon a HTML head-ben.

Ha `manifest.json` dinamikus blob URL override is van (JavaScript-ben írja át `Link[rel=manifest]` href-jét), azt is töröld.

- [ ] **Step 3: Böngésző teszt — Sárkány Hét alatt is eredeti ikon**

Nyisd meg az appot. DevTools → Application → Manifest: az ikon `icon/dailybot-icon.png`. `<link rel="icon">` szintén. A böngésző tabján nem a sárkány ikon látszik (ha Sárkány Hét dátum aktív volt, most is eredeti).

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "Remove dragon week icon override — always use dailybot-icon.png"
```

---

### Task 2: Sárkány zene eltávolítása

**Cél**: A Sárkány Hét alatti Web Audio API háttérzene (om dron, pentatonikus fuvola, tibeti harang, reverb) teljesen törlődik.

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Keresd meg a dragon music kódot**

Grep: `AudioContext`, `convolver`, `om` (drón), `flute`, `bell`, `tibetan`. Általában egy `initDragonMusic()` vagy `playDragonAmbient()` függvényben. A CLAUDE.md szerint: "Mély om drón (55 Hz szinusz), kvint felhang (E2), szél susogás (szűrt fehérzaj), ősi fuvola (A-moll pentatonikus), tibeti harang".

- [ ] **Step 2: Töröld a teljes dragon music inicializálást és scheduler-t**

Az `initDragonMusic()` és minden ami meghívja (user gesture listener, Sárkány Hét trigger) — teljes törlés. Beleértve az `AudioContext`, `ConvolverNode`, `OscillatorNode`, `BiquadFilterNode` példányok létrehozását és a `setTimeout`/`setInterval` ütemezőket.

Hagyd meg a `sárkány skin tap → tűzokádás hang` kódot, ha külön van (ez a skin reakció, nem a háttérzene).

- [ ] **Step 3: Böngésző teszt — nincs hang**

Nyisd meg az appot. Az interakció (robot megnyomás) után ne szóljon ambient zene. DevTools → Console nincs AudioContext warning. (Még nem raktunk be új zenét — itt csend kell.)

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "Remove dragon week ambient music (Web Audio om/flute/bell)"
```

---

### Task 3: Gém pénznem — storage helperek

**Cél**: Alap gém kezelő függvények a localStorage-ben.

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Add helper függvények a `getOwned()` közelébe (index.html ~2994. sor)**

```javascript
function getGems(){
    const v = parseInt(localStorage.getItem('nu_gems'), 10);
    return isNaN(v) ? 0 : v;
}
function setGems(n){
    localStorage.setItem('nu_gems', String(Math.max(0, Math.floor(n))));
    updateGemUI();
}
function addGems(n){ setGems(getGems() + n); }
function spendGems(n){
    const cur = getGems();
    if(cur < n) return false;
    setGems(cur - n);
    return true;
}
function initGems(){
    if(localStorage.getItem('nu_gems') === null){
        localStorage.setItem('nu_gems', '50');
    }
}
function updateGemUI(){
    document.querySelectorAll('[data-gem-display]').forEach(el => {
        el.textContent = getGems();
    });
}
```

- [ ] **Step 2: Hívd meg `initGems()`-et az app init kódban**

Az app bootstrapping résznél (ahol `nu_uid` inicializálódik ~2411. sor közelében), hívd meg `initGems()`-et.

- [ ] **Step 3: Böngésző teszt — gém kulcs létezik**

Nyisd meg az appot friss localStorage-dzsal (Application → Clear site data, majd reload). DevTools → Application → Local Storage: `nu_gems = 50` legyen.

Konzolba: `getGems()` → 50. `addGems(10)` → majd `getGems()` → 60. `spendGems(5)` → `true`, `getGems()` → 55. `spendGems(1000)` → `false`, `getGems()` → 55.

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "Add gem currency storage helpers (nu_gems, default 50)"
```

---

### Task 4: Gém megjelenítő UI a főképernyőn és a shopban

**Cél**: Gém egyenleg vizuálisan látszik két helyen.

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Shop headerbe gém badge**

A shop header (`.shop-header` ~1782. sor) jobb oldalára, a 🔄 és ✕ gombok közé:

```html
<div class="shop-gems">💎 <span data-gem-display>0</span></div>
```

CSS (a shop header CSS-ek közé):

```css
.shop-gems{
    display:inline-flex;align-items:center;gap:4px;
    background:rgba(251,191,36,.15);border:1px solid rgba(251,191,36,.4);
    color:#fbbf24;font-weight:800;font-size:14px;
    padding:6px 12px;border-radius:12px;margin-right:8px;
}
```

- [ ] **Step 2: Főképernyős gém számláló**

A streak számláló (`.streak` vagy hasonló) mellé, egy horizontális sorba:

```html
<div class="gem-badge" id="gemBadge">💎 <span data-gem-display>0</span></div>
```

```css
.gem-badge{
    display:inline-flex;align-items:center;gap:4px;
    background:rgba(251,191,36,.12);border:1px solid rgba(251,191,36,.3);
    color:#fbbf24;font-weight:700;font-size:13px;
    padding:5px 10px;border-radius:20px;cursor:pointer;
}
.gem-badge:active{transform:scale(.95)}
```

Kattintásra nyissa a shopot:

```javascript
document.getElementById('gemBadge').addEventListener('click', () => {
    document.getElementById('skinClose').parentElement.parentElement.classList.add('open');
});
```

(A pontos shop panel osztály/ID a helyi kódból kell — `shopPanel.classList.add('open')`.)

- [ ] **Step 3: Hívd meg `updateGemUI()`-t induláskor**

Az app boot végén (DOMContentLoaded vagy fő init függvény végén) hívd meg `updateGemUI()`-t.

- [ ] **Step 4: Böngésző teszt**

Reload. Főképernyőn látszik `💎 50`. Shop megnyitva: header jobb oldalán `💎 50`. Konzol: `addGems(5)` → mindkét helyen `💎 55`.

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "Show gem balance on main screen and shop header"
```

---

### Task 5: Tárgy árak + shop vásárlási folyamat

**Cél**: Minden skin/háttér/aura gémért vásárolható. Meglévő tulajdonlást megtartja.

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Add `ITEM_PRICES` objektum (renderShop előtt)**

A spec (3.1) alapján:

```javascript
const ITEM_PRICES = {
    // Skinek
    'skin-tulip': 100, 'skin-sakura': 100, 'skin-graffiti': 100,
    'skin-stealth': 200, 'skin-galaxy': 200, 'skin-fire': 200, 'skin-gamer': 200,
    'skin-golden': 400, 'skin-diamond': 400, 'skin-glass': 400, 'skin-horse': 400,
    'skin-rainbow': 600,
    // Háttér
    'bg-tulip': 80, 'bg-sakura': 80, 'bg-graffiti': 80,
    'bg-galaxy': 150, 'bg-stealth': 150, 'bg-fire': 150,
    'bg-gold': 300, 'bg-diamond': 300, 'bg-glass': 300,
    'bg-rainbow': 500, 'bg-gamer': 500,
    // Aurák
    'aura-tulip': 50, 'aura-sakura': 50,
    'aura-fire': 120, 'aura-glitch': 120,
    'aura-holy': 250, 'aura-rgb': 250,
    'aura-diamond': 400,
};
function getPrice(id){ return ITEM_PRICES[id] || 0; }
```

**Megjegyzés**: a pontos `id`-kat a `SKINS`, `BGS`, `AURAS` tömbökből kell venni (a fájlban már léteznek). Ha eltér a fenti listától, igazítsd azokhoz. Ingyenes tárgyak (Alap, Napszak, Nincs, Sárkány) nem szerepelnek az `ITEM_PRICES`-ben.

- [ ] **Step 2: Módosítsd a `renderShop()` függvényt (~3301. sor)**

A jelenleg mindig `buyItem(s.id)` hívást (ami automatikusan "feloldja") cseréld le feltételes vásárlási logikára:

```javascript
const price = getPrice(s.id);
const owned = getOwned().includes(s.id) || !s.id;
const isDragonLocked = s.id === 'dragon' && !owned; // meglévő rejtvény logika
const isActive = cfg.active === s.id;

let statusHtml = '';
if(isActive){
    statusHtml = '<span class="shop-item-status equipped">✓ Aktív</span>';
} else if(owned){
    statusHtml = '<span class="shop-item-status owned">Kiválasztás</span>';
} else if(isDragonLocked){
    statusHtml = '<span class="shop-item-status lock-tag">🔒 Rejtvény</span>';
} else if(price > 0){
    statusHtml = `<button class="buy-tag" data-buy="${s.id}" data-price="${price}">💎 ${price}</button>`;
} else {
    statusHtml = '<span class="shop-item-status">Ingyenes</span>';
}
```

Az `el.addEventListener('click', ...)` logika: csak `owned && !isActive` esetén aktiváljon. A `buy-tag` gombra külön listener (lásd következő step).

- [ ] **Step 3: Vásárlási listener + megerősítő modal**

```javascript
document.body.addEventListener('click', (e) => {
    const btn = e.target.closest('.buy-tag');
    if(!btn) return;
    e.stopPropagation();
    const id = btn.dataset.buy;
    const price = parseInt(btn.dataset.price, 10);
    if(!confirm(`Megveszed ezt ${price} gémért? Jelenlegi egyenleg: ${getGems()} gém.`)) return;
    if(!spendGems(price)){
        alert('Nincs elég gém!');
        return;
    }
    buyItem(id);
    if(typeof renderShop === 'function') renderShop();
    // opcionális: konfetti / toast
});
```

- [ ] **Step 4: Migráció — meglévő felhasználók tárgyai maradnak**

Már megoldott: `getOwned()` olvassa az `nu_owned`-ot, semmit nem kell törölni. Ingyenes default tárgyak (`skin-alap`, `bg-napszak`, `aura-none`) automatikusan elérhetők a price=0 és owned ellenőrzések miatt.

Biztonsági check: ha `nu_owned` nem létezik, az app ne crash-eljen (már kezelt: `getOwned()` üres tömböt ad).

- [ ] **Step 5: Böngésző teszt**

1. Új felhasználó (clear site data): `nu_gems=50`, shopban minden gémes tárgy "💎 X" gombbal. Alap skin aktív.
2. Olcsó tárgy (50 gém aura) vásárlás: megerősítés → siker → gém 50→0, aura feloldva.
3. Drága tárgy próba: `💎 600` Rainbow skin → "Nincs elég gém" → gém marad 0.
4. Meglévő user szimuláció: `localStorage.setItem('nu_owned', JSON.stringify(['skin-galaxy']))`; reload → Galaxy skin "Kiválasztás" státusszal (nincs ár), kattintásra aktiválható.

- [ ] **Step 6: Commit**

```bash
git add index.html
git commit -m "Gem-priced shop items with purchase flow and migration"
```

---

### Task 6: Daily Spin — un-gate + gém nyeremények + napi limit

**Cél**: A jelenlegi Dragon Spin mindig látszik, csak gém nyeremények, napi 1x ingyen.

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Dragon Spin section mindig látszik**

Töröld a Sárkány Hét gate-et. Keresd meg:

```javascript
const section = document.getElementById('dragonSpinSection');
// ... Sárkány Hét check, section.style.display = 'none'/'block'
```

Cseréld: `section.style.display = 'block'` (vagy töröld az inline `style="display:none"`-t az HTML-ben és ne állítsd futásidőben).

Címke változás az HTML-ben (~1805. sor):

```html
<div class="shop-section-title">🎰 Napi Spin</div>
<!-- ... -->
<button class="dragon-spin-btn" id="dragonSpinBtn">🎰 Pörgesd meg!</button>
```

- [ ] **Step 2: Nyeremény táblázat átírása — csak gém**

Keresd meg a prize tömböt (~3509. sor környékén, korábban `prize.text`, `prize.emoji`). Cseréld:

```javascript
const SPIN_PRIZES = [
    {gems: 5, label: '5'},
    {gems: 10, label: '10'},
    {gems: 10, label: '10'},
    {gems: 15, label: '15'},
    {gems: 20, label: '20'},
    {gems: 25, label: '25'},
    {gems: 5, label: '5'},
    {gems: 150, label: '150 ✨'},
];
```

A canvas rajzolásnál a szegmens szövege: `💎 ${prize.label}`. A szín skála maradjon (arany témájú).

- [ ] **Step 3: Napi limit átállítás `nu_spin_day`-re**

Jelenleg `nu_dspin` kulcs használatos. Új logika:

```javascript
const spinKey = 'nu_spin_day';
const today = td(); // msgDay().toDateString()
const lastSpin = localStorage.getItem(spinKey);
const canSpin = lastSpin !== today;

// Migráció: ha van régi nu_dspin és nu_dspin_last, egyszeri átmentés
if(!lastSpin && localStorage.getItem('nu_dspin')){
    // nem migráljuk az értéket — új rendszer, kapjon egy spint
    localStorage.removeItem('nu_dspin');
    localStorage.removeItem('nu_dspin_last');
}

spinBtn.disabled = !canSpin;
if(!canSpin) spinBtn.textContent = '🎰 Gyere vissza holnap 6-kor!';
```

Spin után:

```javascript
localStorage.setItem(spinKey, today);
addGems(prize.gems);
resultEl.textContent = `Nyertél: 💎 ${prize.gems} gém!`;
```

Töröld a korábbi `nu_dspin_last` referenciákat.

- [ ] **Step 4: Sárkány Hét-es Spin bonusz logika törlése**

Ha volt "Tűzokádás", "Jégleheleet", "Arany eső", "Dupla streak" stb. spin effekt — töröld a megfelelő `if(prize.type === 'xxx')` ágakat és az összes vizuális effektet. A spin már csak gémet ad.

- [ ] **Step 5: Böngésző teszt**

1. Shop: Daily Spin mindig látszik, sárga/arany "Pörgesd meg!" gomb.
2. Pörgesd: canvas animál, nyer valami gémet, főképernyőn és shop headerben a gém nő.
3. Újbóli pörgés próba: gomb tiltva, "Gyere vissza holnap 6-kor!".
4. LocalStorage: `nu_spin_day = "Sat Apr 18 2026"` (vagy aktuális).
5. `nu_spin_day` manuális törlés → reload → újra pörgethető.

- [ ] **Step 6: Commit**

```bash
git add index.html
git commit -m "Daily Spin rework — always visible, gem prizes, 1/day limit"
```

---

### Task 7: DailyBox — overlay HTML és CSS

**Cél**: Full-screen overlay struktúra, animált doboz, nyeremény kártya. Logika még üres, csak a skeleton.

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Overlay HTML a body végére**

```html
<div id="dailyBoxOverlay" class="db-overlay" style="display:none">
    <div class="db-bg"></div>
    <div class="db-content">
        <div class="db-prompt" id="dbPrompt">Koppints a dobozra!</div>
        <div class="db-box" id="dbBox">🎁</div>
        <div class="db-number" id="dbNumber">1</div>
        <div class="db-prize" id="dbPrize" style="display:none">
            <div class="db-prize-icon" id="dbPrizeIcon"></div>
            <div class="db-prize-name" id="dbPrizeName"></div>
        </div>
        <button class="db-close-btn" id="dbCloseBtn" style="display:none">Szuper!</button>
    </div>
</div>
```

- [ ] **Step 2: Overlay CSS**

```css
.db-overlay{
    position:fixed;inset:0;z-index:9999;
    display:flex;align-items:center;justify-content:center;
    background:radial-gradient(circle at center, rgba(30,20,60,.95), rgba(0,0,0,.98));
    animation:dbFadeIn .3s ease;
}
@keyframes dbFadeIn{from{opacity:0}to{opacity:1}}
.db-bg{position:absolute;inset:0;background:
    radial-gradient(circle at 20% 30%, rgba(251,191,36,.1), transparent 40%),
    radial-gradient(circle at 80% 70%, rgba(167,139,250,.1), transparent 40%);
    animation:dbPulse 4s ease-in-out infinite;}
@keyframes dbPulse{0%,100%{opacity:.6}50%{opacity:1}}
.db-content{position:relative;display:flex;flex-direction:column;align-items:center;gap:24px;padding:40px}
.db-prompt{font-size:20px;font-weight:700;color:#fff;text-shadow:0 2px 12px rgba(251,191,36,.4);text-align:center}
.db-box{
    font-size:140px;cursor:pointer;
    animation:dbFloat 2s ease-in-out infinite;
    filter:drop-shadow(0 20px 40px rgba(251,191,36,.5));
    transition:transform .3s;
}
.db-box:active{transform:scale(.92)}
.db-box.opening{animation:dbOpen .6s ease-out forwards}
@keyframes dbFloat{0%,100%{transform:translateY(0) rotate(-3deg)}50%{transform:translateY(-10px) rotate(3deg)}}
@keyframes dbOpen{
    0%{transform:scale(1) rotate(0)}
    30%{transform:scale(1.3) rotate(-15deg)}
    60%{transform:scale(1.2) rotate(15deg)}
    100%{transform:scale(0);opacity:0}
}
.db-number{
    font-size:72px;font-weight:900;color:#fbbf24;
    text-shadow:0 0 30px rgba(251,191,36,.8);
    transition:transform .4s, color .4s;
}
.db-number.switching{animation:dbSwitch .6s ease forwards}
@keyframes dbSwitch{
    0%{transform:scale(1)}50%{transform:scale(1.4) rotate(360deg);color:#f472b6}
    100%{transform:scale(1);color:#fbbf24}
}
.db-prize{
    background:rgba(255,255,255,.1);backdrop-filter:blur(10px);
    border:2px solid rgba(251,191,36,.4);border-radius:20px;
    padding:24px 36px;display:flex;flex-direction:column;align-items:center;gap:8px;
    animation:dbPrizeIn .5s ease-out;min-width:220px;
}
@keyframes dbPrizeIn{from{transform:translateY(20px) scale(.8);opacity:0}to{transform:translateY(0) scale(1);opacity:1}}
.db-prize-icon{font-size:72px}
.db-prize-name{font-size:18px;font-weight:800;color:#fff}
.db-close-btn{
    padding:14px 32px;background:linear-gradient(135deg,#fbbf24,#f59e0b);
    color:#1a1a2e;font-weight:800;font-size:16px;border:none;border-radius:14px;
    cursor:pointer;box-shadow:0 8px 24px rgba(251,191,36,.4);
}
.db-close-btn:active{transform:scale(.95)}
```

- [ ] **Step 3: Böngésző teszt**

Konzol: `document.getElementById('dailyBoxOverlay').style.display='flex'`. Látod: sötét overlay, "Koppints a dobozra!" felirat, animált 🎁 emoji, nagy "1" szám. Konzol: `document.getElementById('dailyBoxOverlay').style.display='none'` bezárja.

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "DailyBox overlay HTML and CSS skeleton"
```

---

### Task 8: DailyBox — logika, loot és 1/2 mechanika

**Cél**: Napi 2 box, véletlen 1/2 szám, koppintás animáció, loot kiosztás.

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Napi box jogosultság helperek**

```javascript
function boxesRemaining(){
    const today = td();
    const day = localStorage.getItem('nu_box_day');
    if(day !== today){
        localStorage.setItem('nu_box_day', today);
        localStorage.setItem('nu_box_count', '2');
        return 2;
    }
    return parseInt(localStorage.getItem('nu_box_count') || '0', 10);
}
function consumeBox(){
    const n = boxesRemaining();
    if(n <= 0) return false;
    localStorage.setItem('nu_box_count', String(n - 1));
    return true;
}
```

- [ ] **Step 2: Loot tábla függvények**

```javascript
function allBuyableItems(){
    // SKINS + BGS + AURAS tömbökből, csak azok ahol van price
    const all = [];
    [SKINS, BGS, AURAS].forEach(list => list.forEach(s => {
        if(s.id && ITEM_PRICES[s.id]) all.push(s);
    }));
    return all;
}
function notOwnedByTier(minPrice, maxPrice){
    const owned = getOwned();
    return allBuyableItems().filter(s =>
        !owned.includes(s.id) &&
        ITEM_PRICES[s.id] >= minPrice &&
        ITEM_PRICES[s.id] <= maxPrice
    );
}
function pickRandom(arr){ return arr[Math.floor(Math.random() * arr.length)]; }

function rollNormalPrize(){
    const r = Math.random();
    if(r < 0.70){
        const gems = pickRandom([10, 20, 30]);
        return {type:'gems', gems, icon:'💎', name:`${gems} gém`};
    }
    if(r < 0.95){
        const pool = notOwnedByTier(1, 100);
        if(pool.length){
            const item = pickRandom(pool);
            return {type:'item', id:item.id, icon:item.icon || '✨', name:item.name};
        }
        return {type:'gems', gems:30, icon:'💎', name:'30 gém'};
    }
    const pool = notOwnedByTier(101, 250);
    if(pool.length){
        const item = pickRandom(pool);
        return {type:'item', id:item.id, icon:item.icon || '⭐', name:item.name};
    }
    return {type:'gems', gems:50, icon:'💎', name:'50 gém'};
}

function rollSuperPrize(){
    if(Math.random() < 0.60){
        const pool = notOwnedByTier(300, 9999);
        if(pool.length){
            const item = pickRandom(pool);
            return {type:'item', id:item.id, icon:item.icon || '🌟', name:item.name};
        }
    }
    const gems = pickRandom([150, 200, 300]);
    return {type:'gems', gems, icon:'💎', name:`${gems} gém`};
}

function applyPrize(p){
    if(p.type === 'gems') addGems(p.gems);
    else if(p.type === 'item') buyItem(p.id);
}
```

- [ ] **Step 3: Box nyitás folyamat**

```javascript
function openDailyBox(){
    if(!consumeBox()){
        alert('Ma már nincs több dobozod. Gyere vissza holnap 6-kor!');
        return;
    }
    const overlay = document.getElementById('dailyBoxOverlay');
    const box = document.getElementById('dbBox');
    const numEl = document.getElementById('dbNumber');
    const prizeEl = document.getElementById('dbPrize');
    const closeBtn = document.getElementById('dbCloseBtn');
    const promptEl = document.getElementById('dbPrompt');

    const isLucky = Math.random() < 0.25; // 25% 2-es
    let remainingPrizes = isLucky ? 2 : 1;

    // Reset UI
    box.className = 'db-box';
    box.textContent = '🎁';
    box.style.display = 'block';
    numEl.textContent = String(remainingPrizes);
    numEl.className = 'db-number';
    prizeEl.style.display = 'none';
    closeBtn.style.display = 'none';
    promptEl.textContent = 'Koppints a dobozra!';
    overlay.style.display = 'flex';

    const onTap = () => {
        box.removeEventListener('click', onTap);
        box.classList.add('opening');
        setTimeout(() => {
            box.style.display = 'none';
            const isSuper = (isLucky && remainingPrizes === 1); // második díj a lucky boxból
            const prize = isSuper ? rollSuperPrize() : rollNormalPrize();
            applyPrize(prize);
            document.getElementById('dbPrizeIcon').textContent = prize.icon;
            document.getElementById('dbPrizeName').textContent = prize.name;
            prizeEl.style.display = 'flex';

            remainingPrizes--;
            if(remainingPrizes <= 0){
                promptEl.textContent = isSuper ? 'Hatalmas nyeremény!' : 'Szuper!';
                closeBtn.style.display = 'inline-block';
            } else {
                // 2 → 1 switch
                setTimeout(() => {
                    numEl.classList.add('switching');
                    numEl.textContent = '1';
                    setTimeout(() => numEl.classList.remove('switching'), 600);
                    prizeEl.style.display = 'none';
                    box.style.display = 'block';
                    box.className = 'db-box';
                    box.textContent = '🎁';
                    promptEl.textContent = 'Még egy vár rád! Koppints!';
                    box.addEventListener('click', onTap);
                }, 1600);
            }
        }, 600);
    };
    box.addEventListener('click', onTap);

    closeBtn.onclick = () => {
        overlay.style.display = 'none';
        updateBoxBadge();
        if(typeof renderShop === 'function') renderShop();
    };
}
```

- [ ] **Step 4: Böngésző teszt**

Konzol: `openDailyBox()` hívás.
- Overlay megnyílik, "1" vagy "2" szám. Koppints a dobozra → animáció, nyeremény kártya.
- Ha 2-es volt: 1.6mp múlva visszavált 1-re, újra nyomhatsz → második nyeremény (drágább).
- "Szuper!" gomb → overlay bezár.
- Localstorage: `nu_box_count` eggyel csökken minden hívásnál.
- 3. hívás: alert "Ma már nincs több dobozod".
- `nu_gems` nő (gém nyereménynél), `nu_owned` nő (item nyereménynél).

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "DailyBox logic with 1/2 mechanic and loot tables"
```

---

### Task 9: DailyPouch — overlay + loot + vásárlás

**Cél**: Napi 1 ingyen pouch, vásárolható 30 gémért, csak gém loot.

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Pouch overlay HTML (body végére)**

```html
<div id="dailyPouchOverlay" class="dp-overlay" style="display:none">
    <div class="dp-content">
        <div class="dp-pouch" id="dpPouch">👝</div>
        <div class="dp-reward" id="dpReward" style="display:none">💎 <span id="dpGems">0</span></div>
        <button class="dp-close" id="dpClose" style="display:none">Köszönöm!</button>
    </div>
</div>
```

- [ ] **Step 2: Pouch CSS**

```css
.dp-overlay{
    position:fixed;inset:0;z-index:9998;background:rgba(0,0,0,.85);
    display:flex;align-items:center;justify-content:center;animation:dbFadeIn .3s ease;
}
.dp-content{
    background:linear-gradient(135deg,rgba(60,40,100,.95),rgba(30,20,60,.95));
    border:1px solid rgba(251,191,36,.3);border-radius:24px;
    padding:40px;display:flex;flex-direction:column;align-items:center;gap:20px;
    box-shadow:0 20px 60px rgba(251,191,36,.2);min-width:280px;
}
.dp-pouch{font-size:110px;cursor:pointer;animation:dpShake 1.2s ease infinite;transition:transform .2s}
.dp-pouch:active{transform:scale(.9)}
.dp-pouch.opening{animation:dpBurst .6s ease-out forwards}
@keyframes dpShake{0%,100%{transform:rotate(-5deg)}50%{transform:rotate(5deg)}}
@keyframes dpBurst{
    0%{transform:scale(1)}50%{transform:scale(1.4) rotate(20deg)}
    100%{transform:scale(0) rotate(-30deg);opacity:0}
}
.dp-reward{
    font-size:48px;font-weight:900;color:#fbbf24;
    text-shadow:0 0 24px rgba(251,191,36,.7);
    animation:dbPrizeIn .5s ease;
}
.dp-close{
    padding:12px 24px;background:linear-gradient(135deg,#fbbf24,#f59e0b);
    color:#1a1a2e;font-weight:800;border:none;border-radius:12px;cursor:pointer;
}
.dp-close:active{transform:scale(.95)}
```

- [ ] **Step 3: Pouch logika**

```javascript
function pouchFreeAvailable(){
    const today = td();
    const day = localStorage.getItem('nu_pouch_day');
    if(day !== today){
        localStorage.setItem('nu_pouch_day', today);
        localStorage.setItem('nu_pouch_free', 'true');
        return true;
    }
    return localStorage.getItem('nu_pouch_free') === 'true';
}
function consumeFreePouch(){
    pouchFreeAvailable(); // biztos hogy a day key frissül
    if(localStorage.getItem('nu_pouch_free') !== 'true') return false;
    localStorage.setItem('nu_pouch_free', 'false');
    return true;
}
function openPouch(){
    const overlay = document.getElementById('dailyPouchOverlay');
    const pouch = document.getElementById('dpPouch');
    const reward = document.getElementById('dpReward');
    const gemsEl = document.getElementById('dpGems');
    const closeBtn = document.getElementById('dpClose');

    pouch.className = 'dp-pouch';
    pouch.style.display = 'block';
    reward.style.display = 'none';
    closeBtn.style.display = 'none';
    overlay.style.display = 'flex';

    const amount = pickRandom([5, 10, 15, 20, 25]);
    pouch.onclick = () => {
        pouch.classList.add('opening');
        setTimeout(() => {
            pouch.style.display = 'none';
            gemsEl.textContent = amount;
            reward.style.display = 'block';
            closeBtn.style.display = 'inline-block';
            addGems(amount);
        }, 600);
    };
    closeBtn.onclick = () => {
        overlay.style.display = 'none';
        updatePouchBadge();
    };
}
function tryOpenFreePouch(){
    if(!consumeFreePouch()){
        if(confirm('Ma már felhasználtad az ingyenes pouchodat. Veszel egyet 30 gémért?')){
            buyPouch();
        }
        return;
    }
    openPouch();
}
function buyPouch(){
    if(!spendGems(30)){
        alert('Nincs elég gém (30 gém kell)!');
        return;
    }
    openPouch();
}
```

- [ ] **Step 4: Shopban Pouch vásárló gomb**

A `renderShop` előtt egy új section (HTML):

```html
<div class="shop-section" id="pouchBuySection">
    <div class="shop-section-title">👝 Daily Pouch</div>
    <div style="padding:0 22px">
        <button id="pouchBuyBtn" class="buy-tag" style="width:100%;padding:12px;font-size:14px">
            Vásárolj Pouch-ot — 💎 30
        </button>
    </div>
</div>
```

JavaScript:

```javascript
document.getElementById('pouchBuyBtn').addEventListener('click', () => {
    if(confirm('Vásárolsz egy Pouch-ot 30 gémért?')) buyPouch();
});
```

- [ ] **Step 5: Böngésző teszt**

Konzol: `tryOpenFreePouch()` → overlay, pouch 👝 rázkódik, koppints → gém nő. Másodszor: "Ma már felhasználtad..." prompt.
`buyPouch()` → gém -30, overlay nyílik (ha van elég gém). Shopban: Pouch vásárló gomb kattintható.
LocalStorage: `nu_pouch_day`, `nu_pouch_free` kulcsok frissülnek.

- [ ] **Step 6: Commit**

```bash
git add index.html
git commit -m "DailyPouch overlay with free daily + 30 gem purchase"
```

---

### Task 10: Főképernyő gomb sor (💎 🎁 👝 🎰)

**Cél**: Főképernyőn egy horizontális sor a loot elérésekhez.

**Files:**
- Modify: `index.html`

- [ ] **Step 1: HTML a streak közelébe**

Keresd meg a streak elemet (`#streakCount` vagy hasonló). Alá/mellé:

```html
<div class="loot-row">
    <button class="loot-btn" id="lootGems" title="Gémek">💎 <span data-gem-display>0</span></button>
    <button class="loot-btn" id="lootBox" title="Daily Box">🎁 <span id="lootBoxBadge">2/2</span></button>
    <button class="loot-btn" id="lootPouch" title="Daily Pouch">👝 <span id="lootPouchBadge">1/1</span></button>
    <button class="loot-btn" id="lootSpin" title="Napi Spin">🎰 <span id="lootSpinBadge">✓</span></button>
</div>
```

- [ ] **Step 2: CSS**

```css
.loot-row{
    display:flex;gap:8px;justify-content:center;padding:10px 16px;flex-wrap:wrap;
}
.loot-btn{
    display:inline-flex;align-items:center;gap:6px;
    background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);
    color:#fff;font-weight:700;font-size:13px;
    padding:8px 12px;border-radius:14px;cursor:pointer;
    transition:transform .15s, background .2s;
}
.loot-btn:active{transform:scale(.92)}
.loot-btn:hover{background:rgba(255,255,255,.12)}
.loot-btn.empty{opacity:.4}
```

- [ ] **Step 3: Badge frissítő függvények + listenerek**

```javascript
function updateBoxBadge(){
    const el = document.getElementById('lootBoxBadge');
    if(el) el.textContent = `${boxesRemaining()}/2`;
    document.getElementById('lootBox')?.classList.toggle('empty', boxesRemaining() === 0);
}
function updatePouchBadge(){
    const el = document.getElementById('lootPouchBadge');
    const avail = pouchFreeAvailable();
    if(el) el.textContent = avail ? '1/1' : '0/1';
    document.getElementById('lootPouch')?.classList.toggle('empty', !avail);
}
function updateSpinBadge(){
    const el = document.getElementById('lootSpinBadge');
    const today = td();
    const canSpin = localStorage.getItem('nu_spin_day') !== today;
    if(el) el.textContent = canSpin ? '✓' : '⏳';
    document.getElementById('lootSpin')?.classList.toggle('empty', !canSpin);
}

document.getElementById('lootGems').addEventListener('click', () => {
    // shop megnyitás
    document.querySelector('.shop-panel, #shopPanel')?.classList.add('open');
});
document.getElementById('lootBox').addEventListener('click', openDailyBox);
document.getElementById('lootPouch').addEventListener('click', tryOpenFreePouch);
document.getElementById('lootSpin').addEventListener('click', () => {
    // shop megnyitás + scroll to spin section
    document.querySelector('.shop-panel, #shopPanel')?.classList.add('open');
    setTimeout(() => {
        document.getElementById('dragonSpinSection')?.scrollIntoView({behavior:'smooth'});
    }, 200);
});

// Inicializálás
updateBoxBadge();
updatePouchBadge();
updateSpinBadge();
updateGemUI();
```

Add hozzá: a `renderShop()` végén (hogy spin pörgetés után is frissüljön) hívd meg mindhárom badge-et:

```javascript
updateBoxBadge(); updatePouchBadge(); updateSpinBadge();
```

Ugyanígy a spin button click handler végén.

- [ ] **Step 4: Böngésző teszt**

Reload. Főképernyőn a robot alatt látszik: `💎 50  🎁 2/2  👝 1/1  🎰 ✓`.
- Box: 🎁 kattintás → overlay → nyerés után `🎁 1/2`.
- Pouch: 👝 kattintás → overlay → utána `👝 0/1` (fakó).
- Spin: 🎰 → shop + scroll spin section-re → pörget után `🎰 ⏳`.
- Gém: 💎 kattintás → shop nyit.

- [ ] **Step 5: Commit**

```bash
git add index.html
git commit -m "Main screen loot row with gems/box/pouch/spin buttons"
```

---

### Task 11: App ambient zene (Web Audio API)

**Cél**: Csendes, lágy, meditatív ambient háttérzene folyamatosan, első interakciótól.

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Ambient zene init függvény**

A törölt dragon music helyére:

```javascript
let appAudioCtx = null;
function initAppAmbient(){
    if(appAudioCtx) return;
    try {
        appAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch(e){ return; }

    const ctx = appAudioCtx;
    const master = ctx.createGain();
    master.gain.value = 0.04;
    master.connect(ctx.destination);

    // Halk pad — alacsony szinusz
    const pad = ctx.createOscillator();
    pad.type = 'sine';
    pad.frequency.value = 110; // A2
    const padGain = ctx.createGain();
    padGain.gain.value = 0.35;
    pad.connect(padGain).connect(master);
    pad.start();

    // Második pad réteg — kvint
    const pad2 = ctx.createOscillator();
    pad2.type = 'sine';
    pad2.frequency.value = 164.81; // E3
    const pad2Gain = ctx.createGain();
    pad2Gain.gain.value = 0.2;
    pad2.connect(pad2Gain).connect(master);
    pad2.start();

    // Szűrt fehér zaj — légköri szövet
    const bufSize = ctx.sampleRate * 2;
    const noiseBuf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for(let i=0;i<bufSize;i++) d[i] = (Math.random()*2-1) * 0.5;
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuf;
    noise.loop = true;
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.value = 300;
    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.15;
    noise.connect(noiseFilter).connect(noiseGain).connect(master);
    noise.start();

    // Ritka pentatonikus dallamfoszlány (A-moll: A C D E G)
    const pentatonic = [220, 261.63, 293.66, 329.63, 392];
    function playNote(){
        if(!appAudioCtx) return;
        const o = ctx.createOscillator();
        o.type = 'triangle';
        o.frequency.value = pentatonic[Math.floor(Math.random()*pentatonic.length)];
        const g = ctx.createGain();
        g.gain.value = 0;
        g.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.8);
        g.gain.linearRampToValueAtTime(0, ctx.currentTime + 4);
        o.connect(g).connect(master);
        o.start();
        o.stop(ctx.currentTime + 4.5);
        setTimeout(playNote, 8000 + Math.random()*12000);
    }
    setTimeout(playNote, 5000);
}
document.addEventListener('click', initAppAmbient, {once:true});
document.addEventListener('touchstart', initAppAmbient, {once:true});
```

- [ ] **Step 2: Böngésző teszt**

Reload. Kattints bárhová. Halkan szól egy lágy pad + ritka dallamhang. Nem zavaró, alig hallható. Semmi sárkányos om/harang/fuvola.

Ha nem hallod: növeld a master gain-t átmenetileg 0.15-re, hallgasd meg, majd állítsd vissza 0.04-re.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "Add app ambient music (soft pad + pentatonic melody)"
```

---

### Task 12: Sync bővítés — új kulcsok export/import

**Cél**: Gém egyenleg és napi loot állapot szinkronizálódik eszközök között.

**Files:**
- Modify: `index.html`

- [ ] **Step 1: SYNC_KEYS bővítése (~3696. sor)**

```javascript
const SYNC_KEYS = [
    'nu_owned','nu_active_skin','nu_active_bg','nu_active_aura',
    'nu_favs','nu_s','nu_l','nu_name','nu_uid',
    'nu_gems',
    'nu_box_day','nu_box_count',
    'nu_pouch_day','nu_pouch_free',
    'nu_spin_day',
];
```

- [ ] **Step 2: Import merge — gém MAX, napi jogosultságok local wins**

Az import függvényben (~3745. sor után), a kedvencek után:

```javascript
// Gém: max(local, imported)
const importedGems = parseInt(data.nu_gems || '0', 10);
const localGems = getGems();
setGems(Math.max(localGems, importedGems));

// Napi jogosultságok: ha local szerint ma már elhasznált → local marad
// (nem vesszük vissza a napi boxokat/pouchokat másik eszközről)
const today = td();
if(data.nu_box_day === today && localStorage.getItem('nu_box_day') !== today){
    localStorage.setItem('nu_box_day', data.nu_box_day);
    localStorage.setItem('nu_box_count', data.nu_box_count || '2');
}
if(data.nu_pouch_day === today && localStorage.getItem('nu_pouch_day') !== today){
    localStorage.setItem('nu_pouch_day', data.nu_pouch_day);
    localStorage.setItem('nu_pouch_free', data.nu_pouch_free || 'true');
}
if(data.nu_spin_day === today && localStorage.getItem('nu_spin_day') !== today){
    localStorage.setItem('nu_spin_day', today); // ma már pörgött a másik eszközön
}

updateGemUI();
updateBoxBadge();
updatePouchBadge();
updateSpinBadge();
```

- [ ] **Step 3: Böngésző teszt**

1. Másik böngésző/inkognitó: állíts be `nu_gems = 100`, exportálj sync kódot.
2. Eredeti böngésző: `nu_gems = 20`, importáld a kódot.
3. Eredmény: `nu_gems = 100` (MAX győzött), főképernyőn 💎 100.
4. Exportálj majd importáld vissza — ne duplikáljon tárgyakat (`nu_owned` union logika eddig is működik).

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "Sync extension — gems, daily box/pouch/spin state"
```

---

### Task 13: Service Worker cache verzió bump

**Cél**: Új frissítés terjesztése a már telepített PWA-khoz.

**Files:**
- Modify: `sw.js`

- [ ] **Step 1: Cache név v18 → v19**

Az `sw.js`-ben keresd meg: `const CACHE_NAME = 'napi-uzenet-v18'` (vagy hasonló). Módosítsd v19-re.

- [ ] **Step 2: Böngésző teszt — frissítés átáll**

1. Nyisd meg az appot (ez még v18-at tölthet cache-ből).
2. DevTools → Application → Service Workers: látod a régi SW "waiting"-ben.
3. 10-20 mp múlva automatikus `skipWaiting` + `controllerchange` → reload → új verzió aktív.
4. DevTools → Application → Cache Storage: csak `napi-uzenet-v19` van, a régi v18 törlődött.

- [ ] **Step 3: Commit**

```bash
git add sw.js
git commit -m "Bump SW cache v18 -> v19 for gem economy rollout"
```

---

### Task 14: Végső böngésző smoke test

**Cél**: Teljes user flow ellenőrzés.

- [ ] **Step 1: Fresh user flow**

1. Clear site data → reload. Onboarding (név) → kész.
2. Főképernyő: 💎 50, 🎁 2/2, 👝 1/1, 🎰 ✓.
3. Nyisd meg mindhárom loot forrást: box × 2, pouch × 1, spin × 1.
4. Gém egyenleg nő. Shop: néhány tárgy már ingyen? Nem — minden gémes (kivéve ingyenes defaultok).
5. Olcsó tárgy vásárlás: sikeres, gém csökken, aktiválhatod.
6. Másnap szimuláció: konzol `localStorage.removeItem('nu_box_day'); localStorage.removeItem('nu_pouch_day'); localStorage.removeItem('nu_spin_day');` → reload → 🎁 2/2, 👝 1/1, 🎰 ✓ vissza.

- [ ] **Step 2: Meglévő felhasználó migráció**

1. Clear site data → `nu_owned = ["skin-galaxy","bg-fire","aura-rgb"]` + `nu_name = "Teszt"` + `nu_reg = "1"` → reload.
2. Galaxy, Fire, RGB mind "Kiválasztás" státusszal (nincs ár). Gém 50 (init).
3. Többi tárgy árcédulával.

- [ ] **Step 3: Sárkány Hét nincs override**

1. Konzol: `localStorage.setItem('nu_force_dragon_week', '1')` (ha van ilyen kapcsoló — ha nincs, simán az április 11–17 közötti dátum manuális állítása).
2. Reload. Favicon eredeti dailybot ikon. Zene nem sárkányos. Sárkány SKIN maga létezik (rejtvényes feloldás maradt).

- [ ] **Step 4: Commit + push**

```bash
git status
# Ha minden rendben:
git log --oneline -15
```

(Push csak akkor, ha kifejezetten kéred.)

---

## Appendix A: Kritikus megjegyzések

1. **ID-k konzisztencia**: A `ITEM_PRICES` kulcsai MUST egyezzenek a `SKINS`/`BGS`/`AURAS` tömbök `id` mezőivel. Az első implementáció során nyisd meg a fájlt, gyűjtsd ki az összes `id:'xxx'` értéket és igazítsd a price táblát.

2. **Régi `nu_dspin`**: az első indításkor egyszer törlődik (Task 6, Step 3). Eredmény: a felhasználó egy "bónusz" spint kap aznap.

3. **`msgDay()` függés**: minden napi reset erre épül. Ne használd a `new Date().toDateString()`-et közvetlenül — mindig `td()`-t.

4. **Mobile / iOS WebAudio**: az `initAppAmbient()` csak user gesture (`click`/`touchstart`) után indul, ez már megoldott. iOS Safari-n halkabb lehet — ne nyúlj a master gain-hez.

5. **SW v19 rollout**: a meglévő `skipWaiting` logika (CLAUDE.md szerint) automatikusan kiváltja a reload-ot. Ha valakinél beragad: manuális cache törlés DevTools-ban.

---

## Self-review kimutatás

- ✅ **Spec coverage**: minden spec szekció (1–10) → task (1–13). Task 14 end-to-end.
- ✅ **Placeholder scan**: nincs TBD/TODO/"add validation". Minden step konkrét kóddal/paranccsal.
- ✅ **Type consistency**: `openDailyBox`, `openPouch`, `applyPrize`, `rollNormalPrize`, `rollSuperPrize` konzisztens nevek. `boxesRemaining/consumeBox`, `pouchFreeAvailable/consumeFreePouch` egységes minta.
- ⚠️ **Pontos `id`-k**: Task 5 step 1 `ITEM_PRICES` — a valós `id` értékeket a `SKINS`/`BGS`/`AURAS` tömbökből kell megerősíteni az első implementációs lépéskor. Ezt explicit jelezve Appendix A-ban.
