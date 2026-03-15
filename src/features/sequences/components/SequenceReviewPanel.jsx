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
} from "src/features/sequences/components/SequenceChangeBadge";
import { getChangeStatus } from "src/features/sequences/utils/sequenceHelpers";
import SequenceFilters from "src/features/sequences/components/SequenceFilters";

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

  // دالة طباعة البيانات
  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    
    const htmlContent = `
      <!DOCTYPE html>
      <html dir="rtl">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>تقرير الترتيب الجديد</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Segoe UI', Arial, sans-serif;
            padding: 20px;
            background-color: #f5f5f5;
            direction: rtl;
            text-align: right;
          }
          .container {
            max-width: 900px;
            margin: 0 auto;
            background-color: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #1976d2;
            padding-bottom: 15px;
          }
          .header h1 {
            font-size: 28px;
            color: #1976d2;
            margin-bottom: 5px;
          }
          .header p {
            color: #666;
            font-size: 14px;
          }
          .summary {
            display: flex;
            gap: 20px;
            margin-bottom: 30px;
            flex-wrap: wrap;
          }
          .summary-card {
            flex: 1;
            min-width: 150px;
            padding: 15px;
            border-radius: 6px;
            text-align: center;
            border: 1px solid #e0e0e0;
          }
          .summary-card.total {
            background-color: #e3f2fd;
            border: 2px solid #1976d2;
          }
          .summary-card.changed {
            background-color: #fff3e0;
            border: 2px solid #ff9800;
          }
          .summary-card.unchanged {
            background-color: #f5f5f5;
            border: 2px solid #999;
          }
          .summary-card h3 {
            font-size: 24px;
            font-weight: bold;
            color: #333;
            margin-bottom: 5px;
          }
          .summary-card p {
            font-size: 12px;
            color: #666;
          }
          .note-section {
            background-color: #f9f9f9;
            padding: 15px;
            border-left: 4px solid #4caf50;
            margin-bottom: 30px;
            border-radius: 4px;
          }
          .note-section h3 {
            font-size: 14px;
            color: #333;
            margin-bottom: 8px;
          }
          .note-section p {
            font-size: 13px;
            color: #666;
            line-height: 1.6;
            font-style: italic;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          thead {
            background-color: #1976d2;
            color: white;
          }
          thead th {
            padding: 12px;
            text-align: right;
            font-size: 14px;
            font-weight: 600;
          }
          tbody td {
            padding: 12px;
            border-bottom: 1px solid #e0e0e0;
            font-size: 13px;
          }
          tbody tr:nth-child(even) {
            background-color: #f5f5f5;
          }
          tbody tr:hover {
            background-color: #f0f0f0;
          }
          .sequence-box {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 40px;
            height: 40px;
            border-radius: 6px;
            font-weight: bold;
            color: white;
            font-size: 14px;
          }
          .sequence-improved {
            background-color: #4caf50;
          }
          .sequence-decreased {
            background-color: #ff9800;
          }
          .sequence-unchanged {
            background-color: #1976d2;
          }
          .change-badge {
            display: inline-block;
            padding: 4px 10px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 600;
          }
          .change-improved {
            background-color: #e8f5e9;
            color: #2e7d32;
            border: 1px solid #4caf50;
          }
          .change-decreased {
            background-color: #fff3e0;
            color: #e65100;
            border: 1px solid #ff9800;
          }
          .change-unchanged {
            background-color: #f5f5f5;
            color: #666;
            border: 1px solid #999;
          }
          .original-seq {
            color: #666;
            font-size: 12px;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e0e0e0;
            text-align: center;
            color: #999;
            font-size: 11px;
          }
          @media print {
            body {
              padding: 0;
              background-color: white;
            }
            .container {
              box-shadow: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📋 تقرير الترتيب الجديد</h1>
            <p>تاريخ التقرير: ${new Date().toLocaleDateString("ar-SA")}</p>
          </div>

          <div class="summary">
            <div class="summary-card total">
              <h3>${pendingTasks.length}</h3>
              <p>إجمالي العناصر</p>
            </div>
            <div class="summary-card changed">
              <h3>${changesCount}</h3>
              <p>عناصر تم تغييرها</p>
            </div>
            <div class="summary-card unchanged">
              <h3>${pendingTasks.length - changesCount}</h3>
              <p>عناصر بدون تغيير</p>
            </div>
          </div>

          ${userNote.trim() ? `
            <div class="note-section">
              <h3>📝 ملاحظات:</h3>
              <p>${userNote}</p>
            </div>
          ` : ''}

          <h3 style="margin-bottom: 15px; color: #333; font-size: 16px;">📊 تفاصيل الترتيب الجديد:</h3>
          <table>
            <thead>
              <tr>
                <th>اسم العنصر</th>
                <th style="width: 100px;">الترتيب الجديد</th>
                <th style="width: 120px;">الترتيب السابق</th>
                <th style="width: 100px;">الحالة</th>
              </tr>
            </thead>
            <tbody>
              ${filteredTasks.map((task) => {
                const originalTask = originalTasksRef?.current?.find((t) => t.id === task.id);
                const originalSeq = task.originalSequence || originalTask?.sequence || 1;
                let changeStatus = 'no-change';
                if (task.sequence < originalSeq) {
                  changeStatus = 'improved';
                } else if (task.sequence > originalSeq) {
                  changeStatus = 'decreased';
                }
                
                const badgeClass = changeStatus === 'improved' ? 'change-improved' : 
                                  changeStatus === 'decreased' ? 'change-decreased' : 
                                  'change-unchanged';
                const badgeText = changeStatus === 'improved' ? 'تم تقديمها ⬆️' : 
                                 changeStatus === 'decreased' ? 'تم تأخيرها ⬇️' : 
                                 'بدون تغيير';
                const seqClass = changeStatus === 'improved' ? 'sequence-improved' : 
                                changeStatus === 'decreased' ? 'sequence-decreased' : 
                                'sequence-unchanged';

                return `
                  <tr>
                    <td><strong>${task.label || task.id}</strong></td>
                    <td>
                      <div class="sequence-box ${seqClass}">${task.sequence}</div>
                    </td>
                    <td>
                      <span class="original-seq">${originalSeq}</span>
                    </td>
                    <td>
                      <span class="change-badge ${badgeClass}">${badgeText}</span>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>

          <div class="footer">
            <p>تم إنشاء هذا التقرير بواسطة نظام إدارة الترتيب</p>
            <p>الوقت: ${new Date().toLocaleTimeString("ar-SA")}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // انتظر تحميل المحتوى ثم افتح نافذة الطباعة
    printWindow.onload = () => {
      printWindow.print();
    };
  };

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
          variant="outlined"
          color="info"
          onClick={handlePrint}
          startIcon={
            <SvgColor src="/assets/icons/components/ic_print.svg" />
          }
          sx={{ flex: 1, fontWeight: "500" }}
        >
          طباعة
        </Button>
        <Button
          variant="contained"
          color={changesCount === 0 && !userNote.trim() ? "inherit" : "success"}
          onClick={onConfirm}
          disabled={changesCount === 0 && !userNote.trim()}
          sx={{ flex: 2, fontWeight: "bold" }}
        >
          حفظ الترتيب الجديد
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
