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
