# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"Napi Uzenet" — napi motivacios uzenet alkalmazas iPhone-ra (PWA). Egy elethu CSS robot all a kepernyo kozepen animaciokkal (lebeges, pislogas, antenna pulzalas). Megnyomod → a robot "beszel" animacio, majd folotte sarga kepregeny-szovegbuborekban gepeloeffekttel megjelenik a napi uzenet. Naponta 1 uzenet, mint a TopJoy napi kupak.

## Tech Stack

- **Egyetlen HTML fajl** (`index.html`) — beagyazott CSS + vanilla JS, nincsenek fuggosegek
- **PWA** — `manifest.json` + `sw.js` service worker + apple-mobile-web-app meta tagek, iPhone-on kezdokepernyore teheto
- **Hosting**: GitHub Pages — `https://kovrat12345678.github.io/napi-uzenet/`
- **Lokalis fejlesztes**: XAMPP — `http://localhost/napi%20üzenet%20hivatalos/`

## Architecture

- **365 uzenet** a `M` tombben az `index.html` `<script>` reszeben, 12 kategoriabol:
  - Motivacio, Humor, Bolcsesseg, Erzelmek, Kitartas, Mindfulness, Kreativitas, Eletbolcsesseg, Energia, Termeszet, Vicces, Melyseg
- Napi uzenet kivalasztas: datum-alapu seed (`ev*10000 + ho*100 + nap`) → determinisztikus index, evente mas sorrend
- `localStorage` kulcsok: `nu_s` (streak szam), `nu_l` (utolso latogatas datuma), `nu_d` (ma mar latta-e), `nu_uid` (felhasznalo azonosito)

### Robot

- Teljes CSS-only rajz animaciokkal:
  - **Idle**: lebeges (`float`), szem pislogas (`eyeIdle`), antenna pulzalas (`glow`), sziv dobolas (`heartbeat`)
  - **Beszed**: szaj animacio (`speak`), kar mozgas (`waveL/R`), mellkas LED-ek (`dotPulse`), szem fenyesedes
  - **Boldog**: mosolygo szaj, hunyorgo szemek, karok felfele
  - **Excited**: ugralас, tapsolas, ragyogo szemek (energia/motivacio uzeneteкnel)
  - **Caring**: gyenged ringas, lila feny, olelo karok (erzelmes uzeneteknel)
  - **Thinking**: lassabb pislogas, kerdojel antenna (elmelkedo uzeneteknel)
  - **Dancing**: tancolo mozgas, gyors kar lengetеs (vicces/humor uzeneteknel)
  - **Love**: rozsaszin tema, szives mellkas, ringo animacio (marc 28. Kovrat nap)
- Reakcio kivalasztas: `pickReaction()` fuggveny az uzenet szovege es emojija alapjan

### Napszak-fuggo hatter

Az ora alapjan automatikusan valtozik (`getHours()`):
- **Reggel** (5–8): narancs gradiens
- **Nappal** (8–17): kek-lila-rozsaszin gradiens + CSS csillagok (`twinkle`)
- **Este** (17–20): narancs-lila-sotetlila gradiens
- **Ejjel** (20–5): sotet kek-indigo gradiens

### Unnepi oltozekek

A robot naphoz kotodo emoji oltozeket visel:
- **Kovrat nap (marc 28.)** — egesz napos kulonleges mod:
  - Fix uzenet: "Kovrat uzeni: Szep napot mindenkinek! ❤️"
  - Robot `love` osztaly: rozsaszin/piros tema, pink szemek, piros antenna, ringo animacio
  - Rozsaszin-piros gradiens hatter 30 lebegoо szivecskevel (love-heart animacio)
  - Marc 29-en automatikusan visszaall
- Husvet (dinamikus datumszamitas), Karacsony (dec 20–26), Mikulas (dec 6)
- Szilveszter (dec 31), Ujev (jan 1), Halloween (okt 31), Valentin-nap (feb 14)
- Aprilis bolondok (apr 1), Robot szulinapja (mar 26)
- Nemzeti unnepek: marc 15, aug 20, okt 23

### UI elemek

- **Szovegbuborek**: sarga gradiens, szivecske a sarkan, CSS transition animacio
- **Gepelo effekt**: `typeText()` fuggveny — betuenkent irja ki a szoveget villogo kurzorral
- **Konfetti effekt**: DOM elemek `fly` animacioval
- **Streak szamlalo**: egymast koveto napok szama
- **Idojaras animaciok**: valos idojaras alapjan eso/ho/napsutes (Open-Meteo API + geolocation)
- **Drag interakcio**: robot huzhato, meglepett arckifejezеssel reagal
- **Tap reakcio**: koppintasra integet es robot hangokat ad ("bi-bu-bi!")
- **Visszaszamlalo**: az app aljan mutatja mikor erkezik a kovetkezo uzenet (masnapig reggel 8-ig szamol vissza, masodpercenkent frissul)

### Napi korlatozas

- Naponta 1 uzenet — a robot koppintasa csak egyszer ad uj uzenetet
- Ha mar latta a felhasznalo (`seen()` true), a koppintas csak tap-reakciot valt ki (integetes + "Hello!")
- A `mark()` fuggveny rogziti `localStorage`-ba (`nu_d` kulcs) hogy ma mar latta
- A `!done&&!seen()` feltetel biztositja az 1 uzenet/nap korlatot
- Az app aljan (`#nextMsg` elem) visszaszamlalo jelenik meg a kovetkezo reggel 8 oraig

### Push ertesitesek

- **Service Worker** (`sw.js`) — naponta pontosan reggel 8-kor kuld ertesitest
- `scheduleDaily()`: setTimeout-tal utemezi a kovetkezo reggel 8 orat, SW eletcikluson belul ujraindul
- `tag: 'daily-' + today`: naponta max 1 ertesites (tag alapu deduplikalas, Android + iOS)
- `periodicSync` (Android Chrome): hatterbeli szinkronizacio napi intervallumon
- `visibilitychange`: ha az app eloterbe kerul es 8 ora utan vagyunk, ellenorzi volt-e mar ertesites
- Engedelykerest az elso robot-koppintaskor ker
- `index.html` → network-first cache strategia (mindig friss tartalom)

## File Structure

```
index.html          — teljes alkalmazas (CSS + JS beagyazva)
manifest.json       — PWA manifest
sw.js               — Service Worker (cache + push ertesitesek)
CLAUDE.md           — fejlesztoi utmutato Claude Code szamara
README.md           — felhasznaloi dokumentacio
icon/
  dailybot-icon.png — PWA ikon (PNG)
  dailybot-icon.svg — PWA ikon (SVG forras)
  Gemini_Generated_Image_nkummfnkummfnkum.png — eredeti app ikon
```

## App Icon

- Helye: `icon/Gemini_Generated_Image_nkummfnkummfnkum.png`
- Leiras: aranyos feher robot kek szemekkel, villanykortevel a fejen, sarga szovegbuborekot tart szivecskevel
- Hasznalat: PWA ikon (manifest.json + apple-touch-icon)

## Language

All user-facing text is in Hungarian (Magyar).
