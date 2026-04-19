# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"Napi Uzenet" (DailyBot) — napi gondolat alkalmazas iPhone-ra es Androidra (PWA). Egy elethu CSS robot all a kepernyo kozepen animaciokkal (lebeges, pislogas, antenna pulzalas). Megnyomod → a robot "beszel" animacio, majd folotte szovegbuborekban gepeloeffekttel megjelenik a napi uzenet. Naponta 1 uzenet, TopJoy stilusu (csendes, koltoei, elmelkedo).

A napi uzenet melle **gem-alapu gazdasag** is tartozik: DailyBox, Daily Pouch, Daily Gem, Bot Pass (havi 60 szint) + bolti vasarlasok. Kesobb App Store-ba es Play Aruhazba kerul (Capacitor).

## Tech Stack

- **Egyetlen HTML fajl** (`index.html`) — beagyazott CSS + vanilla JS, nincsenek fuggosegek
- **PWA** — `manifest.json` + `sw.js` service worker + apple-mobile-web-app meta tagek
- **Hosting**: GitHub Pages — `https://kovrat12345678.github.io/napi-uzenet/`
- **Lokalis fejlesztes**: XAMPP — `http://localhost/napi%20üzenet%20hivatalos/`

## Architecture

### Napi uzenet

- **365 uzenet** a `M` tombben az `index.html` `<script>` reszeben, 12 kategoriabol
- **Uzenet stilus**: TopJoy-szeru — rovid, ketmondatos, csendes, koltoei, elmelkedo
- Napi uzenet kivalasztas: datum-alapu hash seed (datum XOR uid)
- **Reggel 6 logika**: `msgDay()` — ha `getHours() < 6`, az elozo nap szamit uzenet-napnak
- `td()` = `msgDay().toDateString()` — minden napi limit, streak, loot reset ezt hasznalja

### localStorage kulcsok

**Uzenet + felhasznalo:**
- `nu_s` (streak), `nu_l` (utolso latogatas), `nu_d` (mai seen flag), `nu_uid`
- `nu_reg`, `nu_name` (onboarding)
- `nu_favs` (kedvencek JSON)

**Kinezet + birtoklas:**
- `nu_owned` (feloldott targyak JSON tomb — skin, bg, aura, accessory, dance)
- `nu_active_skin`, `nu_active_bg`, `nu_active_aura`, `nu_active_acc`, `nu_active_dance`
- `nu_stickers` (feloldott sticker ID-k JSON tomb)
- `nu_active_sticker` (aktiv sticker ID, default: `sticker-hello`)
- `nu_cards` (feloldott DailyCard ID-k JSON tomb)

**Gazdasag:**
- `nu_gems` (gem egyenleg, default 50)
- `nu_box_day`, `nu_box_count` (napi DailyBox — 1/nap)
- `nu_pouch_day`, `nu_pouch_free` (napi ingyen Pouch)
- `nu_spin_day` (Daily Gem mai claim)
- `nu_daily_deal_day`, `nu_daily_deal_item` (napi akcio)
- `nu_kovrat_bonus` (Kovrat egyszeri 10000 gem flag)
- `nu_zynox_lucky` (ZYNOX kod aktivalt szerencse bonusz)

**Bot Pass:**
- `nu_botpass_month` (aktualis honap YYYY-MM), `nu_botpass_level` (0-60), `nu_botpass_xp` (0-100)
- `nu_botpass_claimed` (begyujtott szintek JSON — alap track)
- `nu_botpass_plus_claimed_YYYY-MM` (Plus track begyujtott szintek JSON, per-honap)
- `nu_botpass_last` (utolso napi boost datuma)
- `nu_botpass_plus_YYYY-MM` (Plus aktival adott honapra)
- `nu_mission_open_day`, `nu_mission_box_day`, `nu_mission_pouch_day`, `nu_mission_gem_day`, `nu_mission_bonus_day` (napi kuldetesek teljesitese)

**Jatek:**
- `nu_game_api_url` (Vercel push-server URL — multiplayer-hez kell, pl. `https://YOUR.vercel.app`)

### Onboarding (regisztracio)

