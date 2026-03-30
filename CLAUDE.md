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
- Napi uzenet kivalasztas: datum-alapu seed (`ev*10000 + ho*100 + nap + uid`) → determinisztikus index, evente mas sorrend
- **Reggel 8 logika**: az "uzenet-nap" reggel 6-kor valt, nem ejfelkor. A `msgDay()` fuggveny adja az aktualis uzenet-napot (6 ora elott az elozo nap szamit).
- `localStorage` kulcsok:
  - `nu_s` (streak szam), `nu_l` (utolso latogatas datuma), `nu_d` (ma mar latta-e), `nu_uid` (felhasznalo azonosito)
  - `nu_reg` (regisztracio kesz), `nu_name` (keresztnev), `nu_email` (email), `nu_age` (eletkor), `nu_city` (lakhely)
  - `nu_favs` (kedvenc uzenetek JSON tomb)

### Reggel 8 logika

- `msgDay()` fuggveny: ha `getHours() < 6`, az elozo nap szamit uzenet-napnak
- `td()` = `msgDay().toDateString()` — minden localStorage muvelet ezt hasznalja
- Erintett rendszerek: uzenet kivalasztas (`dm()`), streak, seen/mark, visszaszamlalo, nevnap, unnepi oltozekek, datum kijelzes
- Visszaszamlalo: ha 8 elott → ma 8-ig szamol, ha 8 utan → holnap 8-ig

### Onboarding (regisztracio)

- Elso megnyitaskor 4+1 lepesu regisztracio: Intro → Keresztnev → Email → Eletkor → Lakhely
- **Csak utonevt ker** — szokoz tiltva az input mezoben (vezeteknev nem adhato meg)
- Kulon kepernyokon, animalt atmenettekkel
- `nu_reg` && `nu_name` letezese alapjan donti el, hogy megjelenjen-e
- Az app (`#appMain`) rejtett amig a regisztracio nem kesz

### Robot

- Teljes CSS-only rajz animaciokkal:
  - **Idle**: lebeges (`float`), szem pislogas (`eyeIdle`), antenna pulzalas (`glow`), sziv dobolas (`heartbeat`)
  - **Beszed**: szaj animacio (`speak`), kar mozgas (`waveL/R`), mellkas LED-ek (`dotPulse`), szem fenyesedes
  - **Boldog**: mosolygo szaj, hunyorgo szemek, karok felfele
  - **Excited**: ugralas, tapsolas, ragyogo szemek (energia/motivacio uzeneteknel)
  - **Caring**: gyenged ringas, lila feny, olelo karok (erzelmes uzeneteknel)
  - **Thinking**: lassabb pislogas, kerdojel antenna (elmelkedo uzeneteknel)
  - **Dancing**: tancolo mozgas, gyors kar lengetes (vicces/humor uzeneteknel)
- Reakcio kivalasztas: `pickReaction()` fuggveny az uzenet szovege es emojija alapjan

### Szemelyes koszrontes

- A fejlecben "Szia, [Nev]! ✨" jelenik meg a regisztralt keresztnev alapjan
- Nevnapon: "Boldog nevnapot, [Nev]! 🎉"

### Nevnapok

- Teljes magyar nevnap lista a `NEVNAPOK` objektumban (365 nap, ~700 nev)
- `MM-DD` kulcs formatum, ertekek nevek tombje
- A regisztralt nev (`nu_name`) osszevetessel ellenorzi, hogy ma van-e a nevnapja
- A `msgDay()` datumot hasznalja (8 AM logika)

### Kedvencek

- Uzenet buborekban "🤍 Kedvenc" gomb — koppintasra elmenti/torli
- `nu_favs` localStorage kulcsban JSON tombkent tarolva: `{t, e, d}` (szoveg, emoji, datum)
- Jobb felso sarokban sziv gomb badge-dzsel a kedvencek szamaval
- Panel megnyitasakor lista: emoji + szoveg + datum + torles gomb
- `getFavs()`, `saveFavs()`, `isFaved()`, `updateFavBtn()`, `renderFavsList()` fuggvenyek

### Megosztas

- Uzenet buborekban "📤 Megosztas" gomb a Kedvenc gomb mellett (`bubble-actions` div)
- Canvas-szal general szep kepes kartyat: gradiens hatter, emoji, uzenet szoveg, datum, "DailyBot" felirat
- `createShareCard()` fuggveny: 720x960 PNG kep
- `wrapText()` segedfuggveny sortoreshez, `roundRect()` lekerekitett teglalapokhoz
- Telefonon: `navigator.share()` nativ megosztas kepkent (WhatsApp, Messenger, Instagram stb.)
- Gepen: `navigator.clipboard` fallback vagy PNG letoltes

### Napszak-fuggo hatter

