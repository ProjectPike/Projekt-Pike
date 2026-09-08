export const featuredFishingSpecies = [
  "Gädda",
  "Abborre",
  "Gös",
  "Öring",
  "Regnbåge",
  "Röding",
  "Lax",
  "Harr",
];

export const additionalFishingSpecies = [
  "Mört",
  "Braxen",
  "Sutare",
  "Lake",
  "Sik",
  "Ål",
  "Sarv",
  "Ruda",
  "Siklöja",
  "Nors",
  "Gärs",
];

export const fishingChoices = {
  places: ["Båt", "Land", "Kajak", "Flytring"],
  methods: ["Spinn", "Mete", "Flugfiske", "Trolling"],
  species: [...featuredFishingSpecies, ...additionalFishingSpecies],
};