- Elso megnyitaskor 2 lepesu regisztracio: Intro → Keresztnev
- Csak utonevt ker — szokoz tiltva az inputban
- `#appMain` CSS-bol rejtett (`pre-reg` class) amig a regisztracio nem kesz

### Loading Screen

- Lekerekitett ikon (`dailybot-icon.png`) + progress bar + szazalek
- ~2 mp alatt tolt be, fade out

### Robot

- Teljes CSS-only rajz animaciokkal: idle lebeges, szem pislogas, antenna pulzalas
- Reakcio kivalasztas `pickReaction()` fuggvennyel: Idle, Beszed, Boldog, Excited, Caring, Thinking, Dancing

## Gazdasag rendszer

### Gem pnznem

- `nu_gems` localStorage (default 50 induloknak)
- `addGems(n)`, `spendGems(n)` — helper fuggvenyek
- Megjelenites: `💎 {szam}` a shop headerben (`[data-gem-display]` szelektor)

### DailyBox (napi 1)

- `boxesRemaining()` — visszaadja a maradt dobozokat (1/nap, msgDay reset)
- Shop kartya (👉 `shopBoxBtn`), nagy 3D CSS ajandekdoboz (gift-box)
- Full-screen overlay: szam (1 vagy 2) — 25% eselle 2-es (lucky box)
  - 1-es: 1 nyeremeny
  - 2-es: 1 normal + 1 SUPER nyeremeny (dragabb item / sok gem)
- Loot tablak: `rollNormalPrize()` / `rollSuperPrize()` (Zynox szorzokkal)

### DailyPouch (napi 1 + 60 gemert)

- `pouchFreeAvailable()` — mai ingyenes elerheto-e
- Accessories + dance-ek + sticker-ek + DailyCard-ok nyerhetok
- Rarity soulyozas: common 60%, rare 30%, epic 8%, legendary 2%

### Daily Gem (napi 1)

- `spunToday_gem()` — mai claim-e
- Egyszerű kartya gomb ("Megnyit")
- Nyeremeny: 10-150 gem (ritka 150), Zynox aktiv: 25-200 gem
- `gem-flash` animacio a gem megszerzesekor

### Bolt (Skin Shop)

- **Tarsyra sorolas:**
  - SKINS, BGS, AURAS, ACCESSORIES, DANCES tombok
  - rarity rendszer: common / rare / epic / legendary / mythic (ar alapjan, `getRarity(id)`)
  - Rarity cimke (`shop-item-rarity-label`) az ikon ALATT, gradient hatterrel
  - **A shop itemek mini robotot mutatnak** (nem emoji ikont) — `buildMiniRobotHtml(skinId, large)`
- **Vasarlas**: `ITEM_PRICES[id]` alapjan — `💎 AR` gomb (`.buy-tag`) → megerosito modal
- **Aktivacios animacio**: `triggerSkinEquipEffect()` — feher flash overlay + 24 csillag sugaraban szetszorodva + robot brightness pulse + `playSfx('skin-equip')` csilingelo hang

### Tárgy árak (ITEM_PRICES)

```
Skinek:
  tulip/sakura/graffiti: 100
  stealth/galaxy/fire: 200
  golden/diamond/horse/prism: 400
  aurora: 500
  rainbow: 600
  super/glass/gamer: 1000
  phoenix: 900
  ultra: 999
  ultra-black: 1500 (Plus exkluziv, elrejtett)

Hátterek:
  tulip/sakura/graffiti: 80
  galaxy/stealth/fire: 150
  golden/diamond/glass: 300
  rainbow/gamer: 500
  nebula: 700, aurora: 800, infinity: 1200

Aurák:
  tulip/sakura: 50
  fire/glitch: 120
  halo/rgb: 250
  diamond: 400
  celestial: 600, cosmic: 800, prism: 1000
```

### Rarity arak

| Tipus | Common | Rare | Epic | Legendary | Mythic |
|-------|--------|------|------|-----------|--------|
| Skin | 100 | 200 | - | 400 | 600-1000 |
| Hatter | 80 | 150 | 300 | 500 | 700-1200 |
| Aura | 50 | 120 | 250 | 400 | 600-1000 |

### Accessories (kiegeszitok)

