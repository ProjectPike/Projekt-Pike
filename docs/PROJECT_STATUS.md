# Project Pike — projektstatus och roadmap

Detta är Project Pikes levande källa till nuläge, produktinriktning och teknisk riktning. Dokumentet ska ge framtida CTO-chattar och Work/Lillen2 tillräcklig kontext för att fortsätta utan att uppfinna en ny roadmap.

## Current checkpoint

- Senaste kända bra commit: `5531250 - Add feature entitlement engine`.
- `main` ska vara ren och synkroniserad med `origin/main`.
- Aktiv lokal utvecklingsrepo: `C:\Projects\projekt-pike`.
- Den gamla OneDrive-synkade repon ska inte användas för aktiv Git-utveckling.
- Projektfas: **Stabilisera kärnan / gör grundprodukten riktigt bra**.
- Pike är inte feature-complete.

### Klart i nuvarande grundprodukt

- Map-first-startvy och naturlig kartstil.
- Sjösökning med autocomplete som öppnar rätt sjö.
- Mitt fiske med plats, metod och art.
- Statusmodellen `allowed` / condition-warning / unknown-neutral.
- Sjösidor, favoriter och teman.
- Publicerade djupkartor med förbättrade djupetiketter.
- Fiskematchindikatorer på kluster.
- Konsekvent kartlegend/statusvisning.
- `LakeMap`-läge för låst djupkarta.
- Central feature entitlement engine.
- Pike Data Ingest v1 del 1: fristående kandidatformat och deterministisk validator.
- Pike Data Ingest v1 del 2: manuell hashbunden review och isolerad publicering.
- Pike Data Ingest v1 del 3A.0: explicit published-to-app-kompatibilitetskontrakt;
  ingen appimport eller produktionsändring.
- Pike Data Ingest v1 del 3A.1: review-bundna, explicit författade appfält;
  research-valid är fortfarande inte samma sak som integrationsredo.
- Pike Data Ingest v1 del 3A: deterministisk dry-run som föreslår kompatibla nya
  appsjöar i minnet; ingen produktionsdata skrivs.

### Entitlement-arkitektur

- Stabila feature identifiers används i stället för spridda medlemsbooleans.
- En central, deterministisk evaluator avgör feature access.
- Default/current profile tillåter djupkartor.
- Free/restricted profile kan låsa djupkartor.
- `LakeMap` innehåller ingen entitlement-policy; komponenten tar emot resultatet.
- Datatillgänglighet och entitlement är separata begrepp.
- Autentisering, betalningar, prenumerationer och medlemsbackend är ännu inte implementerade.

## Närmaste utvecklingsordning

Detta är aktuell produkt- och engineeringriktning, inte en fast leveransplan.

### A. Core polish / review

- Verifiera de senaste kart-, kluster- och statusändringarna visuellt.
- Göra små mobil- och UX-fixar där de faktiskt behövs.
- Granska kvarvarande formuleringar, exempelvis copy för saknad eller granskad djupdata.

### B. Data / research

- Välja nästa sjöar runt Jönköping.
- Prioritera användbara vatten som inte redan är väl täckta på andra håll.
- Samla kompletta, källbelagda sjöpaket.

### C. Nästa större tekniska infrastruktur

- Pike Data Ingest v1.
- Kandidatformat och validator är klara i del 1; samla erfarenhet från källbelagda kandidater.
- Del 2 har manuell review och isolerad publish; del 3A kan nu föreslå nya
  kompatibla appsjöar, medan apply- och uppdateringsflöden kräver separat avgränsning.

### D. Efter datainfrastrukturen

- Väder.
- Planera tur.
- Verifierade accesspunkter.
- Offline.
- Aktivt fiske.
- Dagbok och Pike Rewind.

## 1. Karta & discovery

### Nuvarande läge

- Sökningen har en autocomplete-baseline och öppnar rätt sjö, samtidigt som befintlig kartdämpning vid textsökning bevaras.
- Kluster visar diskreta gröna och/eller orange fiskematchindikatorer när Mitt fiske är aktivt.
- Kartlegenden använder samma visuella statusspråk som klustren.

### Fortsatt riktning

- Fortsätt med små, konsekventa UX-förbättringar utan att göra kartan tung.
- Skydds-, stängnings- och fredningsområden ska senare visas diskret på huvudkartan och tydligt rött/markerat på sjökartan.
- Pike ska senare kunna varna när fiske sker nära ett aktivt skyddsområde.
- Varningar ska endast utlösas när de faktiskt är relevanta för exempelvis datum, tid, art eller metod.
- Pike ska inte ropa i onödan.

## 2. Djupkartor

