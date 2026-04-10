# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"Napi Uzenet" (DailyBot) — napi gondolat alkalmazas iPhone-ra es Androidra (PWA). Egy elethu CSS robot all a kepernyo kozepen animaciokkal (lebeges, pislogas, antenna pulzalas). Megnyomod → a robot "beszel" animacio, majd folotte szovegbuborekban gepeloeffekttel megjelenik a napi uzenet. Naponta 1 uzenet, TopJoy stilusu (csendes, koltoei, elmelkedo). Kesobb App Store-ba es Play Aruhazba kerul (Capacitor).

## Tech Stack

- **Egyetlen HTML fajl** (`index.html`) — beagyazott CSS + vanilla JS, nincsenek fuggosegek
- **PWA** — `manifest.json` + `sw.js` service worker + apple-mobile-web-app meta tagek, iPhone-on es Androidon kezdokepernyore teheto
- **Hosting**: GitHub Pages — `https://kovrat12345678.github.io/napi-uzenet/`
- **Lokalis fejlesztes**: XAMPP — `http://localhost/napi%20üzenet%20hivatalos/`

## Architecture

- **365 uzenet** a `M` tombben az `index.html` `<script>` reszeben, 12 kategoriabol:
  - Csend & Onismeret, Kapcsolatok & Kozelseg, Bolcsesseg & Ido, Kitartas & Turelem, Nyugalom & Jelenlet, Konnyedseg & Mosoly, Alkotas & Figyelem, Termeszet & Csoda, Erzesek & Melyseg, Ero & Valtozas, Melyseg & Ertelem, Zaro bolcsessegek
- **Uzenet stilus**: TopJoy-szeru — rovid, ketmondatos, csendes, koltoei, elmelkedo. Nem motivacios poster stilus.
- Napi uzenet kivalasztas: datum-alapu hash seed — datum es uid osszekeverese (multiply-xor hash), minden felhasznalo mas uzenetet kap
- **Reggel 6 logika**: az "uzenet-nap" reggel 6-kor valt, nem ejfelkor. A `msgDay()` fuggveny adja az aktualis uzenet-napot (6 ora elott az elozo nap szamit).
- `localStorage` kulcsok:
  - `nu_s` (streak szam), `nu_l` (utolso latogatas datuma), `nu_d` (ma mar latta-e), `nu_uid` (felhasznalo azonosito)
  - `nu_reg` (regisztracio kesz), `nu_name` (keresztnev)
  - `nu_favs` (kedvenc uzenetek JSON tomb)
  - `nu_owned` (feloldott targyak JSON tomb)
  - `nu_active_skin` (aktualis skin), `nu_active_bg` (aktualis hatter), `nu_active_aura` (aktualis aura)

### Reggel 6 logika

- `msgDay()` fuggveny: ha `getHours() < 6`, az elozo nap szamit uzenet-napnak
- `td()` = `msgDay().toDateString()` — minden localStorage muvelet ezt hasznalja
- Erintett rendszerek: uzenet kivalasztas (`dm()`), streak, seen/mark, visszaszamlalo, nevnap, unnepi oltozekek, datum kijelzes
- Visszaszamlalo: ha 6 elott → ma 6-ig szamol, ha 6 utan → holnap 6-ig

### Onboarding (regisztracio)

- Elso megnyitaskor 2 lepesu regisztracio: Intro → Keresztnev
- **Csak utonevt ker** — szokoz tiltva az input mezoben (vezeteknev nem adhato meg)
- `nu_reg` && `nu_name` letezese alapjan donti el, hogy megjelenjen-e
- Az app (`#appMain`) CSS-bol rejtett (`pre-reg` class) amig a regisztracio nem kesz

### Robot

- Teljes CSS-only rajz animaciokkal:
  - **Idle**: lebeges (`float`), szem pislogas (`eyeIdle`), antenna pulzalas (`glow`), sziv dobolas (`heartbeat`)
  - **Beszed**: szaj animacio (`speak`), kar mozgas (`waveL/R`), mellkas LED-ek (`dotPulse`), szem fenyesedes
  - **Boldog**: mosolygo szaj, hunyorgo szemek, karok felfele
  - **Excited**: ugralas, tapsolas, ragyogo szemek
  - **Caring**: gyenged ringas, lila feny, olelo karok
  - **Thinking**: lassabb pislogas, kerdojel antenna
  - **Dancing**: tancolo mozgas, gyors kar lengetes
- Reakcio kivalasztas: `pickReaction()` fuggveny az uzenet szovege es emojija alapjan

### Robot Skinek

Minden skin ingyenes, szabadon valaszthato a boltban.

| Skin | Leiras |
|------|--------|
| Alap | Az eredeti klasszikus |
| Tulipan | Tavaszi viraagos |
| Galaxy | Kozmikus ragyogas |
| Sakura | Cseresznyevirag |
| Graffiti | Utcai muvesz |
| Stealth | High-tech ugynok |
| Fire | Langolo voros izzas |
| Golden | Tiszta arany csillogas |
| Diamond | Jegkek dragako test |
| Rainbow | Szivarvanyos szinvalto |
| Gamer | Full RGB, pro kulso |
| Glass | Atlatszo uveg robot |
| Lo | Lovas robot |
| Sarkany | Titkos — rejtveny megoldasaval nyerheto (tuzokado, szarnyak, farok, sarkanyfej) |

### Sarkany Skin

- Rejtveny jatek a boltban — 3 fokozatos tipp, megoldas: "sarkany"
- Megoldas utan a rejtveny eltünik, skin feloldodik
- Egyedi dragon CSS: sarkanyfej (szarvak, tarej, pofa, res-szemu zold szemek, hegyes fulek), szarnyak, farok
- Koppintasra tuzokadas: tuz emojik robbannak a fejtol, szemek narancssargara valtanak, "Rrraawwr!!" buborek, tuz hang

