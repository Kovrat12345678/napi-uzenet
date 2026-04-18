# Gém-gazdaság bevezetés — Design Spec

**Dátum**: 2026-04-18
**Projekt**: Napi Üzenet (DailyBot) PWA

## Cél

A jelenlegi "minden ingyen" modellt lecseréljük egy gém-alapú loot gazdaságra. Három új loot forrás (Spin, DailyBox, DailyPouch) tölti meg a gazdaságot, a shop összes tárgya (skin, háttér, aura) gémért vásárolható. A Sárkány Hét specifikus app ikon és zene override törlődik, helyükre eredeti ikon és általános app-zene kerül.

## Nem-célok

- Sárkány Hét esemény eltávolítása (marad, csak az ikon/zene override szűnik meg)
- Meglévő feloldott tárgyak elvétele (megtartják)
- Szerver oldali változtatás (minden kliens-oldali localStorage)

## 1. Sárkány-specifikus dolgok eltávolítása

### 1.1 App ikon visszaállítása
- Töröljük a `dragon-icon.svg` → canvas → PNG konverziós logikát
- Favicon és apple-touch-icon végleg `icon/dailybot-icon.png`
- Manifest.json dinamikus blob URL override törölve
- Loading screen mindig a `dailybot-icon.png`-t mutatja

### 1.2 Sárkány zene törlése
- Web Audio API om dron / flute / bell / reverb logika törölve Sárkány Hét alatt is
- Ezzel együtt a "Sárkány Hét alatt automatikusan indul" trigger is törlődik

### 1.3 Új app ambient zene
- Csendes, költői, meditatív — matching "TopJoy-szerű" tónus
- Web Audio API: lágy pad (alacsony szinusz + szűrt zaj), ritka pentatonikus dallamfoszlány (A-moll)
- Master gain: 0.04 (nagyon halk)
- Automatikus indítás az első interakcióra (user gesture követelmény)
- **Nem kikapcsolható** (mint most a sárkány zene)
- Folyamatosan szól, nem csak Sárkány Hét alatt

## 2. Gém pénznem

- **localStorage kulcs**: `nu_gems` (integer, default 50)
- **Induló egyenleg**: 50 gém (új felhasználók + meglévő migráció)
- **Megjelenítés**: `💎 {szám}` a főképernyőn a streak mellett, és a shop headerben
- Minden tranzakció helper: `addGems(n)`, `spendGems(n) → bool` (false ha nem elég)

## 3. Shop átalakítás

### 3.1 Tárgy árak

**Skinek:**
| Skin | Ár |
|------|-----|
| Alap | ingyen |
| Tulipán, Sakura, Graffiti | 100 |
| Stealth, Galaxy, Fire, Gamer | 200 |
| Golden, Diamond, Glass, Ló | 400 |
| Rainbow | 600 |
| Sárkány | csak rejtvénnyel (ingyen, különálló logika) |

**Hátterek:**
| Háttér | Ár |
|--------|-----|
| Napszak | ingyen |
| Tavaszi Rét, Sakura, Graffiti | 80 |
| Galaxy, Stealth, Fire | 150 |
| Luxus Arany, Gyémánt, Labor Glass | 300 |
| Szivárvány, Gamer Room | 500 |

**Aurák:**
| Aura | Ár |
|------|-----|
| Nincs | ingyen |
| Tulipán, Sakura | 50 |
| Tűz, Glitch | 120 |
| Szent, RGB | 250 |
| Gyémánt | 400 |

### 3.2 Vásárlási folyamat
- Shop item gombja: "💎 {ár}" ha nem birtokolja, "Aktív"/"Kiválasztás" ha igen
- Kattintás → megerősítő modal: "Megveszed X-et Y gémért?"
- Elég gém → `spendGems()`, `nu_owned` tömbbe kerül, sikere animáció (konfetti)
- Nem elég gém → "Nincs elég gém" toast + nem történik semmi

### 3.3 Migráció
- Meglévő `nu_owned` tömb tartalma marad (ingyen megszerzett dolgokat megtartja)
- Új telepítésnél `nu_owned = ['skin-alap', 'bg-napszak', 'aura-none']` (default ingyen tárgyak)
- `nu_gems` kulcs hiányakor 50-re állítódik (első indítás vagy migráció)

## 4. Daily Spin

### 4.1 UX
- Shopban mindig látszik (nem Sárkány Hét-kötött többé)
- Címke: "🎰 Napi Spin"
- Canvas alapú forgó kerék (a jelenlegi Dragon Spin kód átalakítva)
- Gomb: "🎰 Pörgesd meg!" (disabled ha már pörgetett ma)

### 4.2 Kerék szegmensek
8 szegmens, egyenletes szög (45°), de súlyozott valószínűség vizuálisan:
- 5 gém ×2
- 10 gém ×2
- 15 gém ×1
- 20 gém ×1
- 25 gém ×1
- 150 gém ×1 (legkisebb slice, ritkán)

Kódban: `SPIN_SEGMENTS = [5, 10, 10, 15, 20, 25, 5, 150]`

### 4.3 Napi limit
- `nu_spin_day` kulcs: utolsó pörgetés `td()` napja
- Ha egyezik mai nappal → gomb disabled, "Gyere vissza holnap 6-kor!"
- 6 AM reset a `msgDay()` logikán keresztül
- Eredmény kijelzés: "Nyertél: 💎 X gém!" + `addGems(X)`

## 5. DailyBox

### 5.1 Napi jogosultság
- **Napi 2 doboz ingyen**
- `nu_box_day` (utolsó reset napja), `nu_box_count` (ma megmaradt, default 2)
- Reset: új `msgDay()`-nél `nu_box_count = 2`

### 5.2 Full-screen overlay UX

