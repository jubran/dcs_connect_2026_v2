import { useCallback, useState, useEffect, useMemo } from "react";
import EmptyContent from "src/components/empty-content/empty-content";

import {
  Alert,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Fade,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  IconButton,
  Menu,
  MenuItem,
  InputAdornment,
  TextField,
  Select,
  FormControl,
  TablePagination,
  Switch,
  FormControlLabel,
  Tooltip,
  Box,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import SvgColor from "src/components/svg-color";
// Inline icon replacements — no @mui/icons-material needed
const MoreVertIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
    <circle cx="12" cy="5" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="12" cy="19" r="2" />
  </svg>
);
const SearchIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
    <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
  </svg>
);

import useSWR, { mutate } from "swr";
import axiosInstance, { fetcher } from "src/shared/utils/axios";
import API_ROUTES from "src/shared/utils/API_ROUTES";
import { useSnackbar } from "src/shared/contexts/SnackbarContext";
import { buildEventsApiUrl } from "src/features/search/services/searchApi";
import { parseTankActionSingleLine } from "src/features/operations/forms/tank/tankDataParser";

// ─── Status chip helper ───────────────────────────────────────────────────────
const STATUS_STYLES = {
  "In Service": { bg: "#e8f5e9", color: "#2e7d32", label: "In Service" },
  load:         { bg: "#e8f5e9", color: "#2e7d32", label: "Load" },
  ready:        { bg: "#e8f5e9", color: "#2e7d32", label: "Ready" },
  fsnl:         { bg: "#fff3e0", color: "#e65100", label: "FSNL" },
  "Stand By":   { bg: "#e3f2fd", color: "#1565c0", label: "Stand By" },
  Shutdown:     { bg: "#fce4ec", color: "#c62828", label: "Shutdown" },
};

function StatusChip({ row }) {
  const { status1, shutdownType, foReason } = row;
  let label = status1;
  if (status1 === "Shutdown") {
    if (shutdownType?.trim() && foReason?.trim()) label = `${shutdownType}-${foReason}`;
    else if (shutdownType?.trim()) label = shutdownType;
  }
  const style = STATUS_STYLES[status1] || { bg: "#f5f5f5", color: "#555", label };
  return (
    <Chip
      label={label}
      size="small"
      sx={{
        bgcolor: style.bg,
        color: style.color,
        fontWeight: 700,
        fontSize: "0.72rem",
        border: `1.5px solid ${style.color}`,
        borderRadius: "6px",
        height: 26,
      }}
    />
  );
}

// ─── Description cell ─────────────────────────────────────────────────────────
function DescriptionCell({ row }) {
  const { action, flame, fsnl, synch, hyd } = row;
  return (
    <Typography variant="body2" sx={{ direction: "rtl", lineHeight: 1.4 }}>
      {action && <span>{action} </span>}
      {flame && <Box component="span" sx={{ color: "error.main", fontWeight: 700 }}>FLAME ON {flame} RPM </Box>}
      {fsnl  && <Box component="span" sx={{ color: "info.main",  fontWeight: 700 }}>FSNL AT {fsnl} HRS </Box>}
      {synch && <Box component="span" sx={{ color: "success.main", fontWeight: 700 }}>SYNCH AT {synch} HRS </Box>}
      {hyd   && <Box component="span" sx={{ color: "error.main", fontWeight: 700 }}>{hyd}</Box>}
    </Typography>
  );
}

