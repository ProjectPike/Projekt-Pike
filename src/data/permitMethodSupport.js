export const permitMethodKeys = Object.freeze([
  "spin",
  "bait",
  "fly",
  "trolling",
  "ice",
]);

const permitTypePattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isPermitMethodSupportValue(value) {
  if (!Array.isArray(value) || value.length === 0) return false;

  const permitTypes = new Set();
  return value.every((binding) => {
    if (!binding || typeof binding !== "object" || Array.isArray(binding)) return false;
    if (Object.keys(binding).some((key) => !["permitType", "methods"].includes(key))) {
      return false;
    }
    if (!permitTypePattern.test(binding.permitType ?? "") || permitTypes.has(binding.permitType)) {
      return false;
    }
    permitTypes.add(binding.permitType);

    return Array.isArray(binding.methods) &&
      binding.methods.length > 0 &&
      new Set(binding.methods).size === binding.methods.length &&
      binding.methods.every((method) => permitMethodKeys.includes(method));
  });
}