### Pike Depth Style v1

- Naturlig svensk kartkänsla.
- Tunna, ljusa djupkurvor.
- Upprätta, tydliga och läsbara etiketter med låg täthet.
- Inga neonfärger och ingen överdesign.

### Produktlägen

- Ingen publicerad djupdata: ordinarie unavailable/review-läge.
- Djupdata finns men användaren saknar entitlement: `Djupkarta 🔒`.
- Entitled användare: ordinarie På/Av-kontroll.

UI- och entitlement-grunden för dessa lägen är implementerad. Låst premiumdata får inte laddas eller visas i bakgrunden.

### Tekniska principer och status

- Separat GeoJSON per sjö.
- Ingen legacy raster-overlay som slutlig lösning.
- Ingen påhittad interpolation.
- Endast verifierade och publicerade djupkurvor visas.
- Publicerade: Hökesjön, Knipesjön, Munksjön och Svansjön.
- Tenhultasjön: behöver fortsatt granskning.
- Bolmen: särskilt arbete senare; ska inte publiceras med osäker georeferering.

## 3. Aktivt fiske

Aktivt fiske är en framtida huvudfunktion och ska vara en aktiv fiskesession, inte bara en timer.

En session kan innehålla:

- GPS och aktuell sjö.
- Starttid och valfri rutt.
- Kontextuellt relevanta varningar.
- Snabb fångstloggning.

Mål för snabbflödet är ungefär 5–10 sekunder:

`Gädda -> 50 cm -> 2,5 kg -> Foto -> Klar`

Följande ska fångas automatiskt där det är möjligt:

- GPS.
- Tid.
- Aktiv sjö.
- Senaste kontext för art, metod och bete.

Valfria uppgifter kan vara återutsatt/behållen, anteckning och foto. När turen avslutas ska Pike fråga: **Spara turen i Dagboken? Ja / Nej**. Nej betyder nej; ingen dagbokspost får skapas i smyg.

## 4. Dagbok / fiskelogg

Dagboken ska centreras kring fisketurer/sessioner, inte bara enskilda fångster.

En tur kan innehålla:

- Start och slut.
- Sjö.
- Väder och rutt.
- Fångster, bilder och anteckningar.
- Slutbetyg: 🔥 Bra, 😐 Okej eller 💀 Dött.

Statistik ska endast visas när verkliga data stödjer den, exempelvis art, månad, tid, vind, sjö, metod, medelstorlek och bästa turer. Pike får aldrig hitta på korrelationer.

**Pike Rewind** är en framtida årssummering med ett litet antal starka kort, inte dussintals slides. Möjliga mått är antal turer och fångster, mest fiskade sjö, största fisk, bästa månad, vanligaste art och metod, döda turer, längsta tur samt tidigaste start och senaste avslut.

## 5. Väder

Väder ska primärt leva på sjösidan och vara enkelt som standard, exempelvis:

`12°C · SV 5 m/s · Sjögång: liten`

`Sol upp 06:21 · Sol ner 19:42`

En expanderad vy kan innehålla timprognos, temperatur, vind, vindriktning, byar, regnsannolikhet, regnmängd, soluppgång och solnedgång.

Pike kan tolka förhållanden för farkostlämplighet, exempelvis **Kajak: Okej** eller **Kajak: Tveksamt**, men får inte låtsas veta om fisket blir bra. Vattentemperatur ska bara visas från verklig och tillförlitlig data; den får aldrig härledas från lufttemperaturen.

## 6. Planera tur

Användaren ska kunna välja sjö, datum, ungefärlig tid och valfria fiskeval. Pike sammanfattar:

- Väder, vind och regn.
- Soluppgång och solnedgång.
- Regler för valt datum.
- Fiskekort.
- Access, parkering och ramp/iläggning.
- Offline-status.

Kärnfrågan är: **Vad måste jag veta innan jag åker?**

Möjliga varningar är krav på fiskekort, aktiv skyddsperiod, stängd ramp, parkeringsförbud, kraftig vind, mörker före planerat slut, krav på båtregistrering/anmälan eller avsaknad av verifierad iläggningsplats.

Valfria checklistenivåer: Minimal, Standard och Full.

## 7. Offline

Offline v1 ska vara smal och användbar. Per sjö kan följande sparas:

- Sjökarta och djupkarta.
- Regler och källor.
- Accesspunkter och skyddsområden.
- Planerad tur.

Aktivt fiske ska senare fungera offline för GPS, rutt, fångstloggning, foton och lokala varningar. Väder kan sparas som en tidsstämplad ögonblicksbild. Full nedladdning av karttiles för hela huvudkartan ingår inte i offline v1.

