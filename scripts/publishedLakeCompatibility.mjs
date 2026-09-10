import { candidateHash, validateReview } from "./publishCandidateLake.mjs";
import { validateCandidate } from "./validateCandidateLakes.mjs";

export const appDetailSections = [
  "access",
  "methods",
  "species",
  "watercraft",
  "boat",
  "practical",
  "geography",
  "safety",
];

const singletonFactKeys = {
  access: [
    "familyCoverage", "permitCost", "permitPrice", "permitProducts",
    "permitRequirement", "purchase", "purchaseChannels", "validity", "youthRules",
  ],
  methods: [
    "angeldonContinuousSupervision", "angeldonOnlyIceCoveredWater",
    "augustFishingHours", "augustSportFishingHours", "bait",
    "crayfishFishing", "dragFromBoatWinterIceFree", "dragRowingMaxAnglers",
    "familyPermitMaxLinesPerAngler", "fishingHoursInSeason", "fishingSeason",
    "fixedGear", "fly", "handGearOnly", "ice", "iceMaxAngeldonPerAngelkort",
    "iceMaxAngeldonPerAngler", "iceMaxAngeldonPerPermit", "iceMaxBaitsPerAngler",
    "iceMaxLuresPerPerson", "lureFishing", "maxFishingDepthMeters",
    "maxHooksPerPerson", "maxLinesPerFishingCard", "maxLinesPerFishingPermit",
    "maxRodsPerPermit", "nets", "openWaterMaxLuresPerPerson", "outsideSeasonFishing",
    "publicFishing", "spin", "summerFishing", "trolling", "weekdayClosures",
    "winterFishing", "winterIceFishingAnnualPermit",
  ],
  species: ["knownSpecies", "stockedSportFish"],
  watercraft: ["boat", "floatTube", "kayak"],
  boat: [
    "boatMarkingRequirement", "boatRentalAvailable", "combustionMotor",
    "electricMotor", "fvoNotificationRequirement", "singleHookRecommendation",
    "speedLimits", "trolling", "trollingMaxBaitsPerBoat",
    "trollingParticipantsNeedCard", "trollingPermitRequirement",
    "trollingTechniquesProhibited",
  ],
  practical: [
    "accessibility", "boatRamp", "fishingPierAtBathingArea",
    "maxRodsPerPersonFromBoat", "parkingAtBoatStations", "parkingAtLaunch",
    "ramp", "rampsAvailable", "rentalAgeRule", "visitorFacilities",
  ],
  geography: ["tributaries"],
  safety: ["invasiveSpeciesHygiene", "winterFishingRisk"],
};

const arrayFactKeys = new Set([
  "geography.fishingProhibitionAreas",
  "geography.protectedAreas",
  "geography.seasonalAreas",
  "practical.piers",
  "practical.ramps",
  "practical.rentalStations",
  "safety.consumptionAdvisories",
  "safety.navigationNotes",
  "species.bagLimits",
  "species.closedSeasons",
  "species.directedFishingProhibitions",
  "species.directedFishingRestrictions",
  "species.releaseRequirements",
  "species.releaseRestrictions",
  "species.sizeLimits",
]);

const numberFactKeys = new Set([
  "access.permitCost",
  "boat.speedLimits",
  "boat.trollingMaxBaitsPerBoat",
  "methods.dragRowingMaxAnglers",
  "methods.familyPermitMaxLinesPerAngler",
  "methods.iceMaxAngeldonPerAngelkort",
  "methods.iceMaxAngeldonPerAngler",
  "methods.iceMaxAngeldonPerPermit",
  "methods.iceMaxBaitsPerAngler",
  "methods.iceMaxLuresPerPerson",
  "methods.maxFishingDepthMeters",
  "methods.maxHooksPerPerson",
  "methods.maxLinesPerFishingCard",
  "methods.maxLinesPerFishingPermit",
  "methods.maxRodsPerPermit",
  "methods.openWaterMaxLuresPerPerson",
  "practical.maxRodsPerPersonFromBoat",
]);

const stringListFactKeys = new Set([
  "access.permitProducts",
  "access.purchaseChannels",
  "species.knownSpecies",
  "species.stockedSportFish",
]);

const appOnlyFields = [
  "type",
  "coordinateSource",
  "distance",
  "verification",
  "fishing",
  "practical",
  "lakeDepthMapResearch",
];

export const publishedToAppCompatibilityContract = Object.freeze({
  schemaVersion: 1,
  safeCandidateFields: ["id", "name", "region", "counties", "location.coordinates"],
  appOnlyFields,
  appDetailSections,
  singletonFactKeys: Object.fromEntries(
    Object.entries(singletonFactKeys).map(([section, keys]) => [section, [...keys]]),
  ),
  blockedConstructions: [
    "depthMap facts",
    "facts with species, method or place conditions",
    "multiple facts for one singleton section/key",
    "array-backed app facts that require discriminators or geometry",
    "fact keys not explicitly recognized by the current app",
    "fact value types that differ from the current app representation",
  ],
});

function blocker(code, path, message) {
  return { code, path, message };
}

