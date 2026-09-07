export const defaultThemeId = "nordic-lake-dark";

export const themes = [
  {
    id: "nordic-lake-dark",
    name: "Nordic Lake Dark",
    isDefault: true,
    swatches: ["#0B1F2D", "#123B2E", "#2E6F8E", "#C9B893", "#F4A261"],
  },
  {
    id: "moss-copper",
    name: "Moss & Copper",
    swatches: ["#0E1A1A", "#20382F", "#3C523B", "#B57F5A", "#E7E1D6"],
  },
  {
    id: "fjord-twilight",
    name: "Fjord Twilight",
    swatches: ["#0B1E33", "#0E4C5C", "#7FB3C8", "#A7B2BD", "#F2C14E"],
  },
  {
    id: "forest-night-aurora",
    name: "Forest Night Aurora",
    swatches: ["#0B1512", "#103D2E", "#14B8A6", "#3B82F6", "#A3B18A"],
  },
];

export function isThemeId(value) {
  return themes.some((theme) => theme.id === value);
}