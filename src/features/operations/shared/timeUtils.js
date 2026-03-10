// shared/timeUtils.js
// Moved from: hooks/fields/useTimeUtils.js
// Pure date/time formatting utilities — no React, no state.

export const formatHHMM24 = (input = "") => {
  const digits = input.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.length <= 2) {
    if (digits.length === 2 && !input.includes(":")) {
      return digits + ":";
    }
    return digits;
  }
  const hh = digits.slice(0, 2);
  const mm = digits.slice(2, 4);
  return `${hh}:${mm}`;
};

export const formatHHMM24Display = (input = "") => {
  if (!input) return "";
  if (/^\d{2}:\d{2}$/.test(input)) return input;
  return formatHHMM24(input);
};

export const formatCompleteTime = (input = "") => {
  if (!input) return "";
  const hasColon = input.includes(":");
  const digits = input.replace(/\D/g, "");
  let hh = digits.slice(0, 2) || "00";
  let mm = digits.slice(2, 4) || "";
  hh = String(Math.min(23, Number(hh))).padStart(2, "0");
  if (mm.length === 1) mm = hasColon ? `${mm}0` : `${mm}${mm}`;
  if (!mm) mm = "00";
  mm = String(Math.min(59, Number(mm))).padStart(2, "0");
  return `${hh}:${mm}`;
};

/**
 * Normalises any date value → 'YYYY-MM-DD' string.
 * Handles: Date objects, ISO strings, dayjs objects, already-formatted strings.
 */
export const formatDateForApi = (val, dayjs) => {
  if (!val) return "";
  if (typeof val === "string" && /^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
  const d = dayjs(val);
  return d.isValid() ? d.format("YYYY-MM-DD") : "";
};

/**
 * Normalises any time value → 'HH:mm' string.
 * Handles: Date objects, ISO strings, dayjs objects, already-formatted strings.
 */
export const formatTimeForApi = (val, dayjs) => {
  if (!val) return "";
  if (typeof val === "string" && /^\d{2}:\d{2}$/.test(val)) return val;
  const t = dayjs(val);
  return t.isValid() ? t.format("HH:mm") : "";
};
