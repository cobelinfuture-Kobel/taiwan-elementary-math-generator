const PLACE_VALUES = Object.freeze({
  thousands: 1000,
  hundreds: 100,
  tens: 10,
  ones: 1
});

const PLACE_ALIASES = Object.freeze({
  thousand: "thousands",
  thousands: "thousands",
  千: "thousands",
  hundred: "hundreds",
  hundreds: "hundreds",
  百: "hundreds",
  ten: "tens",
  tens: "tens",
  十: "tens",
  one: "ones",
  ones: "ones",
  個: "ones",
  个: "ones"
});

const PLACE_PART_ALIASES = Object.freeze({
  thousands: ["thousands", "thousand", "thousandCount", "千", "千位"],
  hundreds: ["hundreds", "hundred", "hundredCount", "百", "百位"],
  tens: ["tens", "ten", "tenCount", "十", "十位"],
  ones: ["ones", "one", "oneCount", "個", "个", "個位", "个位"]
});

export function normalizeInteger(value) {
  if (typeof value === "number") {
    return Number.isFinite(value) && Number.isInteger(value) ? value : null;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (/^[+-]?\d+$/.test(trimmed)) {
      const normalized = Number(trimmed);
      return Number.isSafeInteger(normalized) ? normalized : null;
    }
  }

  return null;
}

export function normalizeDigitArray(digits) {
  if (!Array.isArray(digits)) {
    return null;
  }

  const normalized = [];
  for (const digit of digits) {
    const normalizedDigit = normalizeInteger(digit);
    if (normalizedDigit === null || normalizedDigit < 0 || normalizedDigit > 9) {
      return null;
    }
    normalized.push(normalizedDigit);
  }

  return normalized;
}

export function splitDigits(n) {
  const normalized = normalizeInteger(n);
  if (normalized === null || normalized < 0) {
    return null;
  }

  return String(normalized).split("").map((digit) => Number(digit));
}

export function getDigitCount(n) {
  const digits = splitDigits(n);
  return digits === null ? null : digits.length;
}

export function hasLeadingZero(value) {
  return typeof value === "string" && /^[+-]?0\d+$/u.test(value.trim());
}

export function normalizePlaceName(place) {
  if (typeof place !== "string") {
    return null;
  }

  return PLACE_ALIASES[place.trim()] ?? null;
}

export function getPlaceValue(place) {
  const normalizedPlace = normalizePlaceName(place);
  return normalizedPlace === null ? null : PLACE_VALUES[normalizedPlace];
}

export function computePlaceValueParts(n) {
  const normalized = normalizeInteger(n);
  if (normalized === null || normalized < 0) {
    return null;
  }

  return {
    thousands: Math.floor(normalized / 1000),
    hundreds: Math.floor((normalized % 1000) / 100),
    tens: Math.floor((normalized % 100) / 10),
    ones: normalized % 10,
    total: normalized
  };
}

function normalizeObjectParts(parts) {
  const normalized = {
    thousands: 0,
    hundreds: 0,
    tens: 0,
    ones: 0
  };
  const provided = {
    thousands: false,
    hundreds: false,
    tens: false,
    ones: false,
    total: false
  };

  for (const [place, aliases] of Object.entries(PLACE_PART_ALIASES)) {
    for (const alias of aliases) {
      if (Object.hasOwn(parts, alias)) {
        const value = normalizeInteger(parts[alias]);
        if (value === null) {
          return null;
        }
        normalized[place] = value;
        provided[place] = true;
        break;
      }
    }
  }

  if (Object.hasOwn(parts, "total")) {
    const total = normalizeInteger(parts.total);
    if (total === null) {
      return null;
    }
    normalized.total = total;
    provided.total = true;
  }

  return { parts: normalized, provided };
}

function normalizeArrayParts(parts) {
  const normalized = {
    thousands: 0,
    hundreds: 0,
    tens: 0,
    ones: 0
  };
  const provided = {
    thousands: false,
    hundreds: false,
    tens: false,
    ones: false,
    total: false
  };

  for (const entry of parts) {
    if (!entry || typeof entry !== "object") {
      return null;
    }
    const place = normalizePlaceName(entry.place ?? entry.unit ?? entry.name);
    if (place === null) {
      return null;
    }
    const value = normalizeInteger(entry.count ?? entry.value);
    if (value === null) {
      return null;
    }
    normalized[place] = value;
    provided[place] = true;
  }

  return { parts: normalized, provided };
}

export function normalizePlaceValueParts(parts) {
  if (Array.isArray(parts)) {
    return normalizeArrayParts(parts);
  }

  if (parts && typeof parts === "object") {
    return normalizeObjectParts(parts);
  }

  return null;
}

export function composeFromPlaceValueParts(parts) {
  const normalized = normalizePlaceValueParts(parts);
  if (normalized === null) {
    return null;
  }

  const { parts: placeParts } = normalized;
  const total = placeParts.thousands * 1000
    + placeParts.hundreds * 100
    + placeParts.tens * 10
    + placeParts.ones;

  return {
    ...normalized,
    total
  };
}

export function compareValues(a, b) {
  const normalizedA = normalizeInteger(a);
  const normalizedB = normalizeInteger(b);

  if (normalizedA === null || normalizedB === null) {
    return null;
  }

  return normalizedA < normalizedB ? "<" : normalizedA > normalizedB ? ">" : "=";
}

export function buildNumberFromDigits(digits) {
  const normalizedDigits = normalizeDigitArray(digits);
  if (normalizedDigits === null || normalizedDigits.length === 0) {
    return null;
  }

  return Number(normalizedDigits.join(""));
}
