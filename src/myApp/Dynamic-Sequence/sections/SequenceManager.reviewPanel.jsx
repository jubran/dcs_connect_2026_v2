// ReviewPanel.jsx
import React, { useMemo } from "react";
import {
  Paper,
  Typography,
  Alert,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  Box,
  Chip,
} from "@mui/material";

import ChangeBadge, {
  ChangesCountBadge,
} from "src/myApp/Dynamic-Sequence/sections/SequenceManager.changeBadge";
import { getChangeStatus } from "src/myApp/Dynamic-Sequence/utils/SequenceManager.helpers";
import SequenceFilters from "src/myApp/Dynamic-Sequence/sections/SequenceManager.filters";

import SvgColor from "src/components/svg-color";

const ReviewPanel = ({
  pendingTasks,
  filterType,
  onFilterChange,
  userNote,
  onNoteChange,
  onConfirm,
  onCancel,
  onBack,
  changesCount,
  originalTasksRef,
}) => {
  // فلترة المهام حسب النوع وحفظ الترتيب حسب sequence
  const filteredTasks = useMemo(() => {
    let tasksCopy = pendingTasks.map((task) => ({
      ...task,
      changed: task.changed ?? task.sequence !== task.originalSequence,
    }));

    if (filterType === "changed") {
      tasksCopy = tasksCopy.filter((task) => task.changed);
    } else if (filterType === "unchanged") {
      tasksCopy = tasksCopy.filter((task) => !task.changed);
    }

    return tasksCopy.sort((a, b) => a.sequence - b.sequence);
  }, [pendingTasks, filterType]);

  console.log(pendingTasks);
  return (
    <>
      <Alert severity="warning" sx={{ mb: 3 }}>
        ⚠️ يرجى مراجعة الترتيب الجديد قبل التأكيد النهائي. التغييرات ستكون دائمة
        بعد التأكيد.
      </Alert>

      {/* فلترة */}
      <SequenceFilters
        tasks={pendingTasks.length}
        filterType={filterType}
        onFilterChange={onFilterChange}
        filteredCount={filteredTasks.length}
      />

      {/* ملاحظة */}
      <TextField
        label="ملاحظة"
        placeholder={
          changesCount === 0
            ? "لا يوجد أي تغييرات للحفظ"
            : "اكتب ملاحظتك هنا بعد المراجعة"
        }
        className="custom-textarea"
        fullWidth
        multiline
        minRows={2}
        value={userNote}
        onChange={(e) => onNoteChange(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <SvgColor
              src="/assets/icons/files/ic_document.svg"
              style={{
                margin: "0 0 auto 10px ",
                marginBottom: "auto",
                color: "#555",
                alignContent: "center",
              }}
            />
          ),
        }}
      />

      {/* قائمة المهام */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3, bgcolor: "grey.50" }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <SvgColor
              src="/assets/icons/components/ic_check.svg"
              width={24}
              height={24}
              color="#4caf50"
            />
            <Typography variant="h6" color="primary">
              {pendingTasks?.length > 9
                ? "  ترتيب الوحدات الجديد :"
                : "  ترتيب المنقيات الجديد :"}
            </Typography>
          </Box>
          <ChangesCountBadge count={changesCount} />
        </Box>
        <Divider />
        <List
          sx={{
            maxHeight: 400,
            overflow: "auto",
            borderRadius: 1,
            paddingTop: 2,
          }}
        >
          {filteredTasks.length === 0 ? (
            <Typography
              sx={{ p: 4, textAlign: "center", color: "text.secondary" }}
            >
              لا توجد وحدات تطابق الفلتر المختار
            </Typography>
          ) : (
            filteredTasks.map((task, index) => {
              const originalTask = originalTasksRef?.current?.find(
                (t) => t.id === task.id,
              );
              const originalSeq =
                task.originalSequence || originalTask?.sequence || 1;
              const changeStatus = getChangeStatus(task.sequence, originalSeq);

              return (
                <React.Fragment key={task.id}>
                  <ListItem
                    sx={{
                      bgcolor:
                        changeStatus === "no-change"
                          ? "white"
                          : changeStatus === "improved"
                            ? "#e8f5e9"
                            : "#fff3e0",
                      borderRadius: 1,
                      mb: 0.6,
                      borderLeft:
                        changeStatus === "no-change"
                          ? "none"
                          : changeStatus === "improved"
                            ? "4px solid #4caf50"
                            : "4px solid #ff9800",
                      transition: "all 0.3s ease",
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Box
                            sx={{
                              width: 36,
                              height: 36,
                              borderRadius: "8px",
                              backgroundColor:
                                changeStatus === "improved"
                                  ? "success.main"
                                  : changeStatus === "decreased"
                                    ? "warning.main"
                                    : "primary.main",
                              color: "white",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: "bold",
                              fontSize: "16px",
                              boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                            }}
                          >
                            {task.sequence}
                          </Box>

                          <Typography
                            variant="body1"
                            fontWeight={
                              changeStatus !== "no-change" ? "600" : "600"
                            }
                          >
                            {task.label || task.id}
                          </Typography>

                          <ChangeBadge
                            task={task}
                            originalTasksRef={originalTasksRef}
                          />
                        </Box>
                      }
                      secondary={
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            mt: 1,
                          }}
                        >
                          {changeStatus !== "no-change" && (
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                              }}
                            >
                              <SvgColor
                                src="/assets/icons/files/ic_history.svg"
                                width={14}
                                height={14}
                                color="text.secondary"
                              />
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                السابق: <strong>{originalSeq}</strong>
                              </Typography>
                              <SvgColor
                                src="/assets/icons/components/ic_default.svg"
                                icon={
                                  changeStatus === "improved"
                                    ? "mdi:trending-up"
                                    : "mdi:trending-down"
                                }
                                width={14}
                                height={14}
                                color={
                                  changeStatus === "improved"
                                    ? "#4caf50"
                                    : "#ff9800"
                                }
                              />
                              <Typography
                                variant="caption"
                                sx={{
                                  color:
                                    changeStatus === "improved"
                                      ? "#4caf50"
                                      : "#ff9800",
                                  fontWeight: "medium",
                                }}
                              >
                                {changeStatus === "improved"
                                  ? "تم تقديمها"
                                  : "تم تأخيرها"}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>

                  {index < filteredTasks.length - 1 && <Divider />}
                </React.Fragment>
              );
            })
          )}
        </List>
      </Paper>

      {/* أزرار التحكم */}
      <Box
        sx={{ display: "flex", justifyContent: "space-between", gap: 2, mt: 4 }}
      >
        <Button
          variant="outlined"
          color="secondary"
          onClick={onBack}
          startIcon={
            <SvgColor src="/assets/icons/components/ic_arrow_right.svg" />
          }
          sx={{ flex: 1 }}
        >
          العودة للتعديل
        </Button>
        <Button
          variant="contained"
          color={changesCount === 0 && !userNote.trim() ? "inherit" : "success"}
          onClick={onConfirm}
          disabled={changesCount === 0 && !userNote.trim()}
          sx={{ flex: 2, fontWeight: "bold" }}
        >
          حفظ التغييرات
        </Button>
        <Button
          variant="outlined"
          color="error"
          onClick={onCancel}
          sx={{ flex: 1 }}
        >
          إلغاء
        </Button>
      </Box>
    </>
  );
};

export default ReviewPanel;
