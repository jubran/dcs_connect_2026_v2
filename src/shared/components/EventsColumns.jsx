// columns.js
import { Typography } from "@mui/material";
import { Box } from "@mui/system";
import { GridActionsCellItem } from "@mui/x-data-grid";
import SvgColor from "src/components/svg-color";

export const createColumns = (
  handleOpenDetail,
  handleEditClick,
  handleOpenDelete,
  selectedRows,
) => [
  {
    field: "status1",
    headerName: "الحالة",
    headerAlign: "center",
    cellClassName: "dcs-data-theme-cell",
    width: 100,
    disableColumnMenu: true,
    filterable: false,
    sortable: false,
    renderCell: (params) => {
      const { status1, shutdownType, foReason } = params.row;

      let displayStatus = status1;

      if (status1 === "Shutdown") {
        if (shutdownType?.trim() && foReason?.trim()) {
          displayStatus = `${shutdownType}-${foReason}`;
        } else if (shutdownType?.trim()) {
          displayStatus = shutdownType;
        }
      }

      const color =
        {
          "In Service": "green",
          fsnl: "orange",
          load: "green",
          ready: "green",
          "Stand By": "blue",
          Shutdown: "red",
        }[status1] || "inherit";

      return <div style={{ color }}>{displayStatus}</div>;
    },
  },

  {
    field: "action",
    headerName: "الوصف",
    headerAlign: "right",
    cellClassName: "dcs-data-theme-cell-left",
    flex: 1,
    disableColumnMenu: true,
    filterable: false,
    sortable: false,
    renderCell: (params) => {
      const { action, flame, fsnl, synch, hyd } = params.row;

      return (
        <Typography
          variant="body"
          sx={{
            direction: "rtl",
            lineHeight: 1.3,
            color: "text.primary",
          }}
        >
          {action && <Box component="span">{action} </Box>}

          {flame && (
            <Box component="span" sx={{ color: "error.main", fontWeight: 600 }}>
              FLAME ON {flame} {" RPM "}
            </Box>
          )}

          {fsnl && (
            <Box component="span" sx={{ color: "info.main", fontWeight: 600 }}>
              FSNL AT {fsnl}
              {" HRS "}
            </Box>
          )}

          {synch && (
            <Box
              component="span"
              sx={{ color: "success.main", fontWeight: 600 }}
            >
              SYNCH AT {synch}
              {" HRS"}
            </Box>
          )}

          {hyd && (
            <Box component="span" sx={{ color: "error.main", fontWeight: 600 }}>
              {hyd}
            </Box>
          )}
        </Typography>
      );
    },
  },

  {
    field: "location",
    headerName: "الموقع",
    headerAlign: "center",
    cellClassName: "dcs-data-theme-cell",
    width: 130,
    disableColumnMenu: true,
    filterable: false,
    sortable: false,
  },
  {
    field: "time1",
    headerName: "الوقت",
    headerAlign: "center",
    cellClassName: "dcs-data-theme-cell",
    width: 100,
    disableColumnMenu: true,
    filterable: false,
    sortable: false,
  },
  {
    field: "date1",
    headerName: "التاريخ",
    headerAlign: "center",
    cellClassName: "dcs-data-theme-cell",
    filterable: false,
    disableColumnMenu: true,
    sortable: false,
    width: 100,
  },
  {
    type: "actions",
    field: "actions",
    headerName: " ",
    align: "right",
    headerAlign: "right",
    width: 40,
    sortable: false,
    filterable: false,
    disableColumnMenu: true,
    getActions: (params) => [
      <GridActionsCellItem
        showInMenu
        icon={<SvgColor src="/assets/icons/components/ic_eye.svg" />}
        label={`التفاصيل ${selectedRows.length > 0 ? "(" + selectedRows.length + ")" : ""}`}
        onClick={() => handleOpenDetail(params.row)}
      />,

      <GridActionsCellItem
        showInMenu
        icon={<SvgColor src="/assets/icons/components/ic_edit.svg" />}
        label="تحديث"
        onClick={() => handleEditClick(params.row)}
        disabled={
          // معطل إذا: أكثر من صف محدد أو الصف الحالي غير محدد
          !(selectedRows.length === 1 && selectedRows[0].id === params.row.id)
        }
      />,

      <GridActionsCellItem
        showInMenu
        icon={<SvgColor src="/assets/icons/components/ic_delete.svg" />}
        label={`حذف ${selectedRows.length > 0 ? "(" + selectedRows.length + ")" : ""}`}
        sx={{ color: "error.main" }}
        onClick={() => handleOpenDelete(params.row)}
      />,
    ],
  },
];
