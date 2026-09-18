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
- Pike Data Ingest v1 del 3A.2: kompatibla generiska fakta för spögräns per
  person, mäskning och breda regler för flytande farkost utan semantiska alias.
- Pike Data Ingest v1 del 3A.3: explicit medlemskrav för fiske, separat från
  fiskekort, priser och köpflöden.
- Pike Data Ingest v1 del 3A: deterministisk dry-run som föreslår kompatibla nya
  appsjöar i minnet; ingen produktionsdata skrivs.
- Pike Data Ingest v1 del 3B.0: SHA-256-bunden produktionspreflight med komplett
  outputvalidering och rollback-kontrakt; preflight skriver aldrig produktion.
- Pike Data Ingest v1 del 3B.1: explicit, fingerprint-bunden apply för endast nya
  sjöar med verifierad staging, backup och kompenserande rollback.
- Pike Data Ingest v1 del 3B.2: exakt redan applicerade publikationer blir ett
  idempotent no-op-läge; avvikande befintliga ID:n förblir blockerade.
- Första verkliga ingestflödet är genomfört end-to-end: `mogolen-hedenstorp` är
  produktionssjö nummer 23 och den kvarvarande publikationen är `alreadyApplied`.
- Existing Lake Update v1 har startat. U1.0 ger explicit stale-säkra
  ändringsförslag och read-only dry-run utan produktionsskrivväg.
- Existing Lake Update v1 U1.1 ger hashbunden mänsklig review och isolerad
  publicering; Mogölens Spinn-korrigering är godkänd och publicerad men inte live.
- Existing Lake Update v1 U1.2 ger fingerprint-bunden produktionspreflight och
  explicit säker apply. Den första verkliga uppdateringen,
  `mogolen-hedenstorp-spin`, är applicerad och `alreadyApplied`; verifierad Spinn
  är nu live för Mogölen.
- Existing Lake Update v1 U1.2.1 bevarar new-lake-proveniens över senare
  granskade uppdateringar genom exakt rekonstruktion av baseline + `alreadyApplied`-
  historik; oförklarad drift fortsätter blockeras.
- Baseline Lake Audit v1 Batch A är applicerad: korrigeringarna för Vättern,
  Sommen, Stråken och Nömmen är live och samtliga fyra publikationer är
  `alreadyApplied`. Tenhultasjön krävde ingen korrigering, produktionen är kvar
  på 23 sjöar och nästa steg är Batch B.
- Baseline Lake Audit v1 Batch B är applicerad: korrigeringarna för Munksjön,
  Landsjön, Spexhultasjön och Ryssbysjön är live och samtliga fyra publikationer
  är `alreadyApplied`. Rocksjön krävde ingen Batch B-korrigering, produktionen är
  kvar på 23 sjöar.
- Matching Semantics v2 skiljer normativa metodregler från rådgivande eller
  vanliga metoder. Kontrollerad inferens gäller för handredskap, Spinn och
  Trolling, medan positiv säsongstillåtelse endast gäller när villkoret är
  aktivt. Ingen produktionsdata ändrades; nästa steg är real-state QA och
  riktade datakorrigeringar före Batch C.
- Real-state QA-korrigeringarna för Ryssbysjön, Nömmen och Sandhemssjön är
  applicerade och alla tre publikationerna är `alreadyApplied`; produktionen är
  kvar på 23 sjöar och Matching Semantics v2 är verifierad mot verkligt läge.
  Nästa steg är en slutlig user-output-QA över alla 23 sjöar före Batch C.
- Matching Semantics v2.1 ger baseline-infererad Spinn från verifierad normativ
  generell fisketillåtelse. Inferensen kedjas inte vidare till Mete eller
  Flugfiske, explicita metodrestriktioner har fortsatt företräde och ingen
  sjödata ändrades.
- Matching Semantics v2.2 skiljer artnärvaro från breda artgruppsrestriktioner.
  `speciesGroup` kan varna för en redan styrkt art men skapar inte artnärvaro;
  direkta artspecifika restriktioner kan fortsatt ge stöd. Därmed försvinner
  Sommens felaktiga stöd för Lax och Regnbåge utan ändring av produktionsdata,
  och Batch C är nästa steg efter matcher-verifieringen.
