import { m } from "framer-motion";
import { useCallback } from "react";

import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";

import { useLocales, useTranslate } from "src/locales";

import { varHover } from "src/components/animate";
import CustomPopover, { usePopover } from "src/components/custom-popover";
import { Typography } from "@mui/material";
import SvgColor from "src/components/svg-color";

// ----------------------------------------------------------------------

export default function LanguagePopover() {
  const popover = usePopover();

  const { onChangeLang } = useTranslate();

  const { allLangs, currentLang } = useLocales();

  const handleChangeLang = useCallback(
    (newLang) => {
      onChangeLang(newLang);
      popover.onClose();
    },
    [onChangeLang, popover],
  );

  return (
    <>
      <IconButton
        component={m.button}
        whileTap="tap"
        whileHover="hover"
        variants={varHover(1.05)}
        onClick={popover.onOpen}
        sx={{
          width: 40,
          height: 40,
          ...(popover.open && {
            bgcolor: "action.selected",
          }),
        }}
      >
        <SvgColor
          src="/assets/icons/dcs/simple-saudia.svg"
          sx={{ borderRadius: 0.65, width: 28 }}
        />
      </IconButton>

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        sx={{ width: 160 }}
      >
        {allLangs.map((option) => (
          <MenuItem
            key={option.value}
            selected={option.value === currentLang.value}
            onClick={() => handleChangeLang(option.value)}
          >
            <SvgColor
              src="/assets/icons/dcs/simple-saudia.svg"
              sx={{ borderRadius: 0.65, width: 28 }}
            />

            <Typography variant="body2"> {option.label} </Typography>
          </MenuItem>
        ))}
      </CustomPopover>
    </>
  );
}
