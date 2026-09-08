# Djupkartor

Pike innehåller bearbetade djupunderlag för de 17 av projektets 22 sjöar som
har en publicerad karta i SMHI:s Damm- och sjöregister. Källposter, kartnummer,
mätår och inventeringsstatus finns i `src/data/lakeDepthMapResearch.js`.

## Källor och licens

- Original: SMHI:s Damm- och sjöregister
- Nedladdningslänk per sjö: `lakeDepthMapResearch.js`
- Licens: CC BY 4.0 enligt
  https://www.smhi.se/data/om-smhis-data/villkor-for-anvandning
- Strandlinje och öar: © OpenStreetMap contributors, ODbL
- Bearbetning och kartdesign: Pike, 2026

## Bearbetning

SMHI-underlagens historiska djupkurvor och djupobservationer har frilagts och
färgsatts för Pikes mörka kartdesign. Sjöyta, strandlinje och öar kommer från
modern OpenStreetMap-geometri. Den moderna geometrin används som slutlig mask,
så gamla skannade ytterkonturer och öformer inte målas över dagens baskarta.

Originalen varierar mycket i ålder, upplösning och metod. Vissa är fullständiga
djupkurvekartor, andra visar mätlinjer eller enstaka lodningar. Pike återger det
underlag SMHI faktiskt publicerar och hittar inte på mellanliggande djup.

Kartorna är historiska och ungefärliga underlag. De ska inte användas för
navigering. Djupkurvor och lodningar kan avvika från modern strandlinje eftersom
underlagen kommer från olika tidpunkter och mätmetoder.

## Arbetsflöde för nya sjöar

`npm run validate:lakes` kräver en inventeringspost för varje ny sjö.
`npm run audit:depth-maps` visar hittade och publicerade SMHI-kartor. Ett
djupunderlag ska publiceras först efter kontroll av rätt sjö, källhänvisning,
modern vattenmask och visuell passning.