Az ora alapjan automatikusan valtozik (`getHours()`):
- **Reggel** (5–8): narancs gradiens (napfelkelte)
- **Nappal** (8–17): kek-lila-rozsaszin gradiens + CSS csillagok (`twinkle`)
- **Este** (17–20): narancs-lila-sotetlila gradiens (naplemente)
- **Ejjel** (20–5): sotet kek-indigo gradiens

A `theme-color` meta tag (`#themeColor`) dinamikusan koveti a napszakot — Android status bar egybeolvad a hatterrel.

### Unnepi oltozekek

A robot naphoz kotodo emoji oltozeket visel:
- **Mama szulinapja (apr 4–5.)** — szulinapi mod:
  - Fix uzenet: "Boldog 63. szulinapot, draga Mama!"
  - Arany-rozsaszin-lila gradiens hatter, lebego lufik/konfetti (birthday-balloon animacio)
  - Robot: 🥳 sapka, 🎂 arc, 🎀 nyak
- Husvet (dinamikus datumszamitas), Karacsony (dec 20–26), Mikulas (dec 6)
- Szilveszter (dec 31), Ujev (jan 1), Halloween (okt 31), Valentin-nap (feb 14)
- Aprilis bolondok (apr 1), Robot szulinapja (mar 26)
- Nemzeti unnepek: marc 15, aug 20, okt 23

### UI elemek

- **Szovegbuborek**: uveg-blur hatter, szivecske a sarkan, CSS transition animacio
- **Gepelo effekt**: `typeText()` fuggveny — betuenkent irja ki a szoveget villogo kurzorral
- **Konfetti effekt**: DOM elemek `fly` animacioval
- **Streak szamlalo**: egymast koveto napok szama (8 AM alapu)
- **Idojaras animaciok**: valos idojaras alapjan eso/ho/napsutes (Open-Meteo API + geolocation)
- **Drag interakcio**: robot huzhato, CSS glow effekttel reagal (::before pseudo-element, iOS kompatibilis)
- **Tap reakcio**: koppintasra integet es robot hangokat ad ("bi-bu-bi!")
- **Visszaszamlalo**: az app aljan mutatja mikor erkezik a kovetkezo uzenet (kovetkezo reggel 6-ig szamol vissza)
- **Kedvenc gomb**: uzenet buborekban, elmentheto kedvencek listaja
- **Megosztas gomb**: kepes kartya generalas es megosztas

### Napi korlatozas

- Naponta 1 uzenet — a robot koppintasa csak egyszer ad uj uzenetet
- Ha mar latta a felhasznalo (`seen()` true), a koppintas csak tap-reakciot valt ki (integetes + "Hello!")
- A `mark()` fuggveny rogziti `localStorage`-ba (`nu_d` kulcs) hogy ma mar latta
- A `!done&&!seen()` feltetel biztositja az 1 uzenet/nap korlatot
- A nap reggel 6-kor valt (`msgDay()` fuggveny)
- Az app aljan (`#nextMsg` elem) visszaszamlalo jelenik meg a kovetkezo reggel 6 oraig

### Ertesitesek

- **Service Worker** (`sw.js`, cache v9)
- Belepeskor: ha meg nem lattad a mai uzenetet, azonnal kuld ertesitest
- SW utemez 3 ertesitest naponta: reggel 6, delben 12, este 18 (setTimeout, amig a SW el)
- `periodicSync` (Android Chrome): 4 oranként hatterbeli emlekeztetо, csak ha az app nincs nyitva
- Engedelykerest az elso robot-koppintaskor ker
- `renotify: true` — minden ertesites megjelenik (nem deduplikalja)
- `index.html` → network-first cache strategia (mindig friss tartalom)

## File Structure

```
index.html          — teljes alkalmazas (CSS + JS beagyazva)
manifest.json       — PWA manifest (standalone, maskable ikonok)
sw.js               — Service Worker (cache v9 + ertesitesek)
CLAUDE.md           — fejlesztoi utmutato Claude Code szamara
README.md           — felhasznaloi dokumentacio
icon/
  dailybot-icon.png — PWA ikon (PNG, 512x512)
  dailybot-icon.svg — PWA ikon (SVG forras, robot scale 1.05)
  Gemini_Generated_Image_nkummfnkummfnkum.png — eredeti Gemini altal generalt ikon
push-server/        — (nem hasznalatban) Vercel push szerver eloallitva, de nincs deployolva
```

## App Icon

- Fo ikon: `icon/dailybot-icon.svg` (SVG) + `icon/dailybot-icon.png` (PNG rendereles)
- Leiras: feher robot kek szemekkel, szivecske mellkassal, szines gradiens hatteren (scale 1.05)
- Manifest: `any maskable` purpose mindket ikonra
- Eredeti Gemini kep: `icon/Gemini_Generated_Image_nkummfnkummfnkum.png`
- Hasznalat: PWA ikon (manifest.json + apple-touch-icon)

## Language

All user-facing text is in Hungarian (Magyar).