### Hatterek

Minden hatter ingyenes, szabadon valaszthato.

| Hatter | Leiras |
|--------|--------|
| Napszak | Automatikus hatter |
| Tavaszi Ret | Tavaszi viragmezo (bg-tulip.png) |
| Galaxy | Csillagos egbolt (CSS csillagok) |
| Sakura | Tavaszi szirmok |
| Graffiti | Utcai falfestes (bg-graffiti.png) |
| Stealth | Ejszakai sotet |
| Fire | Pokoli langok |
| Luxus Arany | Arany fenyar |
| Gyemant | Kristaly tiszta |
| Szivarvany | Szinkavalkad |
| Gamer Room | Neon RGB setup |
| Labor Glass | Uveg labor vilag (bg-glass.png) |

### Aurak

Minden aura ingyenes, szabadon valaszthato.

| Aura | Leiras |
|------|--------|
| Nincs | Vissza az alapokhoz |
| Tulipan | Tavaszi viragaura |
| Tuz | Langolo energia |
| Sakura | Hullo szirmok |
| Glitch | Digitalis zavar |
| Szent | Egi ragyogas |
| RGB | Gamer szinek |
| Gyemant | Szikrazo jegkristaly |

### Szinkronizalas

- 🔄 gomb a bolt headerben (az X melletti gomb)
- Export: base64 kodolt JSON az osszes felhasznaloi adattal
- Import: beillesztes + okos osszefesules (owned unio, kedvencek merge)
- URL hash import tamogatas (#sync=CODE)
- Nincs szerver — copy-paste vagy uzenetkuldos megosztas

### Szemelyes koszrontes

- A fejlecben "Szia, [Nev]!" jelenik meg
- Nevnapon: "Boldog nevnapot, [Nev]! 🎉"

### Nevnapok

- Teljes magyar nevnap lista a `NEVNAPOK` objektumban (365 nap, ~700 nev)
- `MM-DD` kulcs formatum, a `msgDay()` datumot hasznalja (6 AM logika)

### Kedvencek

- Uzenet buborekban "🤍 Kedvenc" gomb
- `nu_favs` localStorage kulcsban JSON tombkent: `{t, e, d}` (szoveg, emoji, datum)
- Jobb felso sarokban sziv gomb badge-dzsel

### Megosztas

- Canvas-szal general kepes kartyat: 720x960 PNG
- `navigator.share()` nativ megosztas vagy clipboard/letoltes fallback

### Napszak-fuggo hatter

Az ora alapjan automatikusan valtozik:
- **Reggel** (5–6): narancs gradiens
- **Nappal** (6–17): kek-lila-rozsaszin gradiens + CSS csillagok
- **Este** (17–20): narancs-lila gradiens
- **Ejjel** (20–5): sotet kek-indigo gradiens

### Unnepi oltozekek

- Karacsony (dec 20–26), Mikulas (dec 6), Szilveszter (dec 31), Ujev (jan 1)
- Halloween (okt 31), Valentin-nap (feb 14), Aprilis bolondok (apr 1)
- Robot szulinapja (mar 26), Nemzeti unnepek: marc 15, aug 20, okt 23

### Idojaras

- Geolocation API → fallback: geojs.io IP-alapu
- Open-Meteo API → WMO kodok: 0-1 derult, 51-67 eso, 71-77 ho, 95+ vihar
- CSS animaciok: `raindrop` (eso), `snowflake` (ho), `sunray` (napsutes, csak 6–20h kozott, iOS fix: scaleY + webkit prefix)
- `#weatherLayer` div a DOM-ban

### Ertesitesek

- **Service Worker** (`sw.js`, cache v12)
- SW utemez ertesiteseket: reggel 6, delben 12, este 18
- `periodicSync` (Android Chrome): 4 oranként hatterbeli emlekeztetо
- `index.html` → network-first cache strategia

### SW frissites-detektalas

- Az app minden megnyitaskor `reg.update()`-ot hiv — ellenorzi van-e uj SW verzio
- Ha van varakozo uj SW, `skipWaiting` uzenetet kuld neki → azonnali aktivalas
- `controllerchange` esemenyre automatikus `location.reload()` — uj kod betolt
- A SW fogadja a `skipWaiting` uzenetet a `message` listenerben

### Visibility change handler

- `visibilitychange` esemeny figyeli ha az app hatterbol visszater
- Ha kozben nap valtott (`td()` valtozas), teljes `location.reload()` — frissul az uzenet, streak, minden
- Megoldja az Android PWA cache problemat: app eltavolitasa utan ujra megnyitva is friss tartalmat tolt

## File Structure

```
index.html          — teljes alkalmazas (CSS + JS beagyazva)
manifest.json       — PWA manifest (standalone)
sw.js               — Service Worker (cache v12 + ertesitesek + skipWaiting)
CLAUDE.md           — fejlesztoi utmutato Claude Code szamara
README.md           — felhasznaloi dokumentacio
bg-tulip.png        — Tavaszi Ret hatter kep
bg-glass.png        — Labor Glass hatter kep
bg-graffiti.png     — Graffiti hatter kep
icon/
  dailybot-icon.png — PWA ikon (PNG, 512x512)
  dailybot-icon.svg — PWA ikon (SVG forras)
háttér/             — forras hatter kepek (nem hasznalja az app kozvetlenul)
```

## App Icon

- `icon/dailybot-icon.png`
- Manifest: `any maskable` purpose

## Social

- TikTok: http://www.tiktok.com/@dailybot_dailymessage (link az app aljan)

## Language

All user-facing text is in Hungarian (Magyar).
