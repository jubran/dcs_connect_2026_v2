import PropTypes from "prop-types";

import { Typography } from "@mui/material";

// ----------------------------------------------------------------------

export default function RHFCode({ name, ...other }) {
  return <Typography> One Time Pass </Typography>;
}

RHFCode.propTypes = {
  name: PropTypes.string,
};