// ─── Row action menu ──────────────────────────────────────────────────────────
function RowActionsMenu({ row, selectedRows, onDetail, onEdit, onDelete }) {
  const [anchor, setAnchor] = useState(null);
  const open = Boolean(anchor);
  const isOnlySelected = selectedRows.length === 1 && selectedRows[0]?.id === row.id;

  return (
    <>
      <IconButton size="small" onClick={(e) => setAnchor(e.currentTarget)}>
        <MoreVertIcon fontSize="small" />
      </IconButton>
      <Menu anchorEl={anchor} open={open} onClose={() => setAnchor(null)}
        PaperProps={{ sx: { minWidth: 160, borderRadius: 2, boxShadow: "0 4px 16px rgba(0,0,0,0.12)" } }}>
        <MenuItem onClick={() => { onDetail(row); setAnchor(null); }}
          sx={{ gap: 1.5, fontSize: 14 }}>
          <SvgColor src="/assets/icons/components/ic_eye.svg" width={18} height={18} />
          التفاصيل {selectedRows.length > 0 ? `(${selectedRows.length})` : ""}
        </MenuItem>
        <MenuItem onClick={() => { onEdit(row); setAnchor(null); }}
          disabled={!isOnlySelected}
          sx={{ gap: 1.5, fontSize: 14 }}>
          <SvgColor src="/assets/icons/components/ic_edit.svg" width={18} height={18} />
          تحديث
        </MenuItem>
        <MenuItem onClick={() => { onDelete(row); setAnchor(null); }}
          sx={{ gap: 1.5, fontSize: 14, color: "error.main" }}>
          <SvgColor src="/assets/icons/components/ic_delete.svg" width={18} height={18} />
          حذف {selectedRows.length > 0 ? `(${selectedRows.length})` : ""}
        </MenuItem>
      </Menu>
    </>
  );
}

// ─── Filter tabs ──────────────────────────────────────────────────────────────
const STATUS_FILTERS = ["الكل", "In Service", "Stand By", "Shutdown", "fsnl"];

