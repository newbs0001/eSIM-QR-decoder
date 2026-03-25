# eSIM Verktøy

eSIM Verktøy er et lite, statisk webverktøy for intern bruk. Applikasjonen dekoder eSIM-QR-koder lokalt i nettleseren og viser manuelle aktiveringsverdier, veiledning og installasjonslenker uten bruk av backend eller lagring.

Prosjektet er laget for enkel drift på Cloudflare Pages og kan også åpnes direkte som en statisk side lokalt.

## Oversikt

Applikasjonen lar brukeren:

- laste opp et bilde med eSIM-QR-kode
- lime inn et bilde fra utklippstavlen med `Ctrl + V`
- dra og slippe et bilde direkte inn i appen
- skrive inn en `LPA`-streng manuelt ved behov
- dekode og parse eSIM-data lokalt i nettleseren
- kopiere ut `SM-DP+-adresse`, `aktiveringskode`, `bekreftelseskode` og rå dekodet tekst
- vise veiledning for iOS og Android
- generere beta-installasjonslenker for iOS og Android

## Personvern og sikkerhet

Applikasjonen er bevisst bygget med en enkel og streng personvernmodell:

- ingen backend
- ingen database
- ingen API-kall for dekoding
- ingen analyse eller sporing
- ingen bruk av `localStorage`
- ingen bruk av `sessionStorage`
- ingen vedvarende lagring av eSIM-data

Alt behandles i minnet i brukerens egen nettleser og forsvinner ved oppfriskning eller lukking av siden.

## Tech stack

- HTML
- CSS
- Vanilje JavaScript
- [Vite](https://vitejs.dev/) for lokal utvikling og bygging
- [jsQR](https://github.com/cozmo/jsQR) for QR-dekoding i nettleseren
- Cloudflare Pages for hosting

## Funksjonalitet

### Startside

- ren opplastingsflate for eSIM-QR
- støtte for filvalg, dra-og-slipp og innliming fra utklippstavle
- egen dropdown for manuell inntasting av `LPA`-streng
- tydelig seksjon for sikkerhet og personvern
- synlig demo-QR i toppfeltet for rask testing

### Resultatside

- egen seksjon for installasjonslenker
- egen seksjon for manuelle verdier
- egen seksjon for veiledning
- sammenleggbare seksjoner for ryddigere visning
- kopieringsknapper for relevante felt
- rå dekodet tekst skjult som standard
- `bekreftelseskode` vises alltid, og står som `Blank` hvis verdien ikke finnes

### Installasjonslenker

Appen bygger beta-lenker for:

- iOS 17.4+
- Android 10+

Disse vises som hjelpelinker i UI-et, men er markert som beta fordi støtte varierer mellom enheter og oppsett.

## Eksempel på LPA-format

Applikasjonen forventer eSIM-data i et format som dette:

```text
LPA:1$sm-dp.example.com$ABCD1234EFGH5678
```

Ved gyldig parsing hentes blant annet disse feltene ut:

- `SM-DP+-adresse`
- `aktiveringskode`
- `bekreftelseskode` hvis tilgjengelig
- rå dekodet tekst

## Lokal utvikling

Installer avhengigheter:

```bash
npm install
```

Start lokal utviklingsserver:

```bash
npm run dev
```

Bygg prosjektet:

```bash
npm run build
```

Forhåndsvis bygget lokalt:

```bash
npm run preview
```

## Hosting

Applikasjonen er laget for statisk hosting og fungerer godt på Cloudflare Pages.

Prosjektet har ingen serverkode, ingen API-ruter og ingen databaseavhengigheter. Det gjør deploy enkelt og billig.

## Deploy-notater

Repoet inneholder ikke Cloudflare-konfigurasjon som `wrangler.toml` eller GitHub Actions for deploy. Oppsettet holdes bevisst enkelt:

- kildekoden ligger i GitHub
- deploy kjøres fra lokal maskin med Wrangler
- Cloudflare Pages hoster den statiske løsningen

Dette holder repoet rent og gjør det enkelt å vedlikeholde.

## Filstruktur

Viktigste filer i repoet:

- `index.html` - HTML-skall for applikasjonen
- `app.js` - hovedlogikk, rendering, parsing, modaler og UI-oppførsel
- `style.css` - all styling for appen
- `assets/demo-qr.png` - demo-QR brukt i modalvinduet
- `vendor/jsQR.js` - QR-bibliotek brukt i klienten
- `package.json` - scripts og avhengigheter

Det finnes også eldre bygg-/utviklingsrester i repoet, men den aktive appen kjøres fra rotfilene over.

## Bruk

### Dekode fra bilde

1. Åpne appen.
2. Last opp et bilde, dra inn et bilde, eller lim inn et bilde fra utklippstavlen.
3. Appen dekoder QR-koden lokalt.
4. Manuelle verdier, installasjonslenker og veiledning vises automatisk.

### Manuell inntasting

1. Åpne dropdownen `Manuell inntasting`.
2. Lim inn en gyldig `LPA`-streng.
3. Trykk `Vis resultat`.

## Demo

I toppfeltet på `eSIM-QR`-seksjonen finnes en knapp merket `Demo QR`.

Denne åpner et lite vindu med en eksempel-QR som kan brukes for rask testing av løsningen.

## Målgruppe

Verktøyet er laget som et internt støtteverktøy for ansatte eller supportpersonell som trenger å:

- lese ut eSIM-data raskt
- sende korrekte manuelle aktiveringsverdier til kunde
- kontrollere at en QR-kode faktisk inneholder forventet LPA-innhold
- bruke installasjonslenker der dette er aktuelt

## Status

Prosjektet er i aktiv bruk og videreutvikles fortløpende. UI, ordlyd og arbeidsflyt er optimalisert for enkel intern bruk framfor generisk sluttbrukerdesign.

## Lisens og eierskap

Applikasjonen er open source, men er også tydelig merket som utviklet for Johnsen IT.

- Copyright: Johnsen IT
- Utviklet av Michael Johnsen
