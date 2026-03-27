# Napi Uzenet

Napi motivacios uzenet alkalmazas — egy aranyos CSS robot minden nap mas uzenetet mond neked.

## Telepites iPhone-ra

1. Nyisd meg **Safari**-ban: **https://kovrat12345678.github.io/napi-uzenet/**
2. Nyomd meg a **Megosztas** gombot (negyzet + nyil ikon)
3. Valaszd: **Hozzaadas a Fokepernyohoz**
4. Kattints a **Hozzaadas** gombra
5. Nyisd meg az appot a fokepernyorol
6. Koppints a robotra es **engedelyezd az ertesiteseket**

Az alkalmazas ezutan teljes kepernyon nyilik meg, mint egy nativ app.

## Funkciok

- **365 egyedi uzenet** — naponta 1, mint a TopJoy napi kupak
- **Elethu CSS robot** — lebeges, pislogas, antenna pulzalas animaciokkal
- **Robot reakciok** — az uzenet hangulata alapjan mas-mas arckifejezest mutat:
  - Izgatott (energia), gondolkodo (bolcsesseg), tacos (humor), gyenged (erzelmek)
- **Gepelo effekt** — az uzenet betuenkent jelenik meg, mint egy chatben
- **Napszak-fuggo hatter** — reggel narancs, nappal kek-lila, este sotet, ejjel indigo
- **Idojaras animaciok** — valos eso, ho vagy napsutes a helyzeted alapjan
- **Unnepi oltozekek** — Karacsony, Husvet, Halloween, nemzeti unnepek es meg tobb
- **Kovrat nap (marc 28.)** — kulonleges szives nap: rozsaszin robot, lebego szivek, fix uzenet
- **Streak szamlalo** — koveti, hany egymast koveto napon nyitottad meg
- **Konfetti** — minden napi uzenetnel unnepel
- **Push ertesites** — emlekeztet ha meg nem nezted meg a napi uzeneted
- **Drag interakcio** — huzd meg a robotot, meglepodik!
- **Robot hangok** — koppintasra cuki "bi-bu-bi" hangeffektek

## Tech Stack

Egyetlen `index.html` fajl, beagyazott CSS-sel es vanilla JavaScript-tel. Nincsenek fuggosegek. PWA-kent mukodik offline is.

## Push ertesitesek

Az app reggel 8 ora utan emlekeztetot kuld ha meg nem nezted meg a napi uzeneted. Az ertesites az app megnyitasakor vagy a telefon feloldasakor aktivolodik (iPhone-on nincs hatterbeli push szerver nelkul).

Engedelyezes: elso alkalommal a robotra koppintaskor keri.