Megnyitás lépései:
1. Felhasználó koppint a 🎁 gombra (főképernyőn vagy shopban)
2. Teljes képernyős overlay fade in (sötét háttér, középen nagy doboz)
3. Alul **szám: "1" vagy "2"** nagy fontos megjelenítéssel — véletlenszerűen meghatározva nyitás kezdetén
  - **Valószínűség**: 75% hogy 1, 25% hogy 2
4. Doboz lebeg, pulzál CSS animációval; felirat: "Koppints a dobozra!"
5. Koppintás → doboz "kinyílik" (CSS transzform), konfetti, 1. nyeremény animáltan beúszik középre
6. Nyeremény kártya: ikon + név + leírás, alatta "Szuper!" gomb
7. **Ha szám=1**: "Szuper!" koppintás bezárja az overlay-t
8. **Ha szám=2**: a "2" átvált "1"-re animációval, új prompt: "Még egy vár rád! Koppints a dobozra!" → koppintás → 2. nyeremény (EPIC tier) megjelenik, konfetti nagyobb → "Szuper!" bezár

Overlay DOM: `#dailyBoxOverlay`, CSS z-index legfelül (9999).

### 5.3 Loot tábla

**Normál nyeremény (1. nyeremény vagy 1-es box):**
- 70% gém: egyenlő eloszlás 10/20/30 között
- 25% Common item: random nem birtokolt skin/háttér/aura ahol ár ≤ 100, ha van. Ha nincs → fallback 30 gém.
- 5% Rare item: random nem birtokolt tárgy ahol ár 100–250. Fallback 50 gém.

**Super nyeremény (2-es box 2. díja):**
- 60% Legendary/Epic item: random nem birtokolt tárgy ahol ár ≥ 300. Fallback 300 gém ha már mindent birtokol.
- 40% Nagy gém: egyenlő eloszlás 150/200/300 között.

## 6. DailyPouch

### 6.1 Napi jogosultság
- **Napi 1 pouch ingyen**
- `nu_pouch_day`, `nu_pouch_free` (ma ingyen jár-e, boolean)
- Reset: új `msgDay()`-nél `nu_pouch_free = true`

### 6.2 Vásárlás
- Shopban "Vásárolj Pouch-ot — 💎 30" gomb
- Nincs napi vásárlási limit (ameddig van gém)
- Kattintás → gém levonás → azonnal nyitja a pouch overlay-t

### 6.3 UX
- Kisebb overlay (nem full-screen) — dialog-szerű
- Pouch ikon (👝) — CSS animáció: ráz, majd "kinyílik"
- Gém szám animáltan beúszik
- "Köszönöm!" gomb → bezár

### 6.4 Loot
- Egyenlő eloszlás: 5, 10, 15, 20, 25 gém
- Új localStorage: `nu_gems += sorsolt érték`

## 7. Főképernyő UI

A robot alatt új horizontális sor a streak mellett:

```
[🔥 5 streak]  [💎 50]  [🎁 2/2]  [👝 1/1]  [🎰 ✓]
```

Minden gomb kattintható:
- **💎**: shop megnyitás (vagy "inventory" section)
- **🎁**: DailyBox overlay (ha van még mai, egyébként "Holnap újra!")
- **👝**: DailyPouch overlay (ha van ingyen, egyébként vásárlás prompt)
- **🎰**: Spin — shop megnyitás a spin szekciónál (scroll to)

Badge számláló: `{ma elérhető}/{napi max}` (pl. 2/2, 1/1, vagy ✓/⏳ spinre)

## 8. Sync bővítés

Meglévő export/import sync rendszer bővítése (base64 JSON):
- `nu_gems`
- `nu_box_day`, `nu_box_count`
- `nu_pouch_day`, `nu_pouch_free`
- `nu_spin_day` (Ezt marad a `nu_dspin`-ből átnevezve, vagy új kulcs. Döntés: új `nu_spin_day`, a régi `nu_dspin`-t migráljuk egyszer.)
- Import összefésülés: gém → MAX(local, imported); napi jogosultságok → a local ma már elhasznált-e dönti el.

## 9. Service Worker

- Cache verzió `v18` → `v19`
- Új verzió kirollására `skipWaiting` frissítési logika meglévő (változatlan)

## 10. Technikai megjegyzések

- Minden napi reset a `msgDay()` / `td()` — reggel 6 logika (nem éjfél)
- Új shop section sorrend: Daily Spin → Daily Box vásárlás (ha lesz) → Daily Pouch vásárlás → Skinek → Hátterek → Aurák
- Meglévő `pre-reg` regisztráció folyamat érintetlen
- Meglévő unnepi oltozekek, idojaras, nevnap stb. érintetlen
- A Sárkány skin rejtvény logika érintetlen (marad ingyenes feloldható)

## Implementációs fázisok (javaslat)

1. **Sárkány zene + ikon eltávolítás** — gyors, izolált
2. **Gém pénznem + UI jelző** — alap infrastruktúra
3. **Shop árazás + vásárlási folyamat** — migráció
4. **Daily Spin refactor** — meglévő Dragon Spin kódból
5. **DailyBox overlay + loot** — új komponens
6. **DailyPouch overlay + vásárlás** — új komponens
7. **App ambient zene** — Web Audio API
8. **Sync bővítés + SW v19** — zárás

## Success criteria

- Meglévő felhasználó app megnyitásakor lát egy gém egyenleget, feloldott tárgyait megtartja
- Napi spin, 2 box, 1 pouch elérhető reggel 6-kor
- 2-es box mechanika (1→2 nyeremény sorozat) működik
- Shop összes tárgy gémért vásárolható, megfelelő árakkal
- Sárkány Hét ikon/zene override nem aktiválódik többé
- Halk ambient zene folyamatosan szól interakció után