- Lake-level `distance` är nu valfritt i app-, kandidat- och
  Existing Lake/Entity Replacement-kompatibiliteten. Befintliga avstånd
  bevaras när de finns, men saknade värden blockeras inte och visas inte som
  platshållare. Produktionsdata är oförändrad; Bunn-splitten är inte genomförd.
- Baseline Lake Audit v1 Batch C är applicerad: korrigeringarna för
  Ulvstorpasjön, Mullsjön och Hökesjön är live. Risbrodammen och Attarpsdammen
  krävde inga ändringar; update-livscykeln är 15 `alreadyApplied` och noll
  väntande, produktionen är kvar på 23 sjöar och Matching Semantics v2.2 är
  verifierad mot Batch C. Nästa steg är manuell UI-kontroll och därefter Batch D.
- Baseline Lake Audit v1 Batch D:s förslagssteg är klart med ett ogranskat,
  opublicerat och oapplicerat förslag för Sandhemssjön. Gravsjön, Knipesjön och
  Klappasjön krävde ingen korrigering. Svansjön är uppskjuten eftersom nuvarande
  representation inte säkert kan uttrycka vinterkortets begränsning till endast
  pimpelfiske. Produktionen är oförändrad med 23 sjöar och publicerad
  update-historik är fortsatt 15 `alreadyApplied` och noll väntande.
- Batch D1-uppdateringen för Sandhemssjön är applicerad: grundregelsammanfattningen
  är verifierad och kräftfiske är registrerat som begränsat eftersom det inte
  ingår i det ordinarie fiskekortet. Produktionen är fortsatt 23 sjöar och
  update-livscykeln är 16 `alreadyApplied` med noll väntande.
- En minimal generell `permitMethodSupport`-modell skiljer metodstöd mellan
  korttyper utan gissade säsongsdatum eller korsinferens. Svansjöns uppdatering
  är applicerad: ordinarie öppet-vatten-kort ger Spinn och Flugfiske, medan det
  separata isfiskekortet ger Pimpelfiske. Ingen kalenderperiod antas;
  produktionen är fortsatt 23 sjöar och livscykeln är 17 `alreadyApplied` /
  0 pending. Sjödetaljen visar strukturerat kortstöd som läsbara korttyper utan
  att interna nycklar eller JavaScripts standardsträng för objekt läcker ut.

- Entity Replacement v1 är implementerad som separat manifest/review/publish/
  preflight/apply-livscykel med verifierad staging, rollback och beständig historik
  för en identitet till minst två ersättare. Första avsedda användning är Bunn;
  själva delningen är inte implementerad. Produktionen är oförändrad: 23 sjöar,
  17 `alreadyApplied` updates och 0 pending. Nästa steg är ett komplett Bunn-
  ersättningsmanifest för separat mänsklig granskning, inte produktionsapply.
  Kontrakt och v1-gränser finns i `docs/ENTITY_REPLACEMENT_CONTRACT.md`.
- Djupforskningskontraktet är leverantörsneutralt: `available` kräver leverantör,
  HTTP(S)-källa och känd materialpost men inte ett fabricerat SMHI-id. Ett angivet
  `smhiLakeId` valideras fortsatt strikt, och tillgängligt källmaterial innebär
  inte publiceringsberedskap. Detta undanröjer schemaspärren för att författa
  Bunns ersättningsmanifest.
- Det kompletta Entity Replacement-manifestet `bunn-split-1` är skapat och
  validerat som ett ogranskat förslag för `bunn` → `bunn-norra-mellersta` och
  `bunn-sodra`. Det har inte granskats, publicerats, preflightats för apply eller
  applicerats; produktionen är oförändrad med 23 sjöar, 17 `alreadyApplied`
  Existing Lake Updates och inga väntande publicerade uppdateringar eller
  ersättningar.

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

- Nästa större arbete är Baseline Lake Audit v1 för de ursprungliga sjöarna,
  följt senare av ett separat granskat workflow för uppdatering av befintliga sjöar.
- Därefter välja nästa sjöar runt Jönköping.
- Prioritera användbara vatten som inte redan är väl täckta på andra håll.
- Samla kompletta, källbelagda sjöpaket.

### C. Nästa större tekniska infrastruktur

- Pike Data Ingest v1.
- Kandidatformat och validator är klara i del 1; samla erfarenhet från källbelagda kandidater.
- Del 2 har manuell review och isolerad publish; del 3A kan föreslå och del 3B.1
  explicit applicera nya kompatibla appsjöar. Uppdatering av befintliga sjöar
  kräver fortsatt ett separat granskat flöde.

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