function FilterTabs({ rows, activeFilter, onChange }) {
  const counts = useMemo(() => {
    const c = { الكل: rows.length };
    STATUS_FILTERS.slice(1).forEach((s) => {
      c[s] = rows.filter((r) => r.status1 === s).length;
    });
    return c;
  }, [rows]);

  const chipColor = (f) => {
    if (f === "الكل") return { bg: "#111", color: "#fff" };
    const s = STATUS_STYLES[f];
    return s ? { bg: s.color, color: "#fff" } : { bg: "#e0e0e0", color: "#555" };
  };

  return (
    <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
      {STATUS_FILTERS.map((f) => {
        const active = activeFilter === f;
        const c = chipColor(f);
        return (
          <Box
            key={f}
            onClick={() => onChange(f)}
            sx={{
              display: "flex", alignItems: "center", gap: 0.8, cursor: "pointer",
              pb: 0.5,
              borderBottom: active ? `2px solid ${f === "الكل" ? "#111" : c.bg}` : "2px solid transparent",
              "&:hover": { opacity: 0.8 },
            }}
          >
            <Chip
              label={counts[f] ?? 0}
              size="small"
              sx={{
                bgcolor: active ? c.bg : "#f0f0f0",
                color: active ? c.color : "#555",
                fontWeight: 700,
                height: 22,
                fontSize: "0.72rem",
                minWidth: 28,
              }}
            />
            <Typography variant="body2" sx={{ fontWeight: active ? 700 : 400, color: active ? "text.primary" : "text.secondary" }}>
              {f}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ShowDataGrid({ date, location, rows1 }) {
  const [rows, setRows] = useState(rows1 || []);
  const [openDetail, setOpenDetail] = useState(false);
  const [detailRow, setDetailRow] = useState(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [rowToDelete, setRowToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);

  // Table UI state
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("الكل");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [dense, setDense] = useState(false);

  const { showInfo, showError, showSuccess, handleClose } = useSnackbar();
  const { data: rawData } = useSWR(
    buildEventsApiUrl({ startDate: date, location }),
    fetcher,
  );
  const navigate = useNavigate();

  useEffect(() => {
    if (rawData) setRows(rawData);
  }, [rawData]);

  // ── Filtering ───────────────────────────────────────────────────────────────
  const filteredRows = useMemo(() => {
    let r = rows;
    if (activeFilter !== "الكل") r = r.filter((row) => row.status1 === activeFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      r = r.filter(
        (row) =>
          row.location?.toLowerCase().includes(q) ||
          row.action?.toLowerCase().includes(q) ||
          row.status1?.toLowerCase().includes(q) ||
          row.date1?.toLowerCase().includes(q) ||
          row.time1?.toLowerCase().includes(q),
      );
    }
    return r;
  }, [rows, activeFilter, search]);

  const pagedRows = useMemo(
    () => filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filteredRows, page, rowsPerPage],
  );

  // ── Selection ───────────────────────────────────────────────────────────────
  const isSelected = (id) => selectedRows.some((r) => r.id === id);
  const toggleRow = (row) => {
    setSelectedRows((prev) =>
      prev.some((r) => r.id === row.id) ? prev.filter((r) => r.id !== row.id) : [...prev, row],
    );
  };
  const toggleAll = () => {
    if (pagedRows.every((r) => isSelected(r.id))) {
      setSelectedRows((prev) => prev.filter((r) => !pagedRows.find((p) => p.id === r.id)));
    } else {
      const toAdd = pagedRows.filter((r) => !isSelected(r.id));
      setSelectedRows((prev) => [...prev, ...toAdd]);
    }
  };
  const allPageSelected = pagedRows.length > 0 && pagedRows.every((r) => isSelected(r.id));
  const somePageSelected = pagedRows.some((r) => isSelected(r.id)) && !allPageSelected;

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleOpenDetail = (row) => { setDetailRow(row); setOpenDetail(true); };
  const handleCloseDetail = () => { setOpenDetail(false); setDetailRow(null); };

  const handleOpenDelete = () => {
    if (selectedRows.length === 0) { showError("الرجاء تحديد صف واحد على الأقل للحذف"); return; }
    setDeleteError("");
    setOpenDelete(true);
  };
  const handleCloseDelete = () => { setOpenDelete(false); setDeleteError(""); };

  const handleConfirmDeleteMultiple = async () => {
    if (selectedRows.length === 0) return;
    setDeleting(true);
    setDeleteError("");
    try {
      const response = await axiosInstance.post(API_ROUTES.tanks.delete.multiple(), {
        event_ids: selectedRows.map((row) => row.id),
        soft_delete: true,
      });
      const result = response.data;
      if (!result.success) throw new Error(result?.message || "فشل في حذف الحدث");
      showSuccess(result.message || "تم حذف البيانات بنجاح", 3000);
      await mutate(buildEventsApiUrl({ startDate: date, location }));
      await Promise.all([
        mutate(API_ROUTES.units.status.all()),
        mutate(API_ROUTES.units.status.cotp()),
        mutate(API_ROUTES.units.status.fu()),
        mutate(API_ROUTES.units.status.ft6()),
        mutate(API_ROUTES.tanks.status.all()),
      ]);
      setSelectedRows([]);
      handleCloseDelete();
    } catch (err) {
      console.error("حدث خطأ:", err.message);
      setDeleteError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleEditClick = (rowData) => {
    let parsedOperations = {};
    if (rowData.location?.toUpperCase().startsWith("TANK#")) {
      parsedOperations = parseTankActionSingleLine(rowData.action);
    }
    const formData = {
      id: rowData.id,
      entityType: rowData.entityType,
      selectedOperation: rowData.status1,
      location: rowData.location,
      date1: rowData.date1,
      time1: rowData.time1,
      status1: rowData.status1,
      note: rowData.note || "",
      selectedRatching: rowData.hyd || "",
      shutdownType: rowData.shutdownType || "",
      shutdownReason: rowData.shutdownReason || "",
      foReason: rowData.foReason || "",
      sapOrder: rowData.sapOrder || "",
      eventText: rowData.action || "",
      flameRPM: rowData.flame || "",
      fsnlTime: rowData.fsnl || "",
      synchTime: rowData.synch || "",
      hyd: rowData.hyd || "",
      ...parsedOperations,
    };
    navigate("/dashboard/operations", {
      state: {
        mode: "edit",
        location: formData.location,
        selectedOperation: formData.selectedOperation,
        data: formData,
        entityType: formData.entityType,
      },
    });
  };

  // ── Table header cells ───────────────────────────────────────────────────────
  const headCellSx = {
    fontWeight: 600,
    fontSize: "0.82rem",
    color: "text.secondary",
    bgcolor: "grey.50",
    borderBottom: "1px solid",
    borderColor: "divider",
    py: dense ? 1 : 1.5,
    px: 2,
    whiteSpace: "nowrap",
  };

  const bodyCellSx = {
    py: dense ? 0.8 : 1.4,
    px: 2,
    borderBottom: "1px solid",
    borderColor: "divider",
    fontSize: "0.84rem",
  };

  return (
    <>
      <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>

        {/* ── Filter tabs row ── */}
        <Box sx={{ px: 3, pt: 2, pb: 1.5, borderBottom: "1px solid", borderColor: "divider" }}>
          <FilterTabs rows={rows} activeFilter={activeFilter} onChange={(f) => { setActiveFilter(f); setPage(0); }} />
        </Box>

        {/* ── Search + actions row ── */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 2, py: 1.5, borderBottom: "1px solid", borderColor: "divider" }}>
          <IconButton size="small" sx={{ color: "text.secondary" }}>
            <MoreVertIcon fontSize="small" />
          </IconButton>

          <TextField
            size="small"
            placeholder="...Search"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            sx={{ flex: 1, "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <SearchIcon fontSize="small" sx={{ color: "text.disabled" }} />
                </InputAdornment>
              ),
            }}
          />

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <Select
              displayEmpty
              value=""
              renderValue={() => <Typography variant="body2" color="text.secondary">Role</Typography>}
              sx={{ borderRadius: 2 }}
            >
              <MenuItem value="">الكل</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* ── Table ── */}
        <TableContainer>
          <Table size={dense ? "small" : "medium"}>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox" sx={{ ...headCellSx, bgcolor: "grey.50" }}>
                  <Checkbox
                    size="small"
                    indeterminate={somePageSelected}
                    checked={allPageSelected}
                    onChange={toggleAll}
                  />
                </TableCell>
                <TableCell sx={{ ...headCellSx, textAlign: "right" }}>التاريخ ↑</TableCell>
                <TableCell sx={{ ...headCellSx, textAlign: "center" }}>الوقت</TableCell>
                <TableCell sx={{ ...headCellSx, textAlign: "center" }}>الموقع</TableCell>
                <TableCell sx={{ ...headCellSx, textAlign: "right", minWidth: 220 }}>الوصف</TableCell>
                <TableCell sx={{ ...headCellSx, textAlign: "center" }}>الحالة</TableCell>
                <TableCell sx={{ ...headCellSx, width: 48 }} />
              </TableRow>
            </TableHead>

            <TableBody>
              {pagedRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} sx={{ py: 6, textAlign: "center" }}>
                    <EmptyContent title="لا توجد أحداث" />
                  </TableCell>
                </TableRow>
              ) : (
                pagedRows.map((row) => {
                  const selected = isSelected(row.id);
                  return (
                    <TableRow
                      key={row.id}
                      hover
                      selected={selected}
                      sx={{
                        "&.Mui-selected": { bgcolor: "action.selected" },
                        "&.Mui-selected:hover": { bgcolor: "action.hover" },
                        transition: "background 0.15s",
                      }}
                    >
                      {/* Checkbox */}
                      <TableCell padding="checkbox" sx={bodyCellSx}>
                        <Checkbox size="small" checked={selected} onChange={() => toggleRow(row)} />
                      </TableCell>

                      {/* Date */}
                      <TableCell sx={{ ...bodyCellSx, textAlign: "right", fontWeight: 500 }}>
                        {row.date1 || "—"}
                      </TableCell>

                      {/* Time */}
                      <TableCell sx={{ ...bodyCellSx, textAlign: "center", color: "text.secondary" }}>
                        {row.time1 || "—"}
                      </TableCell>

                      {/* Location */}
                      <TableCell sx={{ ...bodyCellSx, textAlign: "center", fontWeight: 600 }}>
                        {row.location || "—"}
                      </TableCell>

                      {/* Description */}
                      <TableCell sx={{ ...bodyCellSx, textAlign: "right", maxWidth: 320 }}>
                        <DescriptionCell row={row} />
                      </TableCell>

                      {/* Status */}
                      <TableCell sx={{ ...bodyCellSx, textAlign: "center" }}>
                        <StatusChip row={row} />
                      </TableCell>

                      {/* Actions */}
                      <TableCell sx={{ ...bodyCellSx, textAlign: "center", px: 0.5 }}>
                        <RowActionsMenu
                          row={row}
                          selectedRows={selectedRows}
                          onDetail={handleOpenDetail}
                          onEdit={handleEditClick}
                          onDelete={handleOpenDelete}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* ── Pagination footer ── */}
        <Box sx={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          px: 2, py: 0.5, borderTop: "1px solid", borderColor: "divider",
        }}>
          <FormControlLabel
            control={<Switch size="small" checked={dense} onChange={(e) => setDense(e.target.checked)} />}
            label={<Typography variant="body2" color="text.secondary">Dense</Typography>}
            labelPlacement="start"
            sx={{ m: 0, gap: 1 }}
          />
          <TablePagination
            component="div"
            count={filteredRows.length}
            page={page}
            onPageChange={(_, p) => setPage(p)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
            rowsPerPageOptions={[5, 8, 10, 25]}
            labelRowsPerPage="عدد الصفوف في الصفحة:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} من ${count}`}
            sx={{
              "& .MuiTablePagination-toolbar": { direction: "rtl" },
              "& .MuiTablePagination-selectLabel": { fontFamily: "inherit" },
              "& .MuiTablePagination-displayedRows": { fontFamily: "inherit" },
            }}
          />
        </Box>
      </Paper>

      {/* ══════════════════════════════════════════════════════════════════════
          Detail Dialog — unchanged
      ══════════════════════════════════════════════════════════════════════ */}
      <Dialog
        open={openDetail}
        onClose={handleCloseDetail}
        fullWidth
        maxWidth="md"
        TransitionComponent={Fade}
        transitionDuration={300}
        PaperProps={{
          sx: { borderRadius: 3, boxShadow: "0 10px 40px rgba(0,0,0,0.15)", overflow: "hidden", minHeight: 400 },
        }}
      >
        <DialogTitle
          sx={{
            textAlign: "center", bgcolor: "primary.main", color: "white", py: 2.5, position: "relative",
            "&::after": { content: '""', position: "absolute", bottom: 0, left: "10%", width: "80%", height: "3px", bgcolor: "rgba(255,255,255,0.3)", borderRadius: "3px" },
          }}
        >
          <Box display="flex" alignItems="center" justifyContent="center" gap={1.5}>
            <SvgColor src="/assets/icons/files/ic_document.svg" width={28} height={28} sx={{ opacity: 0.9 }} />
            <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>تفاصيل الصفوف المحددة</Typography>
          </Box>
        </DialogTitle>

        <DialogContent dividers sx={{ p: 3, bgcolor: "grey.50" }}>
          {selectedRows && selectedRows.length > 0 ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
              {selectedRows.map((row, index) => (
                <Card key={row.id || index} variant="outlined"
                  sx={{ borderRadius: 2, borderWidth: 2, borderColor: "divider", overflow: "hidden",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    "&:hover": { transform: "translateY(-2px)", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" } }}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                      <Typography variant="caption"
                        sx={{ color: "primary.main", fontWeight: 700, fontSize: "0.8rem", bgcolor: "primary.lighter", px: 1.5, py: 0.5, borderRadius: 1 }}>
                        #{index + 1}
                      </Typography>
                      {selectedRows.length > 1 && (
                        <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 500 }}>
                          {index + 1} من {selectedRows.length}
                        </Typography>
                      )}
                    </Box>
                    <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
                      <Box>
                        <Box display="flex" mb={1.5} gap={2}>
                          <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 600 }}>
                            <Box component="span" display="flex" alignItems="center" gap={0.5}>
                              <SvgColor src="/assets/icons/components/ic_location.svg" width={14} height={14} />
                              الموقع
                            </Box>
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: "primary.dark" }}>
                            {row.location || "غير محدد"}
                          </Typography>
                        </Box>
                        <Box display="flex" mb={1.5} gap={2}>
                          <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 600 }}>
                            <Box component="span" display="flex" alignItems="center" gap={0.5}>
                              <SvgColor icon="mdi:state-machine" width={14} height={14} />
                              الحالة
                            </Box>
                          </Typography>
                          <StatusChip row={row} />
                        </Box>
                      </Box>
                      <Box>
                        <Box display="flex" mb={1.5} gap={2}>
                          <Typography component="span" variant="body2" sx={{ color: "text.secondary", fontWeight: 600 }}>
                            <Box component="span" display="flex" alignItems="center" gap={0.5}>
                              <SvgColor src="/assets/icons/dcs/date.svg" width={14} height={14} />
                              التاريخ
                            </Box>
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{row.date1 || "غير محدد"}</Typography>
                        </Box>
                        <Box display="flex" mb={1.5} gap={2}>
                          <Typography component="span" variant="body2" sx={{ color: "text.secondary", fontWeight: 600 }}>
                            <Box component="span" display="flex" alignItems="center" gap={0.5}>
                              <SvgColor src="/assets/icons/components/ic_clock.svg" width={14} height={14} />
                              الوقت
                            </Box>
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{row.time1 || "غير محدد"}</Typography>
                        </Box>
                      </Box>
                    </Box>
                    <Box mt={2}>
                      <Typography component="span" variant="body2" sx={{ color: "text.secondary", fontWeight: 500, display: "block", mb: 0.5 }}>
                        <Box component="span" display="flex" alignItems="center" gap={0.5}>
                          <SvgColor src="/assets/icons/files/ic_document.svg" width={14} height={14} />
                          الوصف / العملية
                        </Box>
                      </Typography>
                      <Box sx={{ bgcolor: "grey.100", p: 1.5, borderRadius: 1, borderLeft: "3px solid", borderColor: "primary.main" }}>
                        <Typography component="span" variant="body2" sx={{ color: "text.primary", lineHeight: 1.6 }}>
                          {row.action || "لا يوجد وصف"}
                        </Typography>
                      </Box>
                    </Box>
                    {(row.note || row.username1 || row.shutdownReason) && (
                      <Box display="flex" mb={1.5} gap={2} mt={2}>
                        <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>معلومات إضافية</Typography>
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                          {row.note && <Chip label={`ملاحظة: ${row.note}`} size="small" variant="outlined" sx={{ fontSize: "0.7rem" }} />}
                          {row.username1 && <Chip label={`مدخل البيانات: ${row.username1}`} size="small" variant="outlined" sx={{ fontSize: "0.7rem" }} />}
                          {row.shutdownReason && <Chip label={`سبب: ${row.shutdownReason}`} size="small" variant="outlined" sx={{ fontSize: "0.7rem" }} />}
                        </Box>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              ))}
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", py: 8, textAlign: "center" }}>
              <SvgColor src="/assets/icons/components/ic_info.svg" width={64} height={64} sx={{ color: "grey.400", mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>لا توجد صفوف محددة</Typography>
              <Typography variant="body2" color="text.secondary">الرجاء تحديد صفوف لعرض تفاصيلها</Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2.5, gap: 1.5, bgcolor: "grey.50", borderTop: "1px solid", borderColor: "divider" }}>
          <Button variant="outlined" onClick={handleCloseDetail}
            startIcon={<SvgColor src="/assets/icons/components/ic_close.svg" />}
            sx={{ minWidth: 100, borderRadius: 2, borderWidth: 2, "&:hover": { borderWidth: 2, bgcolor: "action.hover" } }}>
            إغلاق
          </Button>
        </DialogActions>
      </Dialog>

      {/* ══════════════════════════════════════════════════════════════════════
          Delete Dialog — unchanged
      ══════════════════════════════════════════════════════════════════════ */}
      <Dialog open={openDelete} onClose={handleCloseDelete} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 500, marginBottom: "10px", textAlign: "center", bgcolor: "error.main", color: "white", py: 2.5 }}>
          تأكيد الحذف
        </DialogTitle>
        <DialogContent dividers>
          هل أنت متأكد من حذف هذا الحدث؟
          <Box mt={1} color="text.secondary" fontSize={13}>
            {selectedRows.map((row) => (
              <Box key={row.id}>- <strong>{row.location}</strong> | الحالة: {row.status1}</Box>
            ))}
          </Box>
        </DialogContent>
        <DialogContentText>
          {deleteError && <Alert severity="error" sx={{ mt: 2, fontSize: 13 }}>خطأ {deleteError}</Alert>}
        </DialogContentText>
        <DialogActions>
          <Button onClick={handleCloseDelete}>إلغاء</Button>
          <Button onClick={handleConfirmDeleteMultiple} color="error" variant="contained" disabled={deleting}
            startIcon={<SvgColor src="/assets/icons/components/ic_delete.svg" />}>
            {deleting ? "جاري الحذف..." : `حذف (${selectedRows.length})`}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
