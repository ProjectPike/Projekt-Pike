# Isolerad publicering — inte appens sjödata

Här skriver ingest-kommandot en `<lake-id>.json` först efter godkänd validering
och ett matchande, explicit mänskligt review-beslut. Se `../reviews/README.md`.

Format: `{ "schemaVersion": 1, "candidate": { ... }, "review": { ... } }`.
Kandidatens uppgifter, unknown, källor och verifieringsmetadata bevaras tillsammans
med godkännandet. Output är deterministisk canonical JSON med avslutande radslut;
inga aktuella tidsstämplar eller härledda fakta läggs till.

- Första publicering skapar filen exklusivt, utan overwrite.
- Identiskt parsad output, inklusive review, ger unchanged utan skrivning.
- Annat befintligt innehåll, skadad JSON eller symboliska länkar blockerar.
- Inget force-läge och ingen valfri CLI-utdatakatalog finns.
- Ett avbrutet skrivförsök kan lämna en ofullständig fil som blockerar nya försök;
  den måste inspekteras manuellt, aldrig skrivas över automatiskt.

Appen läser inte denna katalog. Ingen av de 22 produktionssjöarna migreras eller
ändras. Appimport, uppdateringar/återkallelse och batchpublicering är senare arbete.

## Compatibility contract mot dagens app

`scripts/publishedLakeCompatibility.mjs` är ett rent, deterministiskt preflight-
kontrakt. Det skriver ingenting och kopplar inte `data/published/` till appen.
Kontraktet kräver ett intakt, approved och hashbundet published-dokument innan
något kandidatfält kan klassas som kompatibelt.

Säkert mappningsbart idag:

- `candidate.id` och `candidate.name`.
- `region`, `counties` och `location.coordinates` när de uttryckligen finns.
- De sju strikt validerade fälten i `candidate.app`, när hela integrationsblocket
  finns: `type`, `coordinateSource`, `distance`, `verification`, `fishing`,
  `practical` och `lakeDepthMapResearch`.
- Ett enda faktum per uttryckligen känd `details.<section>.<key>` när appen använder
  en singleton-post. Käll-ID:n expanderas deterministiskt till appens inline-format
  `{ url, type }`; `note` och datum-/tidsvillkor bevaras utan tolkning.
- Faktumets `valueType` måste motsvara nyckelns nuvarande apprepresentation;
  exempelvis artlistor som `string-list` och numeriska gränser som `number`.
- Saknade appsektioner i `details` skapas som tomma objekt. Tomt betyder inga
  uppgifter och ger inget tillstånd.

Fälten ovan måste vara uttryckligen författade i kandidatens review-bundna
`app`-block och får inte härledas ur namn, källordning eller faktatext. Även
`region`, `counties` och `coordinates` måste finnas. Kandidatvalidering betyder
inte integrationsredo: compatibility rapporterar varje saknat explicitfält med
`missing-explicit-field`.

Integration blockeras när kandidaten innehåller:

- `depthMap`-fakta; appens djupdata har separat research-, georefererings- och
  publiceringsmodell.
- art-, metod- eller platsvillkor. Nuvarande runtime bevarar bara datum och tid i
  ett vanligt faktum och får inte tyst bredda ett avgränsat påstående.
- flera varianter av samma singleton-nyckel.
- arraybaserade fakta som kräver app-only-discriminatorer eller geometri, till
  exempel `species.sizeLimits`, `species.closedSeasons`, områden, ramper och
  säkerhetslistor.
- en faktanyckel som inte uttryckligen känns igen av dagens app.
- en `valueType` som dagens representation för den specifika nyckeln inte kan
  bevara utan betydelseförändring.

För att häva blockeringarna krävs en avsiktlig kandidat-schemaversion för
discriminatorer (`species`/`speciesGroup`/namngiven plats), komplexa värden och
geometri, plus runtime-stöd för urvalsavgränsningar och flera scoped fakta utan
att ändra deras innebörd. Djupkartor ska fortsatt ha ett separat kompatibilitets-
och granskningsflöde. Appens legacy-sammanfattningar är tills vidare explicit
review-bunden appmetadata och får inte syntetiseras från domain-fakta.

**Published är fortfarande inte live.** Kontraktet kan nu godkänna en fullständig
minimal representation, men ingen builder eller produktionskoppling finns ännu.
