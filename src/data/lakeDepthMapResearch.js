const SMHI_DOWNLOAD_ROOT = "https://vattenwebb.smhi.se/svarwebb/rest/downloadmap";

function available(smhiLakeId, maps, details = {}) {
  return {
    status: "available",
    checkedAt: "2026-09-08",
    importedAt: "2026-09-08",
    provider: "SMHI Damm- och sjöregister",
    smhiLakeId,
    sourceUrl: `${SMHI_DOWNLOAD_ROOT}/${smhiLakeId}`,
    maps,
    bathymetry: {
      sourceType: "scanned source map",
      processingState: "needs-review",
      georeferencingStatus: "unverified",
      qualityStatus: "needs-review",
      published: false,
      reviewNote: "Källan är inventerad men har inte passerat Pikes georefererings- och vektorkontroll.",
    },
    ...details,
  };
}

function notFound(smhiLakeId, note) {
  return {
    status: "not-found",
    checkedAt: "2026-09-08",
    provider: "SMHI Damm- och sjöregister",
    smhiLakeId,
    maps: [],
    note,
  };
}

// Research ledger, not runtime fishing data. Every lake must have an entry so
// validate:lakes forces a depth-map check when a new lake is added.
export const lakeDepthMapResearch = {
  "bolmen": {
    "status": "available",
    "checkedAt": "2026-09-08",
    "importedAt": "2026-09-08",
    "provider": "SMHI Damm- och sjöregister",
    "smhiLakeId": "629511-136866",
    "sourceUrl": "https://vattenwebb.smhi.se/svarwebb/rest/downloadmap/629511-136866",
    "maps": [
      {
        "mapNumber": "2-0178",
        "formats": [
          "tiff"
        ],
        "source": "Karl Sidenvall"
      },
      {
        "mapNumber": "0-0065",
        "formats": [
          "tiff"
        ],
        "source": "Västra Bolmens båtklubb / Inge Palm"
      }
    ],
    "bathymetry": {
      "sourceType": "historical multi-sheet TIFF scans",
      "processingState": "needs-review",
      "georeferencingStatus": "rejected-bounding-box",
      "qualityStatus": "failed",
      "published": false,
      "reviewNote": "Översiktsblad och detaljblad måste georefereras var för sig. Tidigare bounding-box-passning är underkänd."
    },
    "maxDepthMeters": 37,
    "meanDepthMeters": 5.4
  },
  "sommen": {
    "status": "available",
    "checkedAt": "2026-09-08",
    "importedAt": "2026-09-08",
    "provider": "SMHI Damm- och sjöregister",
    "smhiLakeId": "644727-145497",
    "sourceUrl": "https://vattenwebb.smhi.se/svarwebb/rest/downloadmap/644727-145497",
    "maps": [
      {
        "mapNumber": "0-0060",
        "formats": [
          "tiff"
        ],
        "source": "Sven Björnsson / K-konsult"
      }
    ],
    "bathymetry": {
      "sourceType": "historical overview TIFF scans",
      "processingState": "needs-review",
      "georeferencingStatus": "unverified",
      "qualityStatus": "needs-review",
      "published": false,
      "reviewNote": "Översiktsbladens kurvor och etiketter måste separeras från kartgrafiken."
    },
    "surveyYear": 1981,
    "maxDepthMeters": 53,
    "meanDepthMeters": 16.7
  },
  "vattern": {
    "status": "available",
    "checkedAt": "2026-09-08",
    "importedAt": "2026-09-08",
    "provider": "SMHI Damm- och sjöregister",
    "smhiLakeId": "649029-145550",
    "sourceUrl": "https://vattenwebb.smhi.se/svarwebb/rest/downloadmap/649029-145550",
    "maps": [
      {
        "mapNumber": "3-0736",
        "formats": [
          "tiff"
        ],
        "source": null
      },
      {
        "mapNumber": "3-3649",
        "formats": [
          "tiff"
        ],
        "source": "SMHI"
      },
      {
        "mapNumber": "3-6516",
        "formats": [
          "tiff"
        ],
        "source": "MYRICA"
      }
    ],
    "bathymetry": {
      "sourceType": "mixed TIFF/JPEG historical maps",
      "processingState": "needs-review",
      "georeferencingStatus": "unverified",
      "qualityStatus": "needs-review",
      "published": false,
      "reviewNote": "Källpaketet blandar översikt, profil och delkartor; heltäckande verifierad konturgeometri saknas ännu."
    },
    "maxDepthMeters": 120,
    "meanDepthMeters": 40.8
  },
  "munksjon": {
    "status": "available",
    "checkedAt": "2026-09-08",
    "importedAt": "2026-09-08",
    "provider": "SMHI Damm- och sjöregister",
    "smhiLakeId": "640746-140268",
    "sourceUrl": "https://vattenwebb.smhi.se/svarwebb/rest/downloadmap/640746-140268",
    "maps": [
      {
        "mapNumber": "3-6432",
        "formats": [
          "jpeg",
          "tiff"
        ],
        "source": "MYRICA"
      }
    ],
    "bathymetry": {
      "sourceType": "modern color JPEG with two-metre contours",
      "sourceMapNumber": "3-6432",
      "processingState": "published",
      "georeferencingStatus": "affine-shoreline-fit",
      "qualityStatus": "verified",
      "published": true,
      "verifiedAt": "2026-09-08",
      "dataUrl": "/bathymetry/munksjon.geojson",
      "controlPointCount": 800,
      "shorelineMeanResidualMeters": 26.1,
      "shorelineP90ResidualMeters": 71.3,
      "preclipOutsidePercent": 12.06,
      "postclipLandPointCount": 0,
      "postclipSampleCount": 40684,
      "reviewNote": "Tvåmeterszonerna 2–18 m är vektoriserade från MYRICA-kartan. Robust passning låter moderna urbana strandändringar vara lokala avvikelser i stället för att förvränga djupstrukturen."
    },
    "surveyYear": 2002,
    "maxDepthMeters": 20.4,
    "meanDepthMeters": 9
  },
  "rocksjon": {
    "status": "available",
    "checkedAt": "2026-09-08",
    "importedAt": "2026-09-08",
    "provider": "SMHI Damm- och sjöregister",
    "smhiLakeId": "640627-140342",
    "sourceUrl": "https://vattenwebb.smhi.se/svarwebb/rest/downloadmap/640627-140342",
    "maps": [
      {
        "mapNumber": "2-0136",
        "formats": [
          "tiff"
        ],
        "source": "Jönköpings stads byggnadskontor"
      }
    ],
    "bathymetry": {
      "sourceType": "historical TIFF with sounding grid",
      "processingState": "needs-review",
      "georeferencingStatus": "unverified",
      "qualityStatus": "needs-review",
      "published": false,
      "reviewNote": "Rutnät och omgivande stadskarta kan inte automatiskt tolkas som djupkurvor."
    },
    "maxDepthMeters": 11.3
  },
  "landsjon": {
    "status": "available",
    "checkedAt": "2026-09-08",
    "importedAt": "2026-09-08",
    "provider": "SMHI Damm- och sjöregister",
    "smhiLakeId": "641691-140988",
    "sourceUrl": "https://vattenwebb.smhi.se/svarwebb/rest/downloadmap/641691-140988",
    "maps": [
      {
        "mapNumber": "3-0726",
        "formats": [
          "tiff"
        ],
        "source": "Jönköpings läns Hushållningssällskap"
      }
    ],
    "bathymetry": {
      "sourceType": "historical TIFF sounding transects",
      "processingState": "needs-review",
      "georeferencingStatus": "unverified",
      "qualityStatus": "limited-source",
      "published": false,
      "reviewNote": "Underlaget visar främst mätlinjer och stödjer inte ett komplett konturlager."
    },
    "surveyYear": 1919,
    "maxDepthMeters": 11.2,
    "meanDepthMeters": 6.6
  },
  "ulvstorpasjon": {
    "status": "not-found",
    "checkedAt": "2026-09-08",
    "provider": "SMHI Damm- och sjöregister",
    "smhiLakeId": "640478-139829",
    "maps": [],
    "note": "Rätt sjö hittades i SMHI-registret men saknar publicerad djupkarta."
  },
  "tenhultasjon": {
    "status": "available",
    "checkedAt": "2026-09-08",
    "importedAt": "2026-09-08",
    "provider": "SMHI Damm- och sjöregister",
    "smhiLakeId": "639911-141350",
    "sourceUrl": "https://vattenwebb.smhi.se/svarwebb/rest/downloadmap/639911-141350",
    "maps": [
      {
        "mapNumber": "3-0742",
        "formats": [
          "tiff"
        ],
        "source": null
      },
      {
        "mapNumber": "3-1829",
        "formats": [
          "tiff"
        ],
        "source": null
      }
    ],
    "bathymetry": {
      "sourceType": "historical TIFF sounding and contour maps",
      "sourceMapNumber": "3-1829",
      "processingState": "needs-review",
      "georeferencingStatus": "affine-shoreline-fit",
      "qualityStatus": "needs-review",
      "published": false,
      "controlPointCount": 800,
      "shorelineMeanResidualMeters": 32.2,
      "shorelineP90ResidualMeters": 79.1,
      "postclipLandPointCount": null,
      "postclipSampleCount": 0,
      "reviewNote": "3-0742 visar endast lodlinjer. 3-1829 har bättre strandform och kurvor, men lodsiffror skär kurvorna och kartan anger inte kurvornas djupvärden entydigt. Georefereringen håller; konturgeometrin publiceras inte förrän linjer och värden kan separeras utan antaganden."
    },
    "surveyYear": 1920,
    "maxDepthMeters": 30,
    "meanDepthMeters": 10.9
  },
  "straken": {
    "status": "available",
    "checkedAt": "2026-09-08",
    "importedAt": "2026-09-08",
    "provider": "SMHI Damm- och sjöregister",
    "smhiLakeId": "642933-138293",
    "sourceUrl": "https://vattenwebb.smhi.se/svarwebb/rest/downloadmap/642933-138293",
    "maps": [
      {
        "mapNumber": "2-0212",
        "formats": [
          "tiff"
        ],
        "source": "T. Freidenfelt"
      }
    ],
    "bathymetry": {
      "sourceType": "scanned elongated contour map",
      "processingState": "needs-review",
      "georeferencingStatus": "unverified",
      "qualityStatus": "needs-review",
      "published": false,
      "reviewNote": "Det smala underlaget behöver sektionsvis kontroll för att undvika längdledsförvrängning."
    },
    "surveyYear": 2008,
    "maxDepthMeters": 38,
    "meanDepthMeters": 9.1
  },
  "spexhultasjon": {
    "status": "available",
    "checkedAt": "2026-09-08",
    "importedAt": "2026-09-08",
    "provider": "SMHI Damm- och sjöregister",
    "smhiLakeId": "638925-143297",
    "sourceUrl": "https://vattenwebb.smhi.se/svarwebb/rest/downloadmap/638925-143297",
    "maps": [
      {
        "mapNumber": "3-2540",
        "formats": [
          "tiff"
        ],
        "source": null
      }
    ],
    "bathymetry": {
      "sourceType": "historical TIFF contour map covering two lakes",
      "processingState": "needs-review",
      "georeferencingStatus": "unverified",
      "qualityStatus": "needs-review",
      "published": false,
      "reviewNote": "Rätt sjö måste separeras från Bäckafallasjön före georeferering."
    },
    "surveyYear": 1994,
    "maxDepthMeters": 4.5,
    "meanDepthMeters": 2.3
  },
  "ryssbysjon": {
    "status": "not-found",
    "checkedAt": "2026-09-08",
    "provider": "SMHI Damm- och sjöregister",
    "smhiLakeId": "639905-143013",
    "maps": [],
    "note": "Rätt Ryssbysjön hittades men saknar karta; kartan för den namnlika sjön på annan ort är exkluderad."
  },
  "nommen": {
    "status": "available",
    "checkedAt": "2026-09-08",
    "importedAt": "2026-09-08",
    "provider": "SMHI Damm- och sjöregister",
    "smhiLakeId": "638280-144298",
    "sourceUrl": "https://vattenwebb.smhi.se/svarwebb/rest/downloadmap/638280-144298",
    "maps": [
      {
        "mapNumber": "3-1812",
        "formats": [
          "tiff"
        ],
        "source": null
      }
    ],
    "bathymetry": {
      "sourceType": "historical TIFF with dense soundings",
      "processingState": "needs-review",
      "georeferencingStatus": "unverified",
      "qualityStatus": "needs-review",
      "published": false,
      "reviewNote": "Täta lodningar och bakgrundstext kräver säker punkt- och värdeextraktion."
    },
    "surveyYear": 1995
  },
  "risbrodammen": {
    "status": "not-found",
    "checkedAt": "2026-09-08",
    "provider": "SMHI Damm- och sjöregister",
    "smhiLakeId": null,
    "maps": [],
    "note": "Ingen säker träff eller publicerad djupkarta hittades i SMHI-registret."
  },
  "mullsjon": {
    "status": "available",
    "checkedAt": "2026-09-08",
    "importedAt": "2026-09-08",
    "provider": "SMHI Damm- och sjöregister",
    "smhiLakeId": "642253-138558",
    "sourceUrl": "https://vattenwebb.smhi.se/svarwebb/rest/downloadmap/642253-138558",
    "maps": [
      {
        "mapNumber": "3-0727",
        "formats": [
          "tiff"
        ],
        "source": "T. Freidenfelt"
      },
      {
        "mapNumber": "0-0160",
        "formats": [
          "tiff"
        ],
        "source": null
      }
    ],
    "bathymetry": {
      "sourceType": "composite historical JPEG/TIFF survey",
      "processingState": "needs-review",
      "georeferencingStatus": "unverified",
      "qualityStatus": "needs-review",
      "published": false,
      "reviewNote": "Överlappande rutnät, skanningsskarvar och karttext måste separeras från djupinformationen."
    },
    "surveyYear": 1922,
    "maxDepthMeters": 18
  },
  "gravsjon": {
    "status": "not-found",
    "checkedAt": "2026-09-08",
    "provider": "SMHI Damm- och sjöregister",
    "smhiLakeId": "642881-138626",
    "maps": [],
    "note": "Rätt Gravsjön hittades men saknar karta; en karta för en namnlika sjö på annan ort är exkluderad."
  },
  "sandhemssjon": {
    "status": "available",
    "checkedAt": "2026-09-08",
    "importedAt": "2026-09-08",
    "provider": "SMHI Damm- och sjöregister",
    "smhiLakeId": "643143-138037",
    "sourceUrl": "https://vattenwebb.smhi.se/svarwebb/rest/downloadmap/643143-138037",
    "maps": [
      {
        "mapNumber": "3-1465",
        "formats": [
          "tiff"
        ],
        "source": "T. Freidenfelt"
      }
    ],
    "bathymetry": {
      "sourceType": "historical TIFF sounding transects",
      "processingState": "needs-review",
      "georeferencingStatus": "unverified",
      "qualityStatus": "limited-source",
      "published": false,
      "reviewNote": "Underlaget består främst av tvärsektioner och tabeller, inte verifierade djupkurvor."
    },
    "surveyYear": 1920,
    "maxDepthMeters": 10.7
  },
  "knipesjon": {
    "status": "available",
    "checkedAt": "2026-09-08",
    "importedAt": "2026-09-08",
    "provider": "SMHI Damm- och sjöregister",
    "smhiLakeId": "642528-138795",
    "sourceUrl": "https://vattenwebb.smhi.se/svarwebb/rest/downloadmap/642528-138795",
    "maps": [
      {
        "mapNumber": "3-0724",
        "formats": [
          "tiff"
        ],
        "source": null
      },
      {
        "mapNumber": "3-2580",
        "formats": [
          "tiff"
        ],
        "source": null
      },
      {
        "mapNumber": "5-0026",
        "formats": [
          "pdf"
        ],
        "source": null
      }
    ],
    "bathymetry": {
      "sourceType": "modern raster PDF with one-metre color bands",
      "sourceMapNumber": "5-0026",
      "processingState": "published",
      "georeferencingStatus": "affine-shoreline-fit",
      "qualityStatus": "verified",
      "published": true,
      "verifiedAt": "2026-09-08",
      "dataUrl": "/bathymetry/knipesjon.geojson",
      "shorelineMeanResidualMeters": 37.9,
      "shorelineP90ResidualMeters": 116.7,
      "reviewNote": "Färgzonerna 1–4 m är vektoriserade; den grunda östra bassängen saknar påhittade extrakurvor."
    },
    "surveyYear": 2010,
    "maxDepthMeters": 4.2,
    "meanDepthMeters": 1.4
  },
  "hokesjon": {
    "status": "available",
    "checkedAt": "2026-09-08",
    "importedAt": "2026-09-08",
    "provider": "SMHI Damm- och sjöregister",
    "smhiLakeId": "642099-139212",
    "sourceUrl": "https://vattenwebb.smhi.se/svarwebb/rest/downloadmap/642099-139212",
    "maps": [
      {
        "mapNumber": "5-0025",
        "formats": [
          "pdf"
        ],
        "source": "Länsstyrelsen / Cybera"
      }
    ],
    "bathymetry": {
      "sourceType": "modern raster PDF with one-metre color bands",
      "sourceMapNumber": "5-0025",
      "processingState": "published",
      "georeferencingStatus": "affine-shoreline-fit",
      "qualityStatus": "verified",
      "published": true,
      "verifiedAt": "2026-09-08",
      "dataUrl": "/bathymetry/hokesjon.geojson",
      "shorelineMeanResidualMeters": 18.7,
      "shorelineP90ResidualMeters": 47.1,
      "reviewNote": "Färgzonerna 2–5 m är vektoriserade och visuellt kontrollerade mot modern strandlinje och öar."
    },
    "surveyYear": 2010,
    "maxDepthMeters": 5.6,
    "meanDepthMeters": 2.9
  },
  "attarpsdammen": {
    "status": "not-found",
    "checkedAt": "2026-09-08",
    "provider": "SMHI Damm- och sjöregister",
    "smhiLakeId": null,
    "maps": [],
    "note": "Ingen säker träff eller publicerad djupkarta hittades i SMHI-registret."
  },
  "klappasjon": {
    "status": "available",
    "checkedAt": "2026-09-08",
    "importedAt": "2026-09-08",
    "provider": "SMHI Damm- och sjöregister",
    "smhiLakeId": "638147-142329",
    "sourceUrl": "https://vattenwebb.smhi.se/svarwebb/rest/downloadmap/638147-142329",
    "maps": [
      {
        "mapNumber": "3-3402",
        "formats": [
          "tiff"
        ],
        "source": "Nässjö kommun"
      }
    ],
    "bathymetry": {
      "sourceType": "historical TIFF contour map",
      "sourceMapNumber": "3-3402",
      "processingState": "verified",
      "georeferencingStatus": "affine-shoreline-fit",
      "qualityStatus": "verified",
      "published": false,
      "verifiedAt": "2026-09-23",
      "controlPointCount": 16,
      "preclipOutsidePercent": 0.111,
      "postclipLandPointCount": 0,
      "postclipSampleCount": 17084,
      "reviewNote": "Bathymetry v2 ersätter den underkända rektangulära passningen: explicit-GCP affine georeferering med oberoende holdouts samt den deterministiska, källstödda konturkandidaten för 2, 4, 6, 8 och 10 m har passerat teknisk validering (11 källsegment, 12 segment efter klippning, inga landkorsningar; 11 m-lodningar är inte konturer). Källskanningen och kandidatvektorn är inte committade eller runtime/publicerade. Publicering blockeras tills källrättigheter/licens har klarlagts."
    },
    "surveyYear": 1986,
    "maxDepthMeters": 11,
    "meanDepthMeters": 3.8
  },
  "svansjon": {
    "status": "available",
    "checkedAt": "2026-09-08",
    "importedAt": "2026-09-08",
    "provider": "SMHI Damm- och sjöregister",
    "smhiLakeId": "641175-137986",
    "sourceUrl": "https://vattenwebb.smhi.se/svarwebb/rest/downloadmap/641175-137986",
    "maps": [
      {
        "mapNumber": "3-5723",
        "formats": [
          "tiff"
        ],
        "source": "S. Simmeborn / P. Johansson"
      }
    ],
    "bathymetry": {
      "sourceType": "historical TIFF with labelled contour regions",
      "sourceMapNumber": "3-5723",
      "processingState": "published",
      "georeferencingStatus": "affine-shoreline-fit",
      "qualityStatus": "verified",
      "published": true,
      "verifiedAt": "2026-09-08",
      "dataUrl": "/bathymetry/svansjon.geojson",
      "controlPointCount": 800,
      "shorelineMeanResidualMeters": 23.9,
      "shorelineP90ResidualMeters": 91,
      "preclipOutsidePercent": 0.96,
      "postclipLandPointCount": 0,
      "postclipSampleCount": 10282,
      "reviewNote": "Fyra uttryckligen märkta 1-, 2- och 4-metersregioner är vektoriserade. Lodpunkten 5,5 m och övrig kartgrafik är avsiktligt utelämnade; konturerna är klippta runt den moderna ön."
    },
    "surveyYear": 1993,
    "maxDepthMeters": 5.5,
    "meanDepthMeters": 2.5
  },
  "mogolen-hedenstorp": {
    "checkedAt": "2026-09-13",
    "maps": [],
    "note": "Ingen säker träff eller publicerad djupkarta har identifierats för Mogölen/Mogöl vid Hedenstorp. Namnlika vatten ska inte användas.",
    "provider": "SMHI Damm- och sjöregister",
    "smhiLakeId": null,
    "status": "not-found"
  },
  "bunn-norra-mellersta": {
    "bathymetry": {
      "georeferencingStatus": "unverified",
      "processingState": "needs-review",
      "published": false,
      "qualityStatus": "needs-review",
      "reviewNote": "Källmaterial för Norra Bunn finns men har inte genomgått Pikes georefererings- eller vektor-QA. Den äldre SMHI-tilldelningen för hela Bunn har inte kunnat partitioneras till denna fiskeenhet och återanvänds inte.",
      "sourceType": "FVO-published depth-map source material"
    },
    "checkedAt": "2026-09-18",
    "maps": [
      {
        "formats": [],
        "mapNumber": null,
        "source": "Norra Bunns FVOF"
      }
    ],
    "provider": "Norra Bunns FVOF",
    "smhiLakeId": null,
    "sourceUrl": "https://www.bunnfiske.se/item/kallelse-till-extra-arsmote-sodra-bunn-fvof-copy.html",
    "status": "available"
  },
  "bunn-sodra": {
    "bathymetry": {
      "georeferencingStatus": "unverified",
      "processingState": "needs-review",
      "published": false,
      "qualityStatus": "needs-review",
      "reviewNote": "Källmaterial för Södra Bunn finns som PDF men har inte genomgått Pikes georefererings- eller vektor-QA. Den äldre SMHI-tilldelningen för hela Bunn har inte kunnat partitioneras till denna fiskeenhet och återanvänds inte.",
      "sourceType": "FVO-published downloadable depth-map PDF"
    },
    "checkedAt": "2026-09-18",
    "maps": [
      {
        "formats": [
          "pdf"
        ],
        "mapNumber": null,
        "source": "Södra Bunns FVOF"
      }
    ],
    "provider": "Södra Bunns FVOF",
    "smhiLakeId": null,
    "sourceUrl": "https://www.bunnfiske.se/item/djupkarta-oever-soedra-bunn.html",
    "status": "available"
  }
};
