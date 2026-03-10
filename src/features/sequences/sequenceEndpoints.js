import API_ROUTES from "src/shared/utils/API_ROUTES";

export const SEQUENCE_TYPES = {
  GT: {
    apiEndpoint: API_ROUTES.sequences.gt.get(),
    apiUpdateEndpoint: API_ROUTES.sequences.gt.update(),
    title: "الوحدات",
    type: "UNITS",
  },
  CRUDE: {
    apiEndpoint: API_ROUTES.sequences.cotp.get(),
    apiUpdateEndpoint: API_ROUTES.sequences.cotp.update(),
    title: "منقيات الوقود الخام",
    type: "COTP",
  },
  FTS: {
    apiEndpoint: API_ROUTES.sequences.pp29.get(),
    apiUpdateEndpoint: API_ROUTES.sequences.pp29.update(),
    title: "منقيات الديزل",
    type: "BOP-29",
  },
};
