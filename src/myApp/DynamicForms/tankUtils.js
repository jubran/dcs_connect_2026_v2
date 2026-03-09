// tankUtils.js
// Returns the list of available actions for a given location.
// Each action has:
//   name  → passed as selectedOperation → used by normalizeOperation / normalizeBsdeOperation
//   label → display text in OperationSelectionCard
//   type  → entity type → used by resolveEntityType to pick the correct form

export const getActionsForLocation = ({ data }) => {
  // ── Tank locations ─────────────────────────────────────────────────────────
  if (data.location?.startsWith("TANK")) {
    return [
      {
        name: "tank",
        label: `إجراء عملية تغيير على ${data.location}`,
        type: "tank",
      },
    ];
  }

  // ── FUS locations ──────────────────────────────────────────────────────────
  if (data.location?.startsWith("FUS")) {
    return [
      { name: "In Service", label: "تشغيل", type: "units" },
      { name: "Shutdown", label: "خروج اضطراري", type: "units" },
    ];
  }

  // ── SP locations ───────────────────────────────────────────────────────────
  if (data.location?.match(/SP#(\d+)/)) {
    return [
      { name: "In Service", label: "تشغيل", type: "units" },
      { name: "Stand By", label: "إيقاف أو TRIP أو تحويل", type: "units" },
    ];
  }

  // ── BSDE locations (BS# and DE#) ───────────────────────────────────────────
  // name values must match normalizeBsdeOperation() in BsdeForm/useBsdeForm.js:
  //   "start" → selectStatusMenu: [ FSNL, LOAD ]
  //   "ready" → selectStatusMenu: [ ready ]
  //   "out"   → selectStatusMenu: [ out / shutdown ]
  if (data.location?.startsWith("BS") || data.location?.startsWith("DE")) {
    return [
      { name: "start", label: "تشغيل", type: "bsde" },
      { name: "ready", label: "إيقاف", type: "bsde" },
      { name: "out", label: "خروج عن الخدمة", type: "bsde" },
    ];
  }

  // ── Default (GT and other units) ───────────────────────────────────────────
  // name values must match normalizeOperation() in UnitsForm/constants.js:
  //   "In Service" → start → fields: COMMON + GT fields + selectStatusMenu [In Service]
  //   "Stand By"   → stop  → fields: COMMON + selectStatusMenu [Stand By, Shutdown]
  //   "Shutdown"   → trip  → fields: COMMON + selectStatusMenu [Shutdown, Stand By]
  return [
    { name: "In Service", label: "تشغيل", type: "units" },
    { name: "Stand By", label: "إيقاف / تحويل", type: "units" },
    { name: "Shutdown", label: "خروج اضطراري", type: "units" },
    // { name: 'FSNL',        label: 'TO FSNL',             type: 'units' },
    { name: "noneStatus", label: "عملية فنية", type: "noneStatus" },
    { name: "transformer", label: "عمليات المحولات", type: "transformer" },
  ];
};