12 robot kiegeszito, SVG rajzolasokkal (nem emoji), slot-okra osztva:

- **Hat**: Korona, Cilinder, Baseball, Diplomas, Virag, Tok
- **Face**: Napszemuveg, Goggle, Alarc
- **Neck**: Masni, Lanc, Gyemant

Pouch-bol szerezhetok. `ACCESSORY_SVG` objektum tartalmazza a kezzel rajzolt SVG-ket. `applyAcc()` az outfit slot-ba (`outfitHat`/`outfitFace`/`outfitNeck`) tolti be az SVG-t. `outfit-acc-rendered` CSS class kezeli a nagy meretezest.

### Bot Dances (robot tancok)

6 CSS-based tanc animacio:
- `dance-bob` (Bolgoatas, common), `dance-shake` (Razas, common)
- `dance-twist` (Csavar, rare), `dance-wobble` (Hullam, rare)
- `dance-jump` (Ugras, epic)
- `dance-spin` (Porges, legendary)

`applyDance()` az aktualis tanc CSS class-t applikalja a `#robot`-ra. Pouch-bol es Bot Pass mérföldköveibol szerezhetok.

### Bot Pass

**Havi jutalomsor 60 szinten.** Minden honap 1-én reset (`_monthKey()` = `YYYY-MM`).

**Progresszio — Bot Points (BP) rendszer:**
- 4 napi kuldetes (`getMissionStatus()`):
  - Nyisd meg a DailyBot-ot (+40 BP) — automatikus elso belepeskor
  - Nyiss egy DailyBox-ot (+20 BP)
  - Nyiss egy Daily Pouch-ot (+20 BP)
  - Szerezd meg a Daily Gem-et (+20 BP)
- **Mind a 4 teljesitve = +40 BP bonusz** (napi max 140 BP)
- 100 BP = 1 szint

**Gem skip**: 60 gemert azonnali +1 szintlepes (`gemSkipLevel()`).

**Dual-track layout (Brawl Stars-ihletett):**
- Felső sor: **Plus track** (lezart, arany csillag ikonnal, 999 gem megvételért)
- Kozepso sor: szint szamok + "TE VAGY ITT" marker
- Also sor: **Alap track** jutalmakkal
- Hatter vonal (`bp-track-line`): 5-szinu aramlo gradient + progress (arany+pink glow)
- Node-ok (128px): 38px kor szam badge, 46px ikon, lebego animacio
- Milestone node-ok (140px, scale 1.05): korona felettük
- "TE VAGY ITT" pulzalo marker az aktualis szint alatt
- Claim celebration: 18 reszecske szétrepül
- 20 csillagos hatter
- `playSfx('bp-claim')` C-E-G-C akkord minden claim-nel
- `playSfx('bp-skip')` whoosh minden skip-nel

**Szint jutalmak** (`botpassReward(lvl)` / `botpassPlusReward(lvl)`):
- 1/5 lvl: gem (mennyiseg lvl fuggo)
- 2/5 lvl: DailyBox (azonnal megnyithato, nem naplimit-t fogyaszt)
- 3/5 lvl: gem
- 4/5 lvl: Pouch (azonnal megnyithato)
- 5/5 lvl: gem bonusz
- Milestone szintek (5, 10, 15... 60): exkluziv jutalmak
  - 5: Bolgoatas tanc, 15: Razas, 25: Csavar, 35: Hullam, 45: Ugras, 55: Porges tancok
  - 10: 100 gem, 20: Fire Skin, 30: 200 gem
  - 40: Golden Skin, 50: Gyemant Aura, 60: Rainbow Skin

**Bot Pass Plus (999 gem)**:
- Plus track egybol claim-elheto minden szinten
- Parhuzamos jutalmak (duplan) a Plus track-en
- Ultra Black skin exkluzivkent a Plus milestone-ban
- `nu_botpass_plus_claimed_YYYY-MM` per-honap tarolas

### DailyCard rendszer

18 kartya, minden SKIN-hez egy. Hosszan nyomva a robotot nyilik a gyujtemen.