- Nuvarande referensdataset: 23 sjöar.
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

Del 3A.2 stöder `methods.maxRodsPerPerson`, `methods.chumming` och
`watercraft.floatingCraft` som separata, källbundna fakta. De mappas generiskt
utan att per-person blir per-kort eller breda farkostregler expanderas till båt,
kajak eller flytring.

Del 3A.3 stöder `access.membershipRequirement` som ett explicit textfaktum för
krav på medlemskap i en fiskeklubb eller organisation. Det mappas inte till eller
härleds från fiskekortskrav, priser, produkter eller köp.

Del 3A är implementerad som en deterministisk dry-run i
`scripts/buildLakeDataset.mjs` (`npm run build:lake-data`). Den läser endast
`data/published/`, återanvänder compatibility-kontraktet och föreslår kompatibla
nya sjöar samt djupkartestatus i minnet. Ett befintligt ID räknas som redan
applicerat endast när både den kompletta mappade sjön och djupkartestatusen matchar
produktion exakt; alla avvikelser och kompatibilitetsfel blockeras. Published är
inte live: buildern saknar apply- och skrivläge och produktionsdata förblir orörd.

Del 3B.0 är implementerad som en read-only produktionspreflight i
`scripts/preflightLakeDataset.mjs` (`npm run preflight:lake-data`). Den binder
aktuella produktionsfiler och fullständiga föreslagna ersättningsbytes med SHA-256,
bevarar befintliga sjöposter och ordning, validerar hela framtida datasetet och
beskriver staging/backup/rollback för två filer. Preflight är inte apply;
produktionsskrivning sker endast genom den separata explicita del 3B.1-kommandot.

Del 3B.1 är implementerad som `npm run apply:lake-data`. Kommandot räknar om
preflight, binder även ordered published-input, kontrollerar produktionsfingerprint
omedelbart före staging och igen före replacement, verifierar båda backuperna och
de kompletta staged/finala dataseten samt återställer samtliga filer vid fel.
Apply är aldrig automatisk och stöder endast nya ID:n; befintliga sjöar kan inte
uppdateras eller tas bort. Första verkliga sjön ska appliceras som en separat,
mänskligt observerad milstolpe. Se `docs/PRODUCTION_APPLY_CONTRACT.md`.

Del 3B.2 gör den beständiga publiceringshistoriken idempotent efter apply: en
exakt match klassas explicit som redan applicerad och ger en eligible no-op.
Apply-testet vägrar samtidigt att anropa real-repository apply när preflight visar
väntande filändringar.

Det första verkliga flödet har nu körts hela vägen från kandidat via review/hash,
publish, dry-run och preflight till explicit apply. `mogolen-hedenstorp` är live
som sjö 23, och efterföljande preflight/apply är ett verifierat `alreadyApplied`
no-op-läge.

Existing Lake Update v1 U1.0 är en separat grund för befintliga sjöar. Förslagen
binds till exakt canonical fingerprint av aktuell produktionspost, anger varje
förväntat före-värde och utvärderas endast i minnet mot hela produktionsvalidatorn.
U1.1 binder ett mänskligt beslut till förslagets canonical SHA-256 och publicerar
godkända, fortsatt aktuella förslag isolerat i `data/published-updates/`.
Mogölens tillägg av `details.methods.spin` är godkänt och publicerat som
uppdateringsartefakt. U1.2 klassar publicerad historik som pending,
`alreadyApplied` eller blockerad och återanvänder den verifierade staging-, backup-
och rollback-motorn via separata `preflight:lake-updates` och
`apply:lake-updates`. Den verkliga Mogölen-korrigeringen är nu applicerad:
`details.methods.spin` är verifierat tillåten och uppdateringen är ett idempotent
`alreadyApplied`-läge. U1.2.1 låter den ursprungliga new-lake-publikationen förbli
uppfylld efter senare uppdateringar endast när hela den aktuella sjön kan
rekonstrueras exakt från dess oföränderliga baseline och giltig `alreadyApplied`-
historik. Pending eller ogiltiga uppdateringar förklarar aldrig produktionsdrift.
Det separata existing-lake-flödet har därmed körts end-to-end; nästa större
dataarbete är Baseline Lake Audit v1.

Arkitektur:

`candidate -> validate -> review -> publish -> compatibility -> dry-run build -> production preflight -> explicit production apply`

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
