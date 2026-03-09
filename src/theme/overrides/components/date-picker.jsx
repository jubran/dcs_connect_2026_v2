import React from "react";
import { buttonClasses } from "@mui/material/Button";

import SvgColor from "src/components/svg-color";

// ----------------------------------------------------------------------

const dateList = [
  "DatePicker",
  "DateTimePicker",
  "StaticDatePicker",
  "DesktopDatePicker",
  "DesktopDateTimePicker",
  //
  "MobileDatePicker",
  "MobileDateTimePicker",
];

const timeList = [
  "TimePicker",
  "MobileTimePicker",
  "StaticTimePicker",
  "DesktopTimePicker",
];

const switchIcon = () => (
  <SvgColor src="/assets/icons/components/ic_chevron_down.svg" width={24} />
);

const leftIcon = () => (
  <SvgColor src="/assets/icons/components/ic_arrow_left.svg" width={24} />
);

const rightIcon = () => (
  <SvgColor src="/assets/icons/components/ic_arrow_right.svg" width={24} />
);

const calendarIcon = () => (
  <SvgColor src="/assets/icons/dcs/date.svg" width={24} />
);

const clockIcon = () => (
  <SvgColor src="/assets/icons/components/ic_clock.svg" width={24} />
);

const desktopTypes = dateList.reduce((result, currentValue) => {
  result[`Mui${currentValue}`] = {
    defaultProps: {
      slots: {
        openPickerIcon: calendarIcon,
        leftArrowIcon: leftIcon,
        rightArrowIcon: rightIcon,
        switchViewIcon: switchIcon,
      },
    },
  };

  return result;
}, {});

const timeTypes = timeList.reduce((result, currentValue) => {
  result[`Mui${currentValue}`] = {
    defaultProps: {
      slots: {
        openPickerIcon: clockIcon,
        rightArrowIcon: rightIcon,
        switchViewIcon: switchIcon,
      },
    },
  };

  return result;
}, {});

export function datePicker(theme) {
  return {
    MuiPickersLayout: {
      styleOverrides: {
        root: {
          "& .MuiPickersLayout-actionBar": {
            [`& .${buttonClasses.root}:last-of-type`]: {
              backgroundColor: theme.palette.text.primary,
              color:
                theme.palette.mode === "light"
                  ? theme.palette.common.white
                  : theme.palette.grey[800],
            },
          },
        },
      },
    },

    // Date
    ...desktopTypes,

    // Time
    ...timeTypes,
  };
}
