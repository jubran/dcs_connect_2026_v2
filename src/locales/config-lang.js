import merge from "lodash/merge";
// date fns
import {
  // enUS as enUSAdapter,
  arSA as arSAAdapter,
} from "date-fns/locale";

// date pickers (MUI)
import { enUS as enUSDate } from "@mui/x-date-pickers/locales";
// core (MUI)
import {
  // enUS as enUSCore,
  arSA as arSACore,
} from "@mui/material/locale";
// data grid (MUI)
import {
  // enUS as enUSDataGrid,
  arSD as arSDDataGrid,
} from "@mui/x-data-grid";

// PLEASE REMOVE `LOCAL STORAGE` WHEN YOU CHANGE SETTINGS.
// ----------------------------------------------------------------------

export const allLangs = [
  // {
  //   label: 'English',
  //   value: 'en',
  //   systemValue: merge( enUSDate, enUSDataGrid, enUSCore ),
  //   adapterLocale: enUSAdapter,
  //   icon: 'flagpack:gb-nir',
  //   // icon: 'flagpack:us',
  //   numberFormat: {
  //     code: 'en-US',
  //     currency: 'USD',
  //   },
  // },
  {
    label: "السعودية",
    value: "ar",
    systemValue: merge(enUSDate, arSDDataGrid, arSACore),
    adapterLocale: arSAAdapter,
    icon: "flagpack:sa",
    numberFormat: {
      code: "ar",
      currency: "SAR",
    },
  },
];

export const defaultLang = allLangs[0]; // Arabic
