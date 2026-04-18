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
- `nu_botpass_claimed` (begyujtott szintek JSON)
- `nu_botpass_last` (utolso napi boost datuma)
- `nu_botpass_plus_YYYY-MM` (Plus aktival adott honapra)
- `nu_mission_open_day`, `nu_mission_box_day`, `nu_mission_pouch_day`, `nu_mission_gem_day`, `nu_mission_bonus_day` (napi kuldetesek teljesitese)

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
- Accessories + dance-ek nyerhetok (nem skin/bg/aura)
- Rarity soulyozas: common 60%, rare 30%, epic 8%, legendary 2%
- 65% accessory / 35% dance eloszlas
- CSS erszeny vizual (`coin-pouch`)

### Daily Gem (napi 1)

- `spunToday_gem()` — mai claim-e
- Szerencsekerek helyett egyszerű kartya gomb ("Megnyit")
- Nyeremeny: 10-150 gem (ritka 150), Zynox aktiv: 25-200 gem
- `gem-flash` animacio a gem megszerzesekor

### Bolt (Skin Bolt)

- **Tarsyra soroles:**
  - SKINS, BGS, AURAS, ACCESSORIES, DANCES tombok
  - rarity rendszer: common / rare / epic / legendary / mythic (ar alapjan, `getRarity(id)`)
  - Rarity cimke (`shop-item-rarity-label`) az ikon ALATT, gradient hatterrel
- **Vasarlas**: `ITEM_PRICES[id]` alapjan — `💎 ÁR` gomb (`.buy-tag`) → megerositő modal
- **Aktivacios animacio**: `triggerSkinEquipEffect()` — feher flash overlay + 24 csillag sugaraban szetszorodva + robot brightness pulse + `playSfx('skin-equip')` csilingelo hang

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

Pouch-bol szerezhetok. `ACCESSORY_SVG` objektum tartalmazza a kezzel rajzolt SVG-ket. Az `applyAcc()` az ünnepi outfit slot-ba (`outfitHat`/`outfitFace`/`outfitNeck`) tolti be az SVG-t, de az ünnepi öltözek mindig felülirja. `outfit-acc-rendered` CSS class kezeli a nagy méretezést (140×140 hat slot = teljes fej lefedi, mint a tok-fej).

### Bot Dances (robot tancok)

6 CSS-based tanc animacio:
- `dance-bob` (Bolgoatas, common), `dance-shake` (Razas, common)
- `dance-twist` (Csavar, rare), `dance-wobble` (Hullam, rare)
- `dance-jump` (Ugras, epic)
- `dance-spin` (Porges, legendary)

`applyDance()` az aktualis tanc CSS class-t applikalja a `#robot`-ra (`!important` override-olja az alap `float` animaciot). Pouch-bol es Bot Pass mérföldköveibol szerezhetok.

### Bot Pass

**Havi jutalomsor 60 szinten.** Minden honap 1-én reset (`_monthKey()` = `YYYY-MM`).

**Progresszio — Bot Points (BP) rendszer:**
- 4 napi küldetés (`getMissionStatus()`):
  - Nyisd meg a DailyBot-ot (+40 BP) — automatikus első belepeskor
  - Nyiss egy DailyBox-ot (+20 BP)
  - Nyiss egy Daily Pouch-ot (+20 BP)
  - Szerezd meg a Daily Gem-et (+20 BP)
- **Mind a 4 teljesitve = +40 BP bonusz** (napi max 140 BP)
- 100 BP = 1 szint

**Gem skip**: 60 gemert azonnali +1 szintlepes (`gemSkipLevel()`).

**Szint jutalmak** (`botpassReward(lvl)`):
- 1/5 lvl: gem (mennyiseg lvl fuggo)
- 2/5 lvl: DailyBox (azonnal megnyithato, nem naplim-t fogyaszt)
- 3/5 lvl: gem
- 4/5 lvl: Pouch (azonnal megnyithato)
- 5/5 lvl: gem bonusz
- Milestone szintek (5, 10, 15... 60): exkluziv jutalmak
  - 5: Bolgoatas tanc, 15: Razas, 25: Csavar, 35: Hullam, 45: Ugras, 55: Porges tancok
  - 10: 100 gem, 20: Fire Skin, 30: 200 gem
  - 40: Golden Skin, 50: Gyemant Aura, 60: Rainbow Skin

**Bot Pass Plus (999 gem)**: 
- Egyszerre auto-claim-eli az osszes 60 szintet
- Minden jutalom duplan + item jutalmakhoz +100 gem
- Osszefoglal alert: gem/box/pouch/item szamlalokkal

