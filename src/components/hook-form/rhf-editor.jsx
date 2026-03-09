import { useEffect } from "react";
import PropTypes from "prop-types";
import { useFormContext } from "react-hook-form";

import { Typography } from "@mui/material";

// ----------------------------------------------------------------------

export default function RHFEditor({ name, helperText, ...other }) {
  const {
    watch,
    setValue,
    formState: { isSubmitSuccessful },
  } = useFormContext();

  const values = watch();

  useEffect(() => {
    if (values[name] === "<p><br></p>") {
      setValue(name, "", {
        shouldValidate: !isSubmitSuccessful,
      });
    }
  }, [isSubmitSuccessful, name, setValue, values]);

  return <Typography>Editoe</Typography>;
}

RHFEditor.propTypes = {
  helperText: PropTypes.string,
  name: PropTypes.string,
};
