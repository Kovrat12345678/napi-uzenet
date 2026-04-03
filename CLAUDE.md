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
  - `nu_game_best` (jatek rekord), `nu_xp` (osszes XP), `nu_owned` (megvett targyak JSON tomb)
  - `nu_active_skin` (aktualis skin), `nu_active_bg` (aktualis hatter), `nu_active_aura` (aktualis aura)
  - `nu_last_spin` (utolso szerencsekerek porges datuma)
  - `nu_deal_date`, `nu_daily_deal` (napi szuperajanlat cache)

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

Tier rendszer: free / common / rare / legendary / secret

| Skin | Ar (XP) | Tier |
|------|---------|------|
| Alap | 0 | free |
| Tulipan | 0 | free (ajandek) |
| Galaxy | 200 | common |
| Sakura | 350 | common |
| Graffiti | 350 (elso nap 2000) | common (apr 10-tol) |
| Stealth | 550 | rare |
| Fire | 600 | rare |
| Golden | 800 | rare |
| Diamond | 800 | rare |
| Rainbow | 800 | rare |
| Gamer | 900 | rare |
| Glass | 2000 | legendary (legritkabb) |
| Chicky | titkos | secret (husveti) |
| Lo | titkos | secret (Kovrat/Rella exkluziv) |

### Hatterek

| Hatter | Ar (XP) | Tier |
|--------|---------|------|
| Napszak | 0 | free |
| Tavaszi Ret | 0 | free (ajandek, bg-tulip.png) |
| Galaxy | 200 | common (CSS csillagok) |
| Sakura | 350 | common |
| Graffiti | 350 (elso nap 2000) | common (apr 10-tol, bg-graffiti.png) |
| Stealth | 550 | rare |
| Fire | 600 | rare |
| Luxus Arany | 800 | rare |
| Gyemant | 800 | rare |
| Szivarvany | 800 | rare |
| Gamer Room | 900 | rare |
| Labor Glass | 1000 | legendary (bg-glass.png) |

### Aurak

| Aura | Ar (XP) | Tier |
|------|---------|------|
| Nincs | 0 | free |
| Tulipan | 0 | free (ajandek) |
| Tuz | 400 | common |
| Sakura | 500 | common |
| Glitch | 750 | rare |
| Szent | 1000 | rare |
| RGB | 1500 | legendary |
| Gyemant | 2000 | legendary |

### Napi Szuperajanlat

14 napos ciklusban rotalnak, ejfelkor (0:00) valt. Visszaszamlalo mutatja mikor jon az uj.
Kivetel: apr 10 = Graffiti Csomag (skin+hatter) 2000→1000 XP.
Bundle tipusu deal: ket targyat ad egyszerre (pl. Glass skin + hatter).

### Szerencsekerek

- Naponta 1 ingyenes porges, ejfelkor (0:00) resetel
- XP nyeremenyek (96.5%): 20/50/100/200/500 XP
- Skin nyeremenyek (3.5%): Galaxy 1.2%, Sakura 0.8%, Fire 0.5%, Stealth 0.4%, Golden 0.3%, Rainbow 0.2%, Glass 0.1%
- Gomb letiltva porges kozben (dupla-kattintas vedelem)

### Szinkronizalas