**Panel layout:**
- Kompakt state bar: havi cim + nagy aramlo szint szam + 22px progress bar (5-szinu gradient animalva)
- Gem skip + Plus gombok egymas alatt
- A sav: horizontalis scroll node-okkal
  - Hatter vonal (`bp-track-line`): 5-szinu aramlo gradient + progress (arany+pink glow) kitoltve az elert szintekig
  - Node-ok (128px): 38px kor szam badge, 46px ikon, lebegő animáció
  - Milestone node-ok (140px, scale 1.05): 👑 korona felettük
  - "TE VAGY ITT" pulzalo marker az aktualis szint alatt
  - Claim celebration: 18 részecske szétrepül (✨⭐💫🎉💎⚡)
- 20 csillagos háttér (lebegnek felfele)
- `playSfx('bp-claim')` C-E-G-C akkord minden claim-nel
- `playSfx('bp-skip')` whoosh minden skip-nel

### Daily Deal

- Shop legalján egy random item 25% kedvezménnyel
- `getDailyDeal()` — napi deterministic pick (nu_daily_deal_day + nu_daily_deal_item)
- Ha birtokolt → automatikusan új deal-t sorsol
- Gomb: `dealBuyBtn` — vásárlás megerősítéssel

### ZYNOX támogatói kód

- Shop legalján "📮 Támogatás" szekció, input + Aktivál gomb (nincs kiírva mit kell beírni)
- Helyes kód: **ZYNOX** → `nu_zynox_lucky = '1'`
- Aktiv állapotban:
  - Box loot: gem tier 70%→50%, gem értékek 10/20/30→20/40/60, super esélyek 60%→85%
  - Daily Gem: 10-150→25-200 pool
  - Visual: animalt gradient keret a support kártyán
- Aktivációs animáció: flash + csillagok + misztikus harang akkord
- Rossz kód: error hang + alert

### Kovrat welcome bónusz

- Ha `nu_name` === 'Kovrat' (case insensitive) és `nu_kovrat_bonus` nincs beállítva
- Arany díszített box overlay jelenik meg belépéskor
- Koppintásra megnyílik → 10 000 gem jóváírva + flag mentve
- 2s delay + visibilitychange trigger

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

Kulon AudioContext (`window._sfxAudioCtx`) a háttérzenehez képest, hogy ne ütközzön.

## Alkalmazás háttérzene

Idő-alapú háttérzene (`initAppAmbient`), napszak szerint váltakozik (10 percenként ellenőriz):

- **Reggel** (6-12): G dúr triád (G3/B3/D4), magasabb bell (G5-E6) pentatonikus, rövid delay (0.28s), gyorsabb cadence
- **Nappal** (12-18): C dúr triád (C3/E3/G3), meleg bell (C5-C6), mid delay (0.42s)
- **Este/éjjel** (18-6): A moll triád (A2/C3/E3), lágy bell (A4-A5), hosszú delay (0.58s), ritkább

Web Audio API-val: 3 szinusz pad + delay+feedback + pentatonikus bell hangok + ritka mély pulzus. Első user gesture (click/touch) után indul. Nem kikapcsolható. Master gain 0.04-0.06.

**Sárkány Hét zene törölve** — csak az új app ambient szól minden napszakban.

## Sárkány Hét (2026. ápr. 11–17)

Időszakos esemeny — csak a datumablak alatt aktiv. Csökkentett funkcionalitás az eredeti implementációhoz képest:

- ✅ Robot skin override (`dragon-week` class, szinvaltos)
- ✅ Háttér override (`bg-dragon-week`)
- ✅ Köd réteg, parázs részecskék
- ✅ Eseményszöveg a phEvent elemben
- ✅ Tap = tűzokádás (`window._dragonWeekActive`)
- ❌ App ikon override (törölve — mindig `dailybot-icon.png`)
- ❌ Sárkány zene (törölve — az új app ambient szól helyette)
- ❌ Dragon Spin (törölve — Daily Gem-re cserelve, mindig elérhető)

A sárkány skin (`dragon`) továbbra is feloldható a rejtvény játékkal (boltban, megfejtés: "sárkány").

## Főképernyő UI

- **Robot** (középen)
- **Streak badge** (`#streak`): "🔥 N napos sorozat" — ha on, narancs→piros áramló gradient
- **Shop ikon** (🏪, jobb felső sarok): `.skin-toggle`
  - **NEW piros buborék** (`shopNewBadge`) — ha bármelyik napi loot elérhető (box, pouch, gem, BP claimable)
- **Kedvencek gomb** (❤️, bal felső)
- **Szinkronizálás gomb** (🔄, shop headerben)

## Shop szekciók sorrendje

1. **🎰 Napi Spin** → át lett cserelve: **💎 Daily Gem**
2. **🎁 DailyBox** (card)
3. **👝 Daily Pouch** (card)
4. **🎖️ Bot Pass** (belépő banner — megnyomásra: shop bezárul, majd BP panel nyílik 250ms delay-jel)
5. **🤖 Skin választék** (horizontal scroll, sorted by rarity)
6. **🖼️ Hátterek**
7. **🔮 Aurák**
8. **🎀 Kiegészítők** (Pouch-ból szerezhető)
9. **💃 Bot Táncok** (Pouch-ból + Bot Pass)
10. **🔥 Mai akció** (Daily Deal)
11. **📮 Támogatás** (ZYNOX input — LEGALUL)

