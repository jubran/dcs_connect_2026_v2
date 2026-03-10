// TankForm/tankDataParser.js
// Moved from: services/tankDataParser.js
// Parses tank action text strings back into structured form field values.
// Used by: TankForm (edit hydration) and OperationsView (modeResolver).

/**
 * Parses a single operation line into its components.
 *
 * Examples:
 *   "FILLING BY FUS (OPEN)"           → { TypeStatus:'FILLING', ValveStatus:'open', TankTag:'FUS' }
 *   "MAINTENANCE - UNDER MAINTENANCE" → { TypeStatus:'MAINTENANCE', ValveStatus:'', TankTag:'' }
 */
const parseSingleLine = (line = "") => {
  if (!line.trim()) return {};

  const MAINT_RE = /^.+\s+-\s+UNDER MAINTENANCE$/i;
  if (MAINT_RE.test(line.trim())) {
    return { TypeStatus: "MAINTENANCE", ValveStatus: "", TankTag: "" };
  }

  const STANDARD_RE =
    /^(\w+)\s+(BY|TO|FROM)\s+(.+?)(?:\s+\((OPEN|CLOSED|PARTIALLY[\s_]OPEN)\))?$/i;
  const match = line.trim().match(STANDARD_RE);
  if (!match) return {};

  return {
    TypeStatus: match[1].toUpperCase(),
    Direction: match[2].toUpperCase(),
    TankTag: match[3].trim(),
    ValveStatus: match[4] ? match[4].toLowerCase().replace(/\s+/g, "_") : "",
  };
};

/**
 * Parses a full tank action string (may contain two operations joined by " AND ")
 * back into structured form data fields.
 *
 * @param {string} actionText
 * @returns {object}
 */
export const parseTankActionSingleLine = (actionText = "") => {
  if (!actionText) return {};

  const parts = actionText.split(/\s+AND\s+/i).map((p) => p.trim());
  const [line1, line2] = parts;

  const op1 = parseSingleLine(line1);
  const op2 = parseSingleLine(line2);

  return {
    typeStatus: op1.TypeStatus || "",
    ValveStatus: op1.ValveStatus || "",
    tankTag: op1.TankTag || "",
    typeStatus2: op2.TypeStatus || "",
    ValveStatus2: op2.ValveStatus || "",
    tankTag2: op2.TankTag || "",
    isDoubleOperation: Boolean(op2.TypeStatus),
  };
};