- 🔄 gomb a bolt headerben
- Export: base64 kodolt JSON az osszes felhasznaloi adattal
- Import: beillesztes + okos osszefesules (XP max, owned unio, kedvencek merge)
- URL hash import tamogatas (#sync=CODE)
- Nincs szerver — copy-paste vagy uzenetkuldos megosztas

### Tavaszi Ajandek

- Elso belepes utan interaktiv ajandekdoboz jelenik meg
- 3x koppintas → doboz kinyilik → felhasznalo megkapja: Tulipan Skin + Tavaszi Ret Hatter + Tulipan Aura
- Targyak csak a doboz kinyitasa utan adodnak

### Szemelyes koszrontes

- A fejlecben "Szia, [Nev]! ✨" jelenik meg
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

- **Mama szulinapja (apr 4–6.)** — fix uzenet, leggombok, konfetti, szulinapi sapka
- **Husvet** (dinamikus datumszamitas, apr 7-ig): husveti emojik a jatekban, Chicky skin vadaszat
- Karacsony (dec 20–26), Mikulas (dec 6), Szilveszter (dec 31), Ujev (jan 1)
- Halloween (okt 31), Valentin-nap (feb 14), Aprilis bolondok (apr 1)
- Robot szulinapja (mar 26), Nemzeti unnepek: marc 15, aug 20, okt 23

### Husvet logika (apr 7-ig)

- `isPastEaster` flag: apr 7 utan automatikusan kikapcsol mindent
- Husveti ikon (manifest + HTML) → apr 7 utan normal ikon
- Jatek emojik: husvetig tojasok/nyulak, utana viragok
- Chicky skin: 10x robot koppintas → titkos tojas animacio → skin feloldas
- Bolt tipp: "Egy titkos husveti skin el van rejtve az appban!"

### Graffiti (apr 10-tol)

- Graffiti Skin + Graffiti Hatter egyutt jelenik meg apr 10-en
- Elso nap (apr 10): 2000 XP aruert, szuperajanlat: csomag 1000 XP-ert
- Masodik naptol (apr 11+): normal ar 350 XP
- Datumkorlat: apr 10 elott nem lathato (kivetel: Kovrat nev)

### Exkluziv targyak

- **Kovrat** nev: minden skin/hatter/aura automatikusan feloldva (master unlock)
- **Rella** nev: Lo Skin automatikusan feloldva
- **Zerend** nev: Gamer Skin + Hatter feloldva

### Emoji Dodge minijáték

- **Inditas**: robot hosszan nyomva tartasa (600ms long press)
- **Jatekos**: CSS mini robot, jobbra-balra mozog ujjal huzva
- **Emojik**: husvetig tojasok/nyulak, utana viragok (tulipan, napraforgo stb.)
- **Sebesseg**: lassu indulas (0.8–1.4), 200 pont felett gyorsul (1.5–2.7+)
- **Spawn**: 1400ms alap, 200 pont felett surusodik (min 500ms)
- **XP rendszer**: 10 kikerult emoji = 50 XP, 3 elet, sebezhetetlenseg talat utan (1.2s)
- **Hatter**: az aktualis napszak gradiens hattere

### Idojaras

- Geolocation API → fallback: geojs.io IP-alapu
- Open-Meteo API → WMO kodok: 0-1 derult, 51-67 eso, 71-77 ho, 95+ vihar
- CSS animaciok: `raindrop` (eso), `snowflake` (ho), `sunray` (napsutes, iOS fix: scaleY + webkit prefix)
- `#weatherLayer` div a DOM-ban (korábban hiányzott, javítva)

### Ertesitesek

- **Service Worker** (`sw.js`, cache v11)
- SW utemez ertesiteseket: reggel 6, delben 12, este 18
- `periodicSync` (Android Chrome): 4 oranként hatterbeli emlekeztetо
- `index.html` → network-first cache strategia

## File Structure

```
index.html          — teljes alkalmazas (CSS + JS beagyazva)
manifest.json       — PWA manifest (standalone, husveti ikon apr 7-ig)
sw.js               — Service Worker (cache v11 + ertesitesek)
CLAUDE.md           — fejlesztoi utmutato Claude Code szamara
README.md           — felhasznaloi dokumentacio
bg-tulip.png        — Tavaszi Ret hatter kep
bg-glass.png        — Labor Glass hatter kep
bg-graffiti.png     — Graffiti hatter kep
easter_robot_icon_1775165541166.png — husveti PWA ikon (apr 7-ig)
icon/
  dailybot-icon.png — PWA ikon (PNG, 512x512)
  dailybot-icon.svg — PWA ikon (SVG forras)
háttér/             — forras hatter kepek (nem hasznalja az app kozvetlenul)
push-server/        — (nem hasznalatban) Vercel push szerver
```

## App Icon

- Husvetig (apr 7): `easter_robot_icon_1775165541166.png`
- Apr 7 utan: `icon/dailybot-icon.png` (automatikus JS valtás)
- Manifest: `any maskable` purpose

## Social

- TikTok: http://www.tiktok.com/@dailybot_dailymessage (link az app aljan)

## Language

All user-facing text is in Hungarian (Magyar).