## 8. Access, parkering & iläggning

Detta är ett praktiskt område med högt användarvärde. Verifierad data kan omfatta:

- Parkering.
- Båtramper och kajakiläggning.
- Bryggor och strandaccess.
- Tillgänglighetsanpassad fiskebrygga.
- Möjlig båtuthyrning.

**Pike navigerar bara till kända och verifierade platser.**

Om exakt laglig och praktisk access är okänd ska Pike navigera till sjön, inte hitta på en väg genom någons tomt. Automatisk ”last mile”-ruttning på privata vägar eller genom skog hör inte hemma i tidiga versioner.

## 9. Dataexpansion

- Nuvarande referensdataset: 22 sjöar.
- Nästa större datamål: totalt 50 sjöar.

Prioritering:

1. Jönköping och närområdet.
2. Småland.
3. Sjöar som inte finns representerade på iFiske.
4. Större/iFiske-täckta sjöar.
5. Bredare Sverige.

Historisk batchindelning: 23–32, 33–42 och 43–50.

Ett komplett sjöpaket bör om möjligt innehålla namn/koordinater, arter, metoder, fiskekort, regler för båt/kajak/flytring och motor, storleks- och skyddsregler, tider, parkering, ramp, brygga/access, båtuthyrning, källbelagd djupkarta, källor och verifieringsdatum.

Intern utveckling kan fortsätta Småland-first. Releasemålet är fortfarande hela Sverige.

## 10. Pike Data Ingest v1

Detta är sannolikt nästa större engineeringprojekt efter nuvarande kärnstabilisering.

Del 1 är implementerad: `data/candidates/`, en separat syntetisk testfixture och
`scripts/validateCandidateLakes.mjs` (`npm run validate:candidates`). Formatet
återanvänder Pikes faktastatus, regeltyper och källtyper. Se
`data/candidates/README.md` för schema och begränsningar.

Del 2 är implementerad: separat mänskligt beslut i `data/reviews/`, bundet till
kandidatens canonical JSON via SHA-256. Publicering kräver validering och matchande
approved-beslut och skriver endast till `data/published/`. Identisk output är en
no-op; annat befintligt innehåll blockeras. Se `data/reviews/README.md`.
Ingen appimport, review-UI eller ändring av produktionssjöarna sker.

Del 3A.0 är implementerad som ett rent compatibility-kontrakt i
`scripts/publishedLakeCompatibility.mjs`. Det klassar säkra kandidatfält,
appfält som måste levereras explicit och konstruktioner som dagens app inte kan
bevara. Se `data/published/README.md`. Kontraktet är preflight; appen läser
fortfarande inte `data/published/`.

Del 3A.1 lägger de explicita app-/legacyfälten i kandidatens valfria `app`-block,
så de valideras och binds av samma review-hash före publish. Researchkandidater
utan full appmetadata förblir giltiga men blockeras tydligt från integration.

Del 3A är implementerad som en deterministisk dry-run i
`scripts/buildLakeDataset.mjs` (`npm run build:lake-data`). Den läser endast
`data/published/`, återanvänder compatibility-kontraktet och föreslår kompatibla
nya sjöar samt djupkartestatus i minnet. Befintliga ID:n och alla
kompatibilitetsfel blockeras. Published är inte live: buildern saknar apply- och
skrivläge och produktionsdata förblir orörd.

Arkitektur:

`candidate -> validate -> review -> publish -> compatibility -> dry-run build`

En JSON-kandidat per sjö är utgångspunkten. Konceptuella platser är `data/candidates/`, `data/published/` och scripts som `validateCandidateLakes.mjs`, `importCandidateLakes.mjs` och `buildLakeDataset.mjs`. Exakta sökvägar och filnamn bestäms först efter inspektion av aktuell arkitektur och är inte implementationstvång.

Validatorn ska kontrollera:

- Schema och tillåtna statusvärden.
- Källor och verifieringsdatum.
- Konflikter och dubletter.
- Saknade obligatoriska fält.
- Misstänkta eller felaktiga unknown-värden.

Validatorn får aldrig:

- Avgöra juridisk sanning.
- Skriva över verifierad data.
- Förvandla unknown till allowed.
- Göra rekommendationer till regler.
- Hitta på saknade fakta.

Databas skjuts upp tills den faktiskt behövs.

## 11. Felrapporter & community

**Pike should have community data, not a community to operate/moderate.**

Strukturerade felrapporter kan gälla fiskeregler, kort/länk, artinformation, parkering, ramp, brygga, access, skyddsområde, djupkarta, plats/sjönamn och inaktuell information.

