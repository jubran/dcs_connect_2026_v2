import { DataGrid } from "@mui/x-data-grid";
import { useCallback, useState, useEffect } from "react";
import EmptyContent from "src/components/empty-content/empty-content";
import { dataGridStyles } from "./PrintView/printStyles";

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
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Box } from "@mui/system";
import SvgColor from "src/components/svg-color";

import useSWR, { mutate } from "swr";
import axiosInstance, { fetcher } from "src/shared/utils/axios";
import API_ROUTES from "src/shared/utils/API_ROUTES";
import { useSnackbar } from "src/shared/contexts/SnackbarContext";
import { createEventColumns as createColumns } from "src/shared/components";
import { buildEventsApiUrl } from "src/features/search/services/searchApi";
import { parseTankActionSingleLine } from "src/features/operations/forms/tank/tankDataParser";
// Extracted from inline → now a testable, reusable service
// import { parseTankActionSingleLine } from "src/myApp/DynamicForms/services/tankDataParser";

export default function ShowDataGrid({ date, location, rows1 }) {
  const [rows, setRows] = useState(rows1 || []);
  const [openDetail, setOpenDetail] = useState(false);
  const [detailRow, setDetailRow] = useState(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [rowToDelete, setRowToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [selectedRows, setSelectedRows] = useState([]); // لتخزين الصفوف المحددة
  const { showInfo, showError, showSuccess } = useSnackbar();
  const { handleClose } = useSnackbar();
  const { data: rawData } = useSWR(
    buildEventsApiUrl({ startDate: date, location }),
    fetcher,
  );

  const navigate = useNavigate();

  useEffect(() => {
    if (rawData) setRows(rawData);
  }, [rawData]);

  const handleOpenDetail = (row) => {
    setDetailRow(row);
    setOpenDetail(true);
  };
  const handleCloseDetail = () => {
    setOpenDetail(false);
    setDetailRow(null);
  };
  const handleOpenDelete = () => {
    if (selectedRows.length === 0) {
      showError(" الرجاء تحديد صف واحد على الأقل للحذف");
      return;
    }
    setDeleteError("");
    setOpenDelete(true);
  };

  const handleCloseDelete = () => {
    setOpenDelete(false);
    setDeleteError("");
  };
  const handleConfirmDeleteMultiple = async () => {
    if (selectedRows.length === 0) return;
    setDeleting(true);
    setDeleteError("");

    try {
      // طلب حذف الأحداث المحددة
      const response = await axiosInstance.post(
        API_ROUTES.tanks.delete.multiple(),
        {
          event_ids: selectedRows.map((row) => row.id),
          soft_delete: true, // ← إذا تريد الحذف الناعم
        },
      );

      // Axios يعطينا البيانات مباشرة
      const result = response.data;

      if (!result.success) {
        throw new Error(result?.message || "فشل في حذف الحدث");
      }

      // إشعار نجاح
      showSuccess(result.message || "تم حذف البيانات بنجاح", 3000);

      // إعادة تحميل البيانات في الـ SWR
      await mutate(buildEventsApiUrl({ startDate: date, location }));

      // إعادة تحميل بيانات أخرى مرتبطة (مثلاً حالة الوحدات والخزانات)
      await Promise.all([
        mutate(API_ROUTES.units.status.all()),
        mutate(API_ROUTES.units.status.cotp()),
        mutate(API_ROUTES.units.status.fu()),
        mutate(API_ROUTES.units.status.ft6()),
        mutate(API_ROUTES.tanks.status.all()),
      ]);

      // إعادة تعيين الصفوف المحددة
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
      ...parsedOperations, // ← نضيف هنا الحقول المفككة
    };
    console.log(formData);

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

  const getRowSpacing = useCallback(
    (params) => ({
      top: params.isFirstVisible ? 0 : 5,
      bottom: params.isLastVisible ? 0 : 5,
    }),
    [],
  );

  const columns = createColumns(
    handleOpenDetail,
    handleEditClick,
    handleOpenDelete,
    selectedRows,
  );

  return (
    <>
      <DataGrid
        getRowId={(row) => row.id || Math.random()}
        autoHeight
        rows={rows}
        columns={columns}
        checkboxSelection
        disableRowSelectionOnClick
        onRowSelectionModelChange={(ids) => {
          const selected = rows1.filter((row) => ids.includes(row.id));
          setSelectedRows(selected);
        }}
        rowSelectionModel={selectedRows.map((row) => row.id)}
        getRowSpacing={getRowSpacing}
        pageSizeOptions={[5, 8, 10, 25]}
        initialState={{ pagination: { paginationModel: { pageSize: 8 } } }}
        sx={{ ...dataGridStyles }}
        slots={{
          noRowsOverlay: () => <EmptyContent title="لاتوجد أحداث" />,
          noResultsOverlay: () => (
            <EmptyContent title="لم يتم العثور على أحداث" />
          ),
        }}
        slotProps={{
          basePopper: {
            sx: {
              "& .MuiMenuItem-root": {
                fontFamily: "GE-SS-Two-Medium !important",
                fontSize: 14,
                "&:not(:last-of-type)": {
                  mb: "4px",
                },
              },
            },
          },
        }}
      />

      <Dialog
        open={openDetail}
        onClose={handleCloseDetail}
        fullWidth
        maxWidth="md"
        TransitionComponent={Fade}
        transitionDuration={300}
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
            overflow: "hidden",
            minHeight: 400,
          },
        }}
      >
        {/* Header */}
        <DialogTitle
          sx={{
            textAlign: "center",
            bgcolor: "primary.main",
            color: "white",
            py: 2.5,
            position: "relative",
            "&::after": {
              content: '""',
              position: "absolute",
              bottom: 0,
              left: "10%",
              width: "80%",
              height: "3px",
              bgcolor: "rgba(255,255,255,0.3)",
              borderRadius: "3px",
            },
          }}
        >
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            gap={1.5}
          >
            <SvgColor
              src="/assets/icons/files/ic_document.svg"
              width={28}
              height={28}
              sx={{ opacity: 0.9 }}
            />
            <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
              تفاصيل الصفوف المحددة
            </Typography>
          </Box>
        </DialogTitle>

        {/* Content */}
        <DialogContent
          dividers
          sx={{
            p: 3,
            bgcolor: "grey.50",
            "&::-webkit-scrollbar": {
              width: "8px",
            },
            "&::-webkit-scrollbar-track": {
              background: "#f1f1f1",
            },
            "&::-webkit-scrollbar-thumb": {
              background: "#888",
              borderRadius: "4px",
            },
            "&::-webkit-scrollbar-thumb:hover": {
              background: "#555",
            },
          }}
        >
          {selectedRows && selectedRows.length > 0 ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2.5,
              }}
            >
              {selectedRows.map((row, index) => (
                <Card
                  key={row.id || index}
                  variant="outlined"
                  sx={{
                    borderRadius: 2,
                    borderWidth: 2,
                    borderColor: "divider",
                    overflow: "hidden",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    },
                  }}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    {/* Header with number */}
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                      mb={2}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          color: "primary.main",
                          fontWeight: 700,
                          fontSize: "0.8rem",
                          bgcolor: "primary.lighter",
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 1,
                        }}
                      >
                        #{index + 1}
                      </Typography>

                      {selectedRows.length > 1 && (
                        <Typography
                          variant="caption"
                          sx={{
                            color: "text.secondary",
                            fontWeight: 500,
                          }}
                        >
                          {index + 1} من {selectedRows.length}
                        </Typography>
                      )}
                    </Box>

                    {/* Row details */}
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 1.5,
                      }}
                    >
                      {/* Column 1 */}
                      <Box>
                        <Box display={"flex"} mb={1.5} gap={2}>
                          <Typography
                            variant="body2"
                            sx={{
                              color: "text.secondary",
                              fontWeight: 600,
                              display: "block",
                              mb: 0.5,
                            }}
                          >
                            <Box
                              component="span"
                              display="flex"
                              alignItems="center"
                              gap={0.5}
                            >
                              <SvgColor
                                src="/assets/icons/components/ic_location.svg"
                                width={14}
                                height={14}
                              />
                              <Typography
                                variant="body2"
                                component="span"
                                sx={{
                                  color: "text.secondary",
                                  fontWeight: 600,
                                  display: "block",
                                  mb: 0.5,
                                }}
                              >
                                {" "}
                                الموقع{" "}
                              </Typography>
                            </Box>
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 600,
                              color: "primary.dark",
                            }}
                          >
                            {row.location || "غير محدد"}
                          </Typography>
                        </Box>

                        {/* Status */}
                        <Box display={"flex"} mb={1.5} gap={2}>
                          <Typography
                            variant="body2"
                            sx={{
                              color: "text.secondary",
                              fontWeight: 600,
                              display: "block",
                              mb: 0.5,
                            }}
                          >
                            <Box
                              component="span"
                              display="flex"
                              alignItems="center"
                              gap={0.5}
                            >
                              <SvgColor
                                icon="mdi:state-machine"
                                width={14}
                                height={14}
                              />
                              <Typography
                                component="span"
                                variant="body2"
                                sx={{
                                  color: "text.secondary",
                                  fontWeight: 600,
                                  display: "block",
                                  mb: 0.5,
                                }}
                              >
                                {" "}
                                الحالة{" "}
                              </Typography>
                            </Box>
                          </Typography>
                          <Chip
                            label={row.status1 || "غير معروف"}
                            size="small"
                            sx={{
                              fontWeight: 600,
                              fontSize: "0.75rem",
                              height: 24,
                              bgcolor:
                                row.status1 === "In Service"
                                  ? "success.light"
                                  : row.status1 === "Stand By"
                                    ? "warning.light"
                                    : row.status1 === "Shutdown"
                                      ? "error.light"
                                      : "grey.300",
                              color:
                                row.status1 === "In Service"
                                  ? "success.dark"
                                  : row.status1 === "Stand By"
                                    ? "warning.dark"
                                    : row.status1 === "Shutdown"
                                      ? "error.dark"
                                      : "grey.800",
                            }}
                          />
                        </Box>
                      </Box>

                      {/* Column 2 */}
                      <Box>
                        {/* Date */}
                        <Box display={"flex"} mb={1.5} gap={2}>
                          <Typography
                            component="span"
                            variant="body2"
                            sx={{
                              color: "text.secondary",
                              fontWeight: 600,
                              display: "block",
                              mb: 0.5,
                            }}
                          >
                            <Box
                              component="span"
                              display="flex"
                              alignItems="center"
                              gap={0.5}
                            >
                              <SvgColor
                                src="/assets/icons/dcs/date.svg"
                                width={14}
                                height={14}
                              />
                              التاريخ
                            </Box>
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 600,
                            }}
                          >
                            {row.date1 || "غير محدد"}
                          </Typography>
                        </Box>

                        {/* Time */}
                        <Box display={"flex"} mb={1.5} gap={2}>
                          <Typography
                            component="span"
                            variant="body2"
                            sx={{
                              color: "text.secondary",
                              fontWeight: 600,
                              display: "block",
                              mb: 0.5,
                            }}
                          >
                            <Box
                              component="span"
                              display="flex"
                              alignItems="center"
                              gap={0.5}
                            >
                              <SvgColor
                                src="/assets/icons/components/ic_clock.svg"
                                width={14}
                                height={14}
                              />
                              الوقت
                            </Box>
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 600,
                            }}
                          >
                            {row.time1 || "غير محدد"}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>

                    {/* Action/Description - Full width */}
                    <Box mt={2}>
                      <Typography
                        component="span"
                        variant="body2"
                        sx={{
                          color: "text.secondary",
                          fontWeight: 500,
                          display: "block",
                          mb: 0.5,
                        }}
                      >
                        <Box
                          component="span"
                          display="flex"
                          alignItems="center"
                          gap={0.5}
                        >
                          <SvgColor
                            src="/assets/icons/files/ic_document.svg"
                            width={14}
                            height={14}
                          />
                          الوصف / العملية
                        </Box>
                      </Typography>
                      <Box
                        sx={{
                          bgcolor: "grey.100",
                          p: 1.5,
                          borderRadius: 1,
                          borderLeft: "3px solid",
                          borderColor: "primary.main",
                        }}
                      >
                        <Typography
                          component="span"
                          variant="body2"
                          sx={{
                            color: "text.primary",
                            lineHeight: 1.6,
                          }}
                        >
                          {row.action || "لا يوجد وصف"}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Additional Info if exists */}
                    {(row.note || row.username1 || row.shutdownReason) && (
                      <Box display={"flex"} mb={1.5} gap={2} mt={2}>
                        <Typography
                          variant="caption"
                          sx={{
                            color: "text.secondary",
                            fontWeight: 600,
                            display: "block",
                            mb: 0.5,
                          }}
                        >
                          معلومات إضافية
                        </Typography>
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                          {row.note && (
                            <Chip
                              label={`ملاحظة: ${row.note}`}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: "0.7rem" }}
                            />
                          )}
                          {row.username1 && (
                            <Chip
                              label={`مدخل البيانات: ${row.username1}`}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: "0.7rem" }}
                            />
                          )}
                          {row.shutdownReason && (
                            <Chip
                              label={`سبب: ${row.shutdownReason}`}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: "0.7rem" }}
                            />
                          )}
                        </Box>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              ))}
            </Box>
          ) : (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                py: 8,
                textAlign: "center",
              }}
            >
              <SvgColor
                src="/assets/icons/components/ic_info.svg"
                width={64}
                height={64}
                sx={{ color: "grey.400", mb: 2 }}
              />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                لا توجد صفوف محددة
              </Typography>
              <Typography variant="body2" color="text.secondary">
                الرجاء تحديد صفوف لعرض تفاصيلها
              </Typography>
            </Box>
          )}
        </DialogContent>

        {/* Actions */}
        <DialogActions
          sx={{
            p: 2.5,
            gap: 1.5,
            bgcolor: "grey.50",
            borderTop: "1px solid",
            borderColor: "divider",
          }}
        >
          <Button
            variant="outlined"
            onClick={handleCloseDetail}
            startIcon={<SvgColor src="/assets/icons/components/ic_close.svg" />}
            sx={{
              minWidth: 100,
              borderRadius: 2,
              borderWidth: 2,
              "&:hover": {
                borderWidth: 2,
                bgcolor: "action.hover",
              },
            }}
          >
            إغلاق
          </Button>

          {/* {selectedRows && selectedRows.length > 0 && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<SvgColor  src="/assets/icons/files/ic_file.svg" />}
              onClick={() => window.print()}
              sx={{
                minWidth: 120,
                borderRadius: 2,
                fontWeight: 600,
                boxShadow: "0 4px 12px rgba(25, 118, 210, 0.3)",
              }}>
              طباعة التفاصيل
            </Button>
          )} */}
        </DialogActions>
      </Dialog>

      {/* تأكيد الحذف */}
      <Dialog
        open={openDelete}
        onClose={handleCloseDelete}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle
          sx={{
            fontWeight: 500,
            marginBottom: "10px",
            textAlign: "center",
            bgcolor: "error.main",
            color: "white",
            py: 2.5,
          }}
        >
          تأكيد الحذف
        </DialogTitle>
        <DialogContent dividers>
          هل أنت متأكد من حذف هذا الحدث؟
          <Box mt={1} color="text.secondary" fontSize={13}>
            {selectedRows.map((row) => (
              <Box key={row.id}>
                - <strong>{row.location}</strong> | الحالة: {row.status1}
              </Box>
            ))}
          </Box>
        </DialogContent>

        {/* عرض الخطأ إن وجد */}
        <DialogContentText>
          {deleteError && (
            <Alert severity="error" sx={{ mt: 2, fontSize: 13 }}>
              خطأ {deleteError}
            </Alert>
          )}
        </DialogContentText>

        <DialogActions>
          <Button onClick={handleCloseDelete}>إلغاء</Button>
          <Button
            onClick={handleConfirmDeleteMultiple}
            color="error"
            variant="contained"
            disabled={deleting}
            startIcon={
              <SvgColor src="/assets/icons/components/ic_delete.svg" />
            }
          >
            {deleting ? "جاري الحذف..." : `حذف (${selectedRows.length})`}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
