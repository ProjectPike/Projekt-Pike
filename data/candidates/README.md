# Kandidatsjöar — Data Ingest v1, del 1

En UTF-8 JSON-fil per sjö: `<lake-id>.json`. Kör `npm run validate:candidates`
eller `node scripts/validateCandidateLakes.mjs <katalog>`.
Tom katalog är tillåten och rapporteras som 0 kandidater. Exemplet ligger separat
i `scripts/fixtures/` och är syntetiska, inte nya verkliga sjöar.

Flödet är **candidate -> validate -> review -> publish**, där publiceringen är
isolerad från appen. Se `../reviews/README.md` för det manuella arbetsflödet.
Godkänd validering betyder korrekt
struktur, aldrig granskad juridisk sanning eller publiceringsgodkännande.
Inga kandidater importeras av appen. Validatorn skriver ingenting och använder
varken nätverk eller aktuell tid. Produktionsdatans enum-definitioner återanvänds
read-only; ingen produktionsdata ändras.

## Format, schemaVersion 1

- Obligatoriskt: `schemaVersion: 1`, `id` (gemener/siffror/bindestreck), `name`,
  `sources` (array), `details` (array). Tomma arrayer betyder inga insamlade uppgifter.
- Valfritt: `region`, `counties`, `location` och det separata appblocket `app`.
- `location`: `coordinates: [longitude, latitude]`, `sources` (käll-ID:n) och
  `verifiedAt: YYYY-MM-DD`. Utelämna hela location om koordinater saknas.
- En källa har `id`, `type`, `title` (källa/organisation), HTTP(S)-`url` och
  `checkedAt: YYYY-MM-DD`. Källtyperna är Pikes befintliga typer.
  Datum anger forskarens kontroll, inte att webbplatsen är juridiskt auktoritativ.

## Explicit appintegration

`app` är separat från researchfakta och ingår i exakt samma canonical candidate-
hash som resten av kandidaten. Ändras ett appvärde efter review blir det gamla
godkännandet ogiltigt. Avsaknad av `app`, eller ett ofullständigt block, är tillåtet
för pågående research men betyder att kandidaten inte är redo för appintegration.
Inga värden fylls i eller härleds av validatorn.

Endast följande nycklar är tillåtna: `type`, `coordinateSource`, `distance`,
`verification`, `fishing`, `practical` och `lakeDepthMapResearch`. För en
integrationsredo kandidat kräver compatibility-kontraktet samtliga. Blocket
bevarar dagens minsta appform: uttrycklig typ och koordinatkälla, avstånd med
visningstext, verifieringsstatus med URL-källor, tre fishing-sammanfattningar,
parking samt uttryckligen tomma legacy-listor för ramps/piers/trails.

`lakeDepthMapResearch` stöder här endast en explicit, kontrollerad `not-found`-
post med datum, provider, SMHI-id eller null, tom maps-lista och konkret note.
Tillgänglig eller publicerad djupdata har fler granskningsgrindar och kan inte
läggas i detta block. Okända appnycklar och godtyckliga produktionsobjekt avvisas.

Varje details-post har:

- `section`: access, methods, species, watercraft, boat, practical, geography,
  safety eller depthMap.
- `key`: stabil camelCase-nyckel; återanvänd befintliga Pike-nycklar när de passar.
- `valueType`: state, text, number, boolean eller string-list.
- `value`: motsvarande primitiv eller lista av unika, icke-tomma strängar.
- `status`: verified, unverified eller unknown (faktastatus, inte kartans matchstatus).
- `ruleType`: rule, recommendation, advisory eller null för rena fakta.
- `sources`: referenser till kandidatens käll-ID:n.
- `verifiedAt`: verkligt kalenderdatum för verified, annars null.
- Valfritt: icke-tom `note` och `conditions`.

State använder allowed / prohibited / restricted / unknown. Methods och watercraft
kräver state. Kända state-värden kräver uttrycklig regeltyp så råd inte blir regler.
För unknown krävs `value: "unknown"`, `status: "unknown"`, `verifiedAt: null`
och `ruleType: null` eller `"unknown"`; valueType anger framtida förväntad typ.
Kända uppgifter kräver källa även när de är unverified. Unknown kan sakna källa.
Utelämnade uppgifter är inte tillstånd. Inga tomma strängar fyller ut saknad data.

Conditions kan ha dateFrom/dateTo (YYYY-MM-DD eller MM-DD), timeFrom/timeTo
(HH:mm), samt species/method/place (unika stränglistor). Datum/tid kan sträcka sig
över årsskifte eller midnatt; validatorn tolkar inte deras rättsliga innebörd.
Samma section/key och identiska conditions får inte förekomma två gånger.
Olika avgränsningar lämnas för mänsklig granskning, inte automatisk konfliktlösning.

## Växande forskningspaket

Access rymmer exempelvis permitRequirement och purchaseChannels; methods och
watercraft tillstånd; boat motorregler; species arter och storleksregler; safety
skyddsregler; practical parkering, ramp, brygga/access och båtuthyrning; depthMap
källbelagd kartreferens. Text och note bevarar komplexa uppgifter tills ett särskilt
schema finns. Ingen fri text tolkas till maskinella regler eller geometri.

Okända fält och typer avvisas för att fånga stavfel. Nya strukturer kräver en
avsiktlig schemauppdatering. Del 2 har separat manuell review och isolerad publish;
databas, produktionsmigrering, appimport och koll mot produktions-ID:n
ingår inte här. JSON-objekt ska ha unika fältnamn (JSON.parse behåller annars sista
värdet); validatorn kontrollerar dubbletter av kandidat-ID, källor och faktaposter.