Orsaker kan exempelvis vara att något inte längre finns, ligger fel, är privat, är förbjudet, blockeras av bom, har ändrats eller har en trasig källa.

Enkla communityrapporter om fiske kan senare använda 🔥 Bra, 😐 Okej och 💀 Dött, med valfria dimensioner som art, metod och fångst. Resultat ska aggregeras. Undvik flöden, följare, DM och allmänna kommentarsfält om det inte senare finns ett övertygande skäl.

## 12. Privacy

**Pike hjälper dig minnas dina platser, inte avslöja dem.**

Tre konceptuella datanivåer:

1. **Privat rådata:** exakt GPS, rutt, fångster, foton och anteckningar.
2. **Synkad privat data:** backup och flera enheter, fortfarande privat.
3. **Delad/aggregerad data:** endast explicit opt-in, exempelvis sjö, art, metod, månad, väder och längd/vikt.

Exakta fiskeplatser får aldrig delas av misstag.

## 13. AI

**AI ska vara ett lager ovanpå Pike, inte grunden.**

**Pike ska fungera fullt utan AI.**

Ett tidigt användbart koncept är **Pike Guide v1**, som kan besvara frågor som:

- Får jag trolla här?
- Vad gäller för gös?
- Vad betyder orange?
- Var hittar jag mina sparade sjöar?

AI ska endast få relevant, verifierad Pike-data och tydligt säga när data saknas.

En senare **AI-ekolod / AI-guide** blir relevant först när Pike har tillräckligt med verklig djupdata, struktur, väder, historik och fångstdata. Avancerade fiskerekommendationer ska inte byggas innan data stödjer dem. Behåll konceptet med en AI-fri inställning.

## 14. Konto, medlemskap & intäkter

- Ingen påtvingad inloggning; gästen ska kunna börja direkt.
- Gästens kärna omfattar karta, regler, sjöinformation, access, väder, fiskekortsinformation och grundfunktionalitet.
- Regler och säkerhetsinformation får **aldrig** ligga bakom betalvägg.

Möjliga framtida medlemsfunktioner:

- Reklamfritt.
- Djupkartor.
- Synk/backup och offline.
- Statistik och Pike Rewind.
- Turplanering.
- Större AI-kvot.
- Premiumlager.

En möjlig supporter-/Storfiskare-nivå kan senare ge badge, betaåtkomst, högre AI-gränser och möjlighet att stötta projektet. Skapa inga konstgjorda lås bara för att tillverka en betalvägg.

Den centrala entitlement-motorn finns, men autentisering, betalningsintegration och prenumerationsbackend saknas fortfarande.

## Permanenta produktprinciper

- Map first.
- Modernt och rent.
- Naturlig svensk visuell känsla.
- Dark mode som standard; light mode kan vara ett framtida val.
- Minimalt med onödiga notiser och ett quiet mode-koncept.
- Inga högljudda varningar om de inte är kontextuellt relevanta.
- Källtransparens spelar roll.
- Verifierad information är viktigare än gissad fullständighet.
- Unknown måste förbli unknown.
- Fabricera aldrig juridisk sanning eller fiskekorrelationer.
- Privacy by design; exakta fiskeplatser är känsliga och privata.
- Regler och säkerhet får aldrig betalväggas.
- Låst premiumdata får inte laddas i smyg.
- Undvik feature bloat.
- Pike ska fungera utan AI; AI är ett förbättringslager, inte grunden.

## Development workflow

- Work/Lillen2 använder Medium reasoning som standard.
- Högre reasoning används endast för genuint svår arkitektur eller debugging.
- Föredra små, kirurgiska uppgifter med uttryckligt begränsade filer.
- Inspektera diffar och validera före commit.
- Stagea endast avsedda filer; använd **aldrig** `git add .`.
- Kontrollera alltid listan över stageade filer före commit.
- Work får committa validerade uppgifter.
- Pusha direkt via den anslutna GitHub-integrationen; försök inte med vanlig CLI-push först.
- Force-pusha aldrig.
- Användaren hämtar lokalt med `git pull --ff-only`.
- Aktiv lokal repo är `C:\Projects\projekt-pike`.
- Undvik aktiv Git-utveckling i OneDrive-synkade mappar.

## Uppdatera detta dokument

Efter meningsfulla milstolpar ska följande uppdateras:

- Current checkpoint.
- Vad som är klart och aktuellt.
- Närmaste utvecklingsordning.
- Arkitekturnoteringar när något har förändrats materiellt.

Uppdatera inte dokumentet för varje kosmetisk commit. Behåll de långsiktiga roadmap-avsnitten även när de inte är den aktuella arbetsuppgiften.
