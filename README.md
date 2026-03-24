# eSIM QR-dekoder

Lite internt webverktøy for dekoding av eSIM-QR-koder helt klient-side.

## Funksjoner

- Statisk side som kan distribueres til Cloudflare Pages
- Ingen backend, API, database, analyse, sporing eller server-side prosessering
- Ingen localStorage- eller sessionStorage-lagring som standard
- Lim inn rå QR-/LPA-tekst
- Last opp et QR-bilde og dekod det lokalt i nettleseren
- Parse `LPA:1$SMDP_ADDRESS$ACTIVATION_CODE`-verdier
- Vis rå dekodet tekst, versjon, SM-DP+-adresse, aktiveringskode og ekstra felt
- Kopieringsknapper for hvert felt
- Tøm all tilstand i minnet med ett klikk
- Kundevendte instruksjonsmaler for iPhone og Android
- Personvernvennlig språk i grensesnittet

## Åpne lokalt

```bash
Åpne `index.html` direkte i en nettleser.
```

## Valgfri utviklingsserver

```bash
npm install
npm run dev
```

## Valgfri produksjonsbygging

```bash
npm run build
```

Rotfilene er allerede statiske og kan distribueres som de er. Hvis du bruker den valgfrie Vite-flyten, bygges appen også til `dist/` for Cloudflare Pages.
