// PrintTable.jsx
import React from "react";
import {
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
} from "@mui/material";
import { getStatusColor } from "./printUtils";
import { StyledTableCell, StyledTableRow } from "./printStyles";

export default function PrintTable({ data = [] }) {
  if (!data || data.length === 0) {
    // لا تنشئ جدولاً فارغًا — هذه طريقة آمنة لمنع الصفحات الفارغة عند الطباعة
    return (
      <Box sx={{ p: 2 }}>
        <Typography align="center">لا توجد بيانات للطباعة</Typography>
      </Box>
    );
  }

  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{
        border: "1px solid #ddd",
        "@media print": { border: "none" },
      }}
    >
      <Table
        size="small"
        sx={{
          width: "100%",
          "@media print": {
            // width: "100%",
            // tableLayout: "fixed",
          },
        }}
      >
        <TableHead>
          <TableRow>
            <StyledTableCell nowrap>#</StyledTableCell>
            <StyledTableCell sx={{ whiteSpace: "nowrap !important" }}>
              التاريخ
            </StyledTableCell>
            <StyledTableCell nowrap>الوقت</StyledTableCell>
            <StyledTableCell nowrap>الموقع</StyledTableCell>
            <StyledTableCell>تفاصيل العمل</StyledTableCell>
            <StyledTableCell nowrap>الحالة</StyledTableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {data.map((row, index) => {
            const clean = (text) => text?.replace(/[,،]\s*$/g, "").trim();

            const workDetailsArray = [
              clean(row.action),
              clean(row.flame),
              clean(row.fsnl),
              clean(row.hyd),
              clean(row.synch),
            ].filter(Boolean);

            const synchDetail = clean(row.synch);
            const hydDetail = clean(row.hyd);
            const otherDetails = workDetailsArray.filter(
              (d) => d !== synchDetail && d !== hydDetail,
            );

            const joinedDetails = otherDetails.join(" , ");

            const workDetailsOutput = (
              <>
                {joinedDetails}

                {/* HYD باللون الأزرق */}
                {hydDetail && (
                  <span style={{ color: "#0070f3", fontWeight: "bold" }}>
                    {joinedDetails ? " , " : ""}
                    {hydDetail}
                  </span>
                )}

                {/* SYNCH باللون الأحمر */}
                {synchDetail && (
                  <span style={{ color: "red", fontWeight: "bold" }}>
                    {joinedDetails || hydDetail ? " , " : ""}
                    {synchDetail}
                  </span>
                )}
              </>
            );

            return (
              <StyledTableRow key={row.id || index} status1={row.status1}>
                <StyledTableCell>{index + 1}</StyledTableCell>
                <StyledTableCell sx={{ whiteSpace: "nowrap !important" }}>
                  {row.date1 || "—"}
                </StyledTableCell>
                <StyledTableCell sx={{ whiteSpace: "nowrap !important" }}>
                  {row.time1 || "—"}
                </StyledTableCell>
                <StyledTableCell sx={{ whiteSpace: "nowrap !important" }}>
                  {row.location || "—"}
                </StyledTableCell>
                <StyledTableCell
                  sx={{
                    textAlign: "right !important",
                    paddingRight: "10px !important",
                    whiteSpace: "wrap !important",
                  }}
                >
                  {workDetailsOutput || "—"}
                </StyledTableCell>
                <StyledTableCell
                  sx={{
                    color: getStatusColor(row.status1),
                    fontWeight: "bold",
                    whiteSpace: "nowrap !important",
                  }}
                >
                  {row.status1 || "—"}
                </StyledTableCell>
              </StyledTableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