```
Kozos: Alap Bot, Tulipan Bot, Sakura Bot, Graffiti Bot (common)
Ritka: Galaxy Bot, Stealth Bot, Fire Bot, Gamer Bot (rare)
Legendas: Golden Bot, Diamond Bot, Glass Bot, Lovas Bot, Rainbow Bot, Super Bot (legendary)
Mitikus: Prism Bot, Phoenix Bot, Aurora Bot, Ultra Bot (mythic)
```

- Duplikatum → gem (common:20, rare:40, epic:60, legendary:80, mythic:120)
- Kartya megnyomva: teljes kepernyon nézet a mini robottal
- localStorage: `nu_cards` JSON tomb

### Matricák (STICKERS) rendszer

30 koszones sticker, rarity-vel. A fejlecben az aktiv sticker szovege jelenik meg.

```
Common (6): Hello, Szia, Hey, Hi, Csa, Csao
Rare (11): Yo, Howdy, Sup, Wassup, Heya, Bonjour, Hola, Hallo, Salut, Privet, Hej
Epic (6): Aloha, Ciao, Ola, Annyeong, Csokolom, Beep boop
Legendary (5): Kon'nichiwa, Greetings, Udv kalandor, Az ero veled, Live long
Mythic (3): Cosmic Hi, Galaxy salute, Quantum hello
```

- `nu_stickers` JSON tomb, `nu_active_sticker` aktiv ID
- `sticker-hello` mindig megvan (default)
- Pouch-bol szerezhetok

### Daily Deal

- Shop legaljan egy random item 25% kedvezmennyel
- `getDailyDeal()` — napi deterministic pick
- Ha birtokolt → automatikusan uj deal-t sorsol

### ZYNOX tamogatoi kod

- Shop legaljan "Tamogatas" szekció, input + Aktival gomb
- Helyes kod: **ZYNOX** → `nu_zynox_lucky = '1'`
- Aktiv allapotban: jobb loot tablak, Daily Gem 25-200 pool
- Aktivacios animacio: flash + csillagok + misztikus harang akkord

### Kovrat welcome bonus

- Ha `nu_name` === 'Kovrat' (case insensitive) es `nu_kovrat_bonus` nincs beallitva
- Arany doboz overlay → 10 000 gem jovairva

### Update modal

- `CURRENT_VERSION` konstans az app elejen
- Ha a localStorage `nu_last_ver` eltér, modal jelenik meg (`#updateModal`)
- 100 gem ajanddek minden uj verziohoz (egyszer, per verzio)

### Admin panel

- **Hosszan nyomva a gem kijelzot** → admin panel nyilik
- Gem vasarlas szimulacio (100 / 500 / 1000 gem pakkok)
- Csak teszteléshez

## Skinek teljes listája

```
Alap     (ingyenes, ID: '')
Tulipán  (ingyenes → botpass/loot)
Galaxy   (200 gem)
Sakura   (100 gem)
Graffiti (100 gem)
Stealth  (200 gem)
Fire     (200 gem → BP milestone 20)
Gamer    (1000 gem)
Golden   (400 gem → BP milestone 40)
Diamond  (400 gem)
Horse    (400 gem)
Rainbow  (600 gem → BP milestone 60)
Super    (1000 gem)
Prism    (400 gem)
Phoenix  (900 gem)
Aurora   (500 gem)
Ultra    (999 gem)
Ultra Black (1500 gem, hide:true — Plus exkluziv)
Dragon   (titkos rejtveny, hide:true)
```

**Ultra Bot**: egységes fehér robot (Diamond szerkezettel), pink neon csíkok csak a törzsön (2 db), pink szem/antenna/száj/mellpont, halvány halo aura.

**Ultra Black Bot**: pontosan ugyanaz mint Ultra, de sötét (fekete/dark navy) test. Pink accent azonos. Plus Pass exkluzív.

## Hang rendszer

