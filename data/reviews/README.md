# Manuell granskning — inget automatiskt godkännande

`candidate -> validate -> review -> publish`. Validering är inte godkännande.
En människa granskar kandidaten och dess källor, väljer approved eller rejected
och skriver `data/reviews/<lake-id>.json`. Ingen review skapas av validatorn.

1. Lägg kandidaten i `data/candidates/<lake-id>.json` (id måste matcha filnamnet).
2. Kör `npm run validate:candidates` och rätta strukturella fel.
3. Kör `npm run hash:candidate -- <lake-id>` och spara hashvärdet för den version
   du granskar. Läs hela kandidaten och kontrollera källor och osäkerheter manuellt.
   Ändrar du kandidaten krävs ny hash och ny granskning. Kopiera inte bara en ny
   hash till ett gammalt godkännande.
4. Skriv beslutet enligt formatet nedan med verkligt granskarfält och explicit datum.
5. Kör `npm run publish:candidate -- <lake-id>` endast efter godkännande.

```json
{
  "schemaVersion": 1,
  "candidateId": "lake-id",
  "decision": "approved",
  "reviewer": "Granskarens namn",
  "reviewedAt": "2026-09-09",
  "hashStrategy": "sha256-canonical-json-v1",
  "candidateHash": "ERSÄTT MED HASH FRÅN DEN GRANSKADE VERSIONEN",
  "note": "Valfri konkret granskningsanteckning"
}
```

Exemplet är en mall, inte ett giltigt godkännande. Datum ska anges av granskaren.
Utelämna note om den saknas. Rejected är ett uttryckligt avslag; avsaknad av
review betyder ogranskad. Fel ID, datum, fält eller hash blockerar publicering.

Hashen är SHA-256 av parsad JSON där objektnycklar sorteras rekursivt och extra
JSON-whitespace tas bort. Arrayordning och alla strängvärden bevaras. Indrag,
radslut och objektnycklars ordning påverkar inte hash. Ändrade värden, borttagna
fält, ändrade källor och omordnade arrayer kräver ny granskning. Ingen juridisk
eller semantisk normalisering görs. JSON.parse används som i del 1; duplicerade
JSON-fältnamn får inte användas (parsern behåller sista värdet).

Kandidatens valfria `app`-block ligger inne i samma hashdomän. Appmetadata får
alltså inte läggas till eller ändras efter approval utan en ny mänsklig review.

Granskarfältet är en mänsklig deklaration, inte verifierad identitet eller digital
signatur. Git-historik bevarar ändringar av review-filen. Behörigheter, revokering
och uppdatering av redan publicerat innehåll kräver ett senare separat flöde.
Ändring till rejected drar inte automatiskt tillbaka tidigare publicerade filer.