## Modern animációk (flow/áramló gradientek)

Sok UI elem használ aramlo gradient animaciot:

- **Shop title**: pink→arany→lila áramlás (6s loop, `flowColor` keyframe)
- **Bot Pass banner**: többrétegű lila-pink-sötét (10s)
- **Bot Pass panel background**: 4-színű flow (20s)
- **Bot Pass tiles (milestone)**: 5-színű áramlás (5s)
- **Bot Pass progress bar**: arany-pink-lila (3s)
- **Streak badge (on)**: narancs→piros (4s)
- **Mythic rarity items**: multi-szín áramlás
- **ZYNOX support (aktív)**: arany-pink-lila áramlás (5s)
- **Gem skip gomb**: pink-lila-kék (6s)
- **Plus gomb**: arany-piros-lila (4s)

Shine effektek (`bpShine` keyframe): félátlátszó fehér sáv halad át a gombokon 3-3.5s loop.

## Szinkronizálás (export/import)

- 🔄 gomb a bolt headerben
- Export: base64 kódolt JSON
- `SYNC_KEYS` tömb: `nu_owned`, `nu_active_*`, `nu_favs`, `nu_s`, `nu_l`, `nu_name`, `nu_uid`, `nu_gems`, `nu_box_day/count`, `nu_pouch_day/free`, `nu_spin_day`
- Import összefésülés:
  - Owned → unió
  - Kedvencek → szöveg-alapú dedup merge
  - Gem → MAX(local, imported)
  - Napi jogosultságok → local wins (nem adunk vissza elhasznált loot-ot)
  - Név → felülírás

## Személyes köszöntés

- Fejlecben "Szia, [Nev]!"
- Névnapon: "Boldog névnapot, [Nev]! 🎉"

## Névnapok

- Teljes magyar névnap lista `NEVNAPOK` objektumban (MM-DD kulcsok)
- `msgDay()` dátumot használja (6 AM logika)

## Kedvencek

- Üzenet buborékban "🤍 Kedvenc" gomb
- `nu_favs` JSON: `{t, e, d}` (szöveg, emoji, dátum)
- Jobb oldalon szív gomb badge-dzsel

## Megosztás

- Canvas-szal 720×960 PNG kép
- `navigator.share()` vagy clipboard/letöltés fallback

## Napszak-függő háttér

- Reggel (5-6): narancs gradiens
- Nappal (6-17): kek-lila-rózsaszín + CSS csillagok
- Este (17-20): narancs-lila
- Éjjel (20-5): sötét kek-indigo

## Ünnepi öltözékek

Karácsony, Mikulás, Szilveszter, Újév, Halloween, Valentin-nap, Április bolondok, Robot szülinap (márc 26), nemzeti ünnepek (márc 15, aug 20, okt 23). Az `outfitHat`/`outfitFace`/`outfitNeck` slot-okat foglalják.

## Időjárás

- Geolocation → fallback: geojs.io IP-alapú
- Open-Meteo API → WMO kódok: 0-1 derült, 51-67 eső, 71-77 hó, 95+ vihar
- CSS animációk: `raindrop`, `snowflake`, `sunray` (csak 6-20h)

## Értesítések

- **Service Worker** (`sw.js`, cache **v29**)
- SW ütemez értesítéseket: reggel 6, délben 12, este 18
- `periodicSync` (Android Chrome): 4 óránként háttér emlékeztető
- `index.html` → network-first cache strategy
- SW frissités-detektálás: `reg.update()` + `skipWaiting` + `controllerchange` → `location.reload()`

## File Structure

```
index.html          — teljes alkalmazás (CSS + JS beágyazva)
manifest.json       — PWA manifest (standalone)
sw.js               — Service Worker (cache v29 + értesítések + skipWaiting)
CLAUDE.md           — fejlesztői útmutató Claude Code számára
README.md           — felhasználói dokumentáció
bg-tulip.png        — Tavaszi Rét háttér kép
bg-glass.png        — Labor Glass háttér kép
bg-graffiti.png     — Graffiti háttér kép
icon/
  dailybot-icon.png — PWA ikon (PNG, 512×512)
  dailybot-icon.svg — PWA ikon (SVG forrás)
  dragon-icon.svg   — Sárkány Hét ikon (jelenleg nincs használva a fő app-ban)
docs/superpowers/
  specs/2026-04-18-gem-economy-design.md   — eredeti design spec
  plans/2026-04-18-gem-economy.md          — implementációs terv
```

## App Icon

- `icon/dailybot-icon.png` — alap ikon, ez van mindig használva
- Manifest: `any maskable` purpose
- (A Sárkány Hét alatt NINCS ikon override — régi funkció eltávolítva.)

## Social

- TikTok: http://www.tiktok.com/@dailybot_dailymessage (link az app alján)

## Language

All user-facing text is in Hungarian (Magyar).
