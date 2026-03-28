# Napi Uzenet

Napi motivacios uzenet alkalmazas — egy aranyos CSS robot minden nap mas uzenetet mond neked.

## Telepites

### iPhone (Safari)

1. Nyisd meg **Safari**-ban: **https://kovrat12345678.github.io/napi-uzenet/**
2. Nyomd meg a **Megosztas** gombot (negyzet + nyil ikon)
3. Valaszd: **Hozzaadas a Fokepernyohoz**
4. Kattints a **Hozzaadas** gombra
5. Nyisd meg az appot a fokepernyorol
6. Koppints a robotra es **engedelyezd az ertesiteseket**

### Android (Chrome)

1. Nyisd meg **Chrome**-ban: **https://kovrat12345678.github.io/napi-uzenet/**
2. Koppints a **harom pont** menure (jobb felso sarok)
3. Valaszd: **Alkalmazas telepitese** vagy **Hozzaadas a kezdokepernyohoz**
4. Erositsd meg a **Telepites** gombbal
5. Koppints a robotra es **engedelyezd az ertesiteseket**

Az alkalmazas ezutan teljes kepernyon nyilik meg, mint egy nativ app.

## Funkciok

- **365 egyedi uzenet** — naponta 1, mint a TopJoy napi kupak
- **Napi 1 uzenet korlatozas** — naponta egyszer koppinthatsz uj uzenetert, utana a robot csak integet
- **Visszaszamlalo** — az app aljan latod, hany ora/perc/mp mulva jon a kovetkezo uzenet (masnapig reggel 8-ig)
- **Elethu CSS robot** — lebeges, pislogas, antenna pulzalas animaciokkal
- **Robot reakciok** — az uzenet hangulata alapjan mas-mas arckifejezest mutat:
  - Izgatott (energia), gondolkodo (bolcsesseg), tancos (humor), gyenged (erzelmek)
- **Gepelo effekt** — az uzenet betuenkent jelenik meg, mint egy chatben
- **Napszak-fuggo hatter** — reggel narancs, nappal kek-lila, este sotet, ejjel indigo
- **Idojaras animaciok** — valos eso, ho vagy napsutes a helyzeted alapjan
- **Unnepi oltozekek** — Karacsony, Husvet, Halloween, nemzeti unnepek es meg tobb
- **Kovrat nap (marc 28.)** — kulonleges szives nap: rozsaszin robot, lebego szivek, fix uzenet
- **Streak szamlalo** — koveti, hany egymast koveto napon nyitottad meg
- **Konfetti** — minden napi uzenetnel unnepel
- **Push ertesites** — naponta reggel 8-kor emlekeztet (Android + iOS)
- **Drag interakcio** — huzd meg a robotot, meglepodik!
- **Robot hangok** — koppintasra cuki "bi-bu-bi" hangeffektek

## Tech Stack

Egyetlen `index.html` fajl, beagyazott CSS-sel es vanilla JavaScript-tel. Nincsenek fuggosegek. PWA-kent mukodik offline is.

## Push ertesitesek

Az app naponta reggel 8-kor kuld egy emlekeztetot ha meg nem nezted meg a napi uzeneted. Naponta maximum 1 ertesites erkezik.

- **Android**: hatterbeli szinkronizacio is tamogatott (periodicSync)
- **iPhone**: az ertesites az app megnyitasakor vagy a telefon feloldasakor aktivolodik (8 ora utan)

Engedelyezes: elso alkalommal a robotra koppintaskor keri.

## Hogyan mukodik

1. Nyisd meg az appot → koppints a robotra → megkapod a napi uzeneted
2. Naponta 1 uzenet jar — ha mar megkaptad, a robot csak integet
3. Az app aljan latod a visszaszamlalot: mikor jon a kovetkezo uzenet (masnapig reggel 8-ig)
4. Masnap reggel 8-kor push ertesites emlekeztet
