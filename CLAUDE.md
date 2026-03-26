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

### Napszak-fuggo hatter

Az ora alapjan automatikusan valtozik (`getHours()`):
- **Reggel** (5–8): narancs gradiens
- **Nappal** (8–17): kek-lila-rozsaszin gradiens + CSS csillagok (`twinkle`)
- **Este** (17–20): narancs-lila-sotetlila gradiens
- **Ejjel** (20–5): sotet kek-indigo gradiens

### Unnepi oltozekek

A robot naphoz kotodom emoji oltozeket visel:
- Husvet (dinamikus datumszamitas), Karacsony (dec 20–26), Mikulas (dec 6)
- Szilveszter (dec 31), Ujev (jan 1), Halloween (okt 31), Valentin-nap (feb 14)
- Aprilis bolondok (apr 1), Robot szulinapja (mar 26)
- Nemzeti unnepek: marc 15, aug 20, okt 23
- Hetfotol penitkig: random napi emoji-kiegeszitok

### UI elemek

- **Szovegbuborek**: sarga gradiens, szivecske a sarkan, CSS transition animacio
- **Gepelo effekt**: `typeText()` fuggveny — betuenkent irja ki a szoveget villogo kurzorral
- **Konfetti effekt**: DOM elemek `fly` animacioval
- **Streak szamlalo**: egymast koveto napok szama

## File Structure

```
index.html          — teljes alkalmazas (CSS + JS beagyazva)
manifest.json       — PWA manifest
sw.js               — Service Worker (offline tamogatas)
CLAUDE.md           — fejlesztoi utmutato Claude Code szamara
icon/
  dailybot-icon.png — PWA ikon (PNG)
  dailybot-icon.svg — PWA ikon (SVG)
  Gemini_Generated_Image_nkummfnkummfnkum.png — eredeti app ikon
```

## App Icon

- Helye: `icon/Gemini_Generated_Image_nkummfnkummfnkum.png`
- Leiras: aranyos feher robot kek szemekkel, villanykortevel a fejen, sarga szovegbuborekot tart szivecskevel
- Hasznalat: PWA ikon (manifest.json + apple-touch-icon)

## Language

All user-facing text is in Hungarian (Magyar).
