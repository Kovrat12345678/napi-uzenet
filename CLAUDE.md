# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"Napi Uzenet" — napi motivacios uzenet alkalmazas iPhone-ra (PWA). Egy elethU CSS robot all a kepernyo kozepen animaciokkal (lebeges, pislogas, antenna pulzalas). Megnyomod → a robot "beszel" animacio, majd folutte sarga kepregeny-szovegbuborekban gepeloeffekttel megjelenik a napi uzenet. Naponta 1 uzenet, mint a TopJoy napi kupak.

## Tech Stack

- **Egyetlen HTML fajl** (`index.html`) — beagyazott CSS + vanilla JS, nincsenek fuggosegek
- **PWA** — `manifest.json` + apple-mobile-web-app meta tagek, iPhone-on kezdokepernyore teheto
- **XAMPP** — lokalis fejlesztes: `http://localhost/napi%20üzenet%20hivatalos/`
- **Tavoli eleres telefonrol**: `http://192.168.1.167/napi%20üzenet%20hivatalos/` (ugyanazon WiFi-n)

## Architecture

- **365 uzenet** a `M` tombben az `index.html` `<script>` reszeben, 12 kategoriabal:
  - Motivacio, Humor, Bolcsesseg, Erzelmek, Kitartas, Mindfulness, Kreativitas, Eletbolcsesseg, Energia, Termeszet, Vicces, Melyseg
- Napi uzenet kivalasztas: datum-alapu seed (`ev*10000 + ho*100 + nap`) → determinisztikus index, evente mas sorrend
- `localStorage` kulcsok: `nu_s` (streak szam), `nu_l` (utolso latogatas datuma), `nu_d` (ma mar latta-e)
- Robot: teljes CSS-only rajz animaciokkal:
  - Idle: lebeges (`float`), szem pislogas (`eyeIdle`), antenna pulzalas (`glow`), sziv dobolas (`heartbeat`)
  - Beszed: szaj animacio (`speak`), kar mozgas (`waveL/R`), mellkas LED-ek (`dotPulse`), szem fenyesedes
  - Boldog: mosolygo szaj, hunyorgo szemek, karok felfele
- Szovegbuborek: sarga gradiens (mint az ikonon), szivecske a sarkan, CSS transition animacio
- Gepelo effekt: `typeText()` fuggveny — betuenkent irja ki a szoveget villogo kurzorral
- Konfetti effekt: DOM elemek `fly` animacioval
- Hatter: kek-lila-rozsaszin gradiens + CSS csillagok (`twinkle` animacio)

## App Icon

- Helye: `icon/Gemini_Generated_Image_nkummfnkummfnkum.png`
- Leiras: aranyos feher robot kek szemekkel, villanykortevel a fejen, sarga szovegbuborekot tart szivecskevel
- Hasznalat: PWA ikon (manifest.json + apple-touch-icon)

## Language

All user-facing text is in Hungarian (Magyar).
