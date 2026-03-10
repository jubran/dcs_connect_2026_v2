import { TableRow, TableCell, tableCellClasses } from "@mui/material";
import { styled } from "@mui/material/styles";
import { grey } from "@mui/material/colors";
import { gridClasses } from "@mui/x-data-grid";
import { display } from "@mui/system";

export const StyledTableCell = styled(TableCell, {
  shouldForwardProp: (prop) => prop !== "nowrap" && prop !== "wrap",
})(({ theme, wrap }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.info.dark,
    color: theme.palette.common.white,
    fontWeight: 300,
    textAlign: "center",
    padding: "10px",
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
    textAlign: "center",
    border: `1px solid ${theme.palette.divider}`,
    padding: "8px",
    fontWeight: 700,
    fontFamily:
      "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'",
    wordBreak: wrap ? "break-word" : "normal",
  },
}));

export const StyledTableRow = styled(TableRow)(({ theme, status1 }) => {
  const lowerStatus = status1;

  return {
    "&:nth-of-type(odd)": {
      backgroundColor: theme.palette.action.hover,
    },
    ...(lowerStatus === "Shutdown" && {
      backgroundColor: "#ffe6e6",
    }),

    ...(lowerStatus === "In Service" && {
      backgroundColor: "#a2dfb37a",
    }),
    "@media print": {
      pageBreakInside: "avoid",
      pageBreakAfter: "auto",
    },
  };
});

export const dataGridStyles = {
  "&.MuiDataGrid-root .MuiDataGrid-columnHeader:focus-within, &.MuiDataGrid-root .MuiDataGrid-cell:focus-within":
    {
      outline: "none !important",
    },
  "&.MuiDataGrid-root .MuiDataGrid-virtualScroller": {
    minHeight: "250px !important",
    display: "flex",
    alignProperty: "center !important",
  },
  "& .dcs-data-theme-cell": {
    fontFamily: "Public Sans, sans-serif",
    fontWeight: "bold",
    color: "#1a3e72",
    justifyContent: "center",
  },
  "& .dcs-data-theme-cell-left": {
    fontFamily: "Public Sans, sans-serif",
    fontWeight: "bold",
    color: "#1a3e72",
    justifyContent: "right",
    textAlign: "right",
    paddingLeft: "10px",
    whiteSpace: "normal !important",
    minHeight: "200px",
  },

  [`& .${gridClasses.row}`]: {
    bgcolor: (theme) =>
      theme.palette.mode === "light" ? grey[200] : grey[900],
  },
  textTransform: "uppercase",
};