function publicationErrors(publication) {
  if (!publication || typeof publication !== "object" || Array.isArray(publication)) {
    return [blocker("invalid-publication", "$", "expected published document object")];
  }

  const errors = [];
  const allowedFields = new Set(["schemaVersion", "candidate", "review"]);
  for (const field of ["schemaVersion", "candidate", "review"]) {
    if (!Object.hasOwn(publication, field)) {
      errors.push(blocker("invalid-publication", `$.${field}`, "required field missing"));
    }
  }
  for (const field of Object.keys(publication)) {
    if (!allowedFields.has(field)) {
      errors.push(blocker("invalid-publication", `$.${field}`, "unsupported field"));
    }
  }
  if (publication.schemaVersion !== 1) {
    errors.push(blocker("invalid-publication", "$.schemaVersion", "expected 1"));
  }

  for (const error of validateCandidate(publication.candidate)) {
    errors.push(blocker("invalid-candidate", `$.candidate.${error}`, error));
  }
  for (const error of validateReview(publication.review)) {
    errors.push(blocker("invalid-review", `$.${error}`, error));
  }

  const { candidate, review } = publication;
  if (candidate && review) {
    if (review.candidateId !== candidate.id) {
      errors.push(blocker("review-identity-mismatch", "$.review.candidateId", "must match candidate.id"));
    }
    if (review.decision !== "approved") {
      errors.push(blocker("review-not-approved", "$.review.decision", "published candidate must be approved"));
    }
    if (review.candidateHash !== candidateHash(candidate)) {
      errors.push(blocker("review-hash-mismatch", "$.review.candidateHash", "must match candidate canonical JSON"));
    }
  }

  return errors;
}

export function assessPublishedLakeCompatibility(publication) {
  const blockers = publicationErrors(publication);
  const candidate = publication?.candidate;
  const safeMappings = [];
  const seenFacts = new Set();

  if (blockers.length > 0) {
    return {
      compatible: false,
      blockers,
      safeMappings,
      requiredExplicitFields: [],
    };
  }

  if (candidate && typeof candidate === "object" && !Array.isArray(candidate)) {
    for (const field of ["id", "name", "region", "counties"]) {
      if (Object.hasOwn(candidate, field)) {
        safeMappings.push({ from: `candidate.${field}`, to: field });
      }
    }
    if (candidate.location) {
      safeMappings.push({ from: "candidate.location.coordinates", to: "coordinates" });
    }

    for (const [index, fact] of (candidate.details ?? []).entries()) {
      const path = `$.candidate.details[${index}]`;
      const subject = `${fact?.section}.${fact?.key}`;

      if (fact?.section === "depthMap") {
        blockers.push(blocker("unsupported-depth-map", path, "depthMap uses a separate reviewed app dataset"));
        continue;
      }
      if (!appDetailSections.includes(fact?.section)) {
        continue;
      }
      if (arrayFactKeys.has(subject)) {
        blockers.push(blocker("unsupported-array-fact", path, `${subject} requires app-only entry metadata`));
        continue;
      }
      if (!singletonFactKeys[fact.section]?.includes(fact.key)) {
        blockers.push(blocker("unsupported-fact-key", path, `${subject} is not an explicit current-app fact key`));
        continue;
      }
      const allowedValueTypes = numberFactKeys.has(subject)
        ? ["number"]
        : stringListFactKeys.has(subject)
          ? ["string-list"]
          : ["state", "text"];
      if (!allowedValueTypes.includes(fact.valueType)) {
        blockers.push(blocker(
          "unsupported-value-type",
          `${path}.valueType`,
          `${subject} requires ${allowedValueTypes.join(" or ")} for the current app`,
        ));
        continue;
      }
      if (["species", "method", "place"].some((key) => fact.conditions?.[key] !== undefined)) {
        blockers.push(blocker("unsupported-selection-condition", `${path}.conditions`, "current app does not preserve candidate selection scopes"));
        continue;
      }
      if (seenFacts.has(subject)) {
        blockers.push(blocker("multiple-singleton-facts", path, `${subject} cannot preserve multiple scoped facts`));
        continue;
      }

      seenFacts.add(subject);
      safeMappings.push({ from: `candidate.details[${index}]`, to: `details.${subject}` });
    }
  }

  const requiredExplicitFields = [...appOnlyFields];
  if (!candidate?.region) requiredExplicitFields.push("region");
  if (!candidate?.counties) requiredExplicitFields.push("counties");
  if (!candidate?.location) requiredExplicitFields.push("coordinates");

  return {
    compatible: blockers.length === 0,
    blockers,
    safeMappings,
    requiredExplicitFields,
  };
}

function appFact(fact, sourcesById) {
  const conditions = fact.conditions
    ? {
        dateFrom: fact.conditions.dateFrom ?? null,
        dateTo: fact.conditions.dateTo ?? null,
        timeFrom: fact.conditions.timeFrom ?? null,
        timeTo: fact.conditions.timeTo ?? null,
      }
    : null;

  return {
    value: fact.value,
    status: fact.status,
    ruleType: fact.ruleType,
    verifiedAt: fact.verifiedAt,
    sources: fact.sources.map((sourceId) => {
      const source = sourcesById.get(sourceId);
      return { url: source.url, type: source.type };
    }),
    note: fact.note ?? null,
    conditions,
  };
}

export function mapPublishedLakeCompatibleFields(publication) {
  const assessment = assessPublishedLakeCompatibility(publication);
  if (!assessment.compatible) {
    const summary = assessment.blockers.map(({ code, path }) => `${path}: ${code}`).join("; ");
    throw new Error(`Published lake is not app-compatible: ${summary}`);
  }

  const { candidate } = publication;
  const sourcesById = new Map(candidate.sources.map((source) => [source.id, source]));
  const details = Object.fromEntries(appDetailSections.map((section) => [section, {}]));
  for (const fact of candidate.details) {
    details[fact.section][fact.key] = appFact(fact, sourcesById);
  }

  return {
    id: candidate.id,
    name: candidate.name,
    ...(candidate.region ? { region: candidate.region } : {}),
    ...(candidate.counties ? { counties: [...candidate.counties] } : {}),
    ...(candidate.location ? { coordinates: [...candidate.location.coordinates] } : {}),
    details,
  };
}
