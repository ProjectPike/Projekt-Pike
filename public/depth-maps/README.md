# Djupkartor

## Klappasjön

- Pike-fil: `klappasjon-pike-1986.png`
- Original: `3-3402_Klappasjön_638147-142329.tif`
- Hämtad från: https://vattenwebb.smhi.se/svarwebb/rest/downloadmap/638147-142329
- Uppgiftskälla i SMHI: Nässjö kommun
- Kartdatum: 1986-06-02
- Licens: CC BY 4.0 enligt
  https://www.smhi.se/data/om-smhis-data/villkor-for-anvandning
- Bearbetning: SMHI-skannens historiska djupkurvor har frilagts och färgsatts.
  Den gamla skannade ytterkonturen har tagits bort. Sjöyta, strandlinje och öar
  bygger i stället på OpenStreetMap-data levererad via OpenFreeMap. Resultatet
  visas som en fristående Pike-karta och läggs inte som ett georefererat raster
  ovanpå appens interaktiva karta.
- Kartdesign och sammanställning: Pike, 2026.
- Strandlinjedata: © OpenStreetMap contributors, ODbL.

Kartbilden är ett historiskt och ungefärligt underlag. Den ska inte användas
för navigering. Djupkurvorna kan avvika från den moderna strandlinjen eftersom
underlagen kommer från olika tidpunkter och mätmetoder.

## Inventering

Status för samtliga Pike-sjöar finns i `src/data/lakeDepthMapResearch.js`.
`npm run validate:lakes` kräver en forskningspost för varje sjö och
`npm run audit:depth-maps` skriver ut kön av hittade kartor som återstår att
bearbeta. Därmed går en ny sjö inte igenom valideringen innan djupkarteläget har
kontrollerats.