Web Audio API-val szintetizált hangok (`_sfxCtx()` + `playSfx(type)`):
- `box-open`: unwrap arpeggio C-E-G + chime (C#5)
- `pouch-open`: ascending triad
- `gem-claim`: magas csengő
- `skin-equip`: sawtooth sweep 220→1760 Hz + shimmer
- `bp-claim`: ünneplő C-E-G-C akkord
- `bp-skip`: power-up whoosh
- `zynox`: misztikus harang akkord (5 hang pentatonikus)
- `error`: disharmonic sawtooth lefele

Kulon AudioContext (`window._sfxAudioCtx`) a háttérzenehez képest.

## Alkalmazás háttérzene

Idő-alapú háttérzene (`initAppAmbient`), napszak szerint váltakozik:

- **Reggel** (6-12): G dúr triád, magasabb bell pentatonikus, rövid delay
- **Nappal** (12-18): C dúr triád, meleg bell, mid delay
- **Este/éjjel** (18-6): A moll triád, lágy bell, hosszú delay, ritkább

Elso user gesture (click/touch) utan indul. Nem kikapcsólhato. Master gain 0.04-0.06.

## Sárkány Hét (2026. ápr. 11-17)

- Robot skin override (`dragon-week` class)
- Hatter override (`bg-dragon-week`)
- Kod reteg, parazsz reszecskek
- Tap = tuzokadas (`window._dragonWeekActive`)
- Ikon override es sarkany zene TOROLVE

## Robot Battle jatek

Fockepernyoen alul "⚔️ Robot Harc" gomb → `#gamePanel`.

### AI mod

- `startGameVsAi()` — skin valaszto, majd harc indul
- Vertikalis arena: ellenfél felül, te alul
- ◄ ► gombok mozgashoz (`GAME_PLAYER_STEP = 40px`)
- HP rendszer: 3 elet mindket félnek
- Lövedekek: `fireBullet(from, x)` — CSS animacio
- AI: velett szerű lövések + mozgás, nehezseg emelkedik
- Kepesseg gomb: skin-specifikus különleges (cooldown-nal)

### Képességek (GAME_ABILITIES)

| Skin | Kepesseg | CD |
|------|----------|----|
| Tulipan | Tulipan pancel (10s, ved) | 14s |
| Sakura | Cseresznye gyogyitas | 14s |
| Graffiti | Spray sorozat (multi) | 8s |
| Galaxy | Csillagrobbantas | 8s |
| Stealth/Glass | Lathatatlanság (5s) | 10s |
| Fire | Tuzgolyo 2x | 8s |
| Gamer | Rapid fire 3x | 8s |
| Golden | Arany csapas | 8s |
| Diamond/Super | Jegpajzs/Hos pajzs (6s) | 12s |
| Horse | Lopatko | 9s |
| Rainbow | Szivarv any tuz 3x | 10s |
| Ultra | EMP villam 3x | 10s |
| Prism | Prizma sugar | 9s |
| Phoenix | Ujjaszuletes (revive) | 18s |
| Aurora | Aurora pajzs (7s) | 12s |
| Alap | Energia lökes | 7s |

### Multiplayer (cross-device)

**FONTOS: Vercel deployment-et igenyel!**

**Setup:**
1. Deploy-old a `push-server/` mappat Vercel-re
2. Vercel KV adatbazist kapcsolj be a projekthez (Vercel dashboard → Storage)
3. Az appban a böngésző konzolban futtasd:
   ```js
   localStorage.setItem('nu_game_api_url', 'https://YOUR-PROJECT.vercel.app');
   ```
4. Ujratoltes utan a "Uj szoba" gomb aktiv lesz

**Hogyan jatszik ket szemely:**
- **1. jatekos**: Skin valaszt → "Uj szoba letrehozasa" → megkapja a 5-jegyu kodot
- **2. jatekos**: Ugyanazt a kodot beirja a "Csatlakozas" mezőbe → "Csatlakozas" gomb
- A szoba 5 percig el (ROOM_TTL = 300s), polling 800ms-kent (`startMpPoll`)
- Events: `move`, `hit`, `hp`, `end`

**API vegpontok** (`push-server/api/game.js`):
- `create`, `join`, `poll`, `event`, `leave`
- Vercel KV-ban tarolva: `game:{code}` kulcsokon

## Főképernyő UI

- **Robot** (kozepen)
- **Streak badge** (`#streak`): narancs→piros aramlo gradient ha aktiv
- **Shop ikon** (🏪, jobb felső sarok): `.skin-toggle`
  - **NEW piros buborek** (`shopNewBadge`) — ha bármelyik napi loot elérheto
- **Kedvencek gomb** (❤️, bal felső)
- **Szinkronizalas gomb** (🔄, shop headerben)
- **Robot Harc gomb** (⚔️, fokepernyő aljan)

## Shop szekciók sorrendje

1. **💎 Daily Gem**
2. **🎁 DailyBox** (card)
3. **👝 Daily Pouch** (card)
4. **🎖️ Bot Pass** (banner → BP panel)
5. **🤖 Skin valasztek** (horizontal scroll, mini robot mutatva)
6. **🖼️ Hátterek**
7. **🔮 Aurak**
8. **🎀 Kiegeszítők** (Pouch-bol szerezheto)
9. **💃 Bot Táncok** (Pouch-bol + Bot Pass)
10. **🎴 Matricak** (Pouch-bol szerezheto)
11. **🃏 DailyCard gyujtemeny** (banner)
12. **🔥 Mai akcio** (Daily Deal)
13. **📮 Tamogatas** (ZYNOX input — LEGALUL)

## Szinkronizalas (export/import)

- 🔄 gomb a bolt headerben
- Export: base64 kodolt JSON
- `SYNC_KEYS` tomb: `nu_owned`, `nu_active_*`, `nu_favs`, `nu_s`, `nu_l`, `nu_name`, `nu_uid`, `nu_gems`, `nu_box_day/count`, `nu_pouch_day/free`, `nu_spin_day`, `nu_stickers`, `nu_active_sticker`, `nu_cards`
- Import osszefesules:
  - Owned → unio
  - Kedvencek → szoveg-alapu dedup merge
  - Gem → MAX(local, imported)
  - Napi jogosultsagok → local wins
  - Nev → feluliras

## Modern animaciok

- Shop title, Bot Pass banner/progress, streak badge, mythic items, ZYNOX, gem skip, Plus gomb: aramlo flow gradientek (flowColor keyframe)
- Shine effektek (`bpShine`): fehér sáv halad at a gombokon 3-3.5s loop

## Értesítések

- **Service Worker** (`sw.js`, cache **v52**)
- SW ütemez ertesiteseket: reggel 6
- `periodicSync` (Android Chrome): hatter emlekeztetok
- SW frissites-detektales: `reg.update()` + `skipWaiting` + `controllerchange` → `location.reload()`

## Eltávolított funkciók

- ~~Daily Super~~ — torolve (lecserelve Daily Gem-re)
- ~~Loot Info gomb~~ — torolve a shopbol
- ~~Sarkany zene~~ — lecserelve az app ambient zenere
- ~~Dragon ikon override~~ — torolve

## File Structure

```
index.html          — teljes alkalmazas (CSS + JS beagyazva)
manifest.json       — PWA manifest (standalone)
sw.js               — Service Worker (cache v52 + ertesitesek + skipWaiting)
CLAUDE.md           — fejlesztoi utmutato Claude Code szamara
README.md           — felhasználói dokumentacio
bg-tulip.png        — Tavaszi Ret hatter kep
bg-glass.png        — Labor Glass hatter kep
bg-graffiti.png     — Graffiti hatter kep
icon/
  dailybot-icon.png — PWA ikon (PNG, 512x512)
  dailybot-icon.svg — PWA ikon (SVG forras)
  dragon-icon.svg   — Sarkany Het ikon (jelenleg nincs hasznalva)
push-server/
  api/
    game.js         — Robot Battle multiplayer endpoint (Vercel KV)
    notify.js       — Push ertesites kuldő (Vercel Cron)
    subscribe.js    — Push feliratkozas tarolo
  vercel.json       — Vercel config (cron + CORS headers)
docs/superpowers/
  specs/2026-04-18-gem-economy-design.md
  plans/2026-04-18-gem-economy.md
```

## App Icon

- `icon/dailybot-icon.png` — alap ikon, mindig ez van hasznalva
- (A Sarkany Het alatt NINCS ikon override — regi funkció eltavolitva.)

## Social

- TikTok: http://www.tiktok.com/@dailybot_dailymessage (link az app alján)

## Language

All user-facing text is in Hungarian (Magyar).
