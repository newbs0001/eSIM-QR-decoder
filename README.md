# eSIM QR-dekoder

Lite internt webverktøy for dekoding av eSIM-QR-koder helt klient-side.

## Funksjoner
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

# Valgfri produksjonsbygging

```bash
npm run build
```
