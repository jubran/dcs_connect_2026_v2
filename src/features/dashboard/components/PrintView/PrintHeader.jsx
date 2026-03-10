// PrintHeader.jsx (المصحح)
import React from "react";
import { Typography, Stack } from "@mui/material";

export default function PrintHeader({ criteria }) {
  let criteriaText = "";
  const title = " نتائج البحث";

  // بناء نص معايير البحث
  if (criteria) {
    const { startDate, endDate, location } = criteria;

    let datePart = "";
    if (startDate && endDate && startDate !== endDate) {
      // 🚨 التصحيح: استخدام dir="ltr" لعزل التواريخ والحفاظ على تسلسلها
      datePart = (
        <span>
          من تاريخ:{" "}
          <span dir="ltr" style={{ display: "inline-block" }}>
            {startDate}
          </span>{" "}
          إلى تاريخ:{" "}
          <span dir="ltr" style={{ display: "inline-block" }}>
            {endDate}
          </span>
        </span>
      );
    } else if (startDate) {
      // بحث بتاريخ واحد
      datePart = (
        <span>
          <span dir="rtl" style={{ display: "inline-block" }}>
            {startDate}
          </span>{" "}
          / التاريخ المحدد
        </span>
      );
    }

    let locationPart = "";
    if (location) {
      // 🚨 التصحيح: استخدام dir="ltr" لعزل الموقع (GT19) والحفاظ على تسلسله
      locationPart = (
        <span>
          الموقع:{" "}
          <span dir="ltr" style={{ display: "inline-block" }}>
            {location}
          </span>
        </span>
      );
    }

    // دمج الأجزاء (باستخدام سلاسل JSX بدلاً من النصوص العادية)
    const parts = [];
    if (datePart) parts.push(datePart);
    if (locationPart) parts.push(locationPart);

    // استخدام الـ JSX لدمج الأجزاء مع العلامة الفاصلة
    if (parts.length > 0) {
      criteriaText = parts.reduce((prev, curr, index) => {
        if (index === 0) return curr;
        // إضافة الفاصل ( | ) بين الأجزاء
        return (
          <React.Fragment key={index}>
            {prev} | {curr}
          </React.Fragment>
        );
      }, null);
    } else {
      criteriaText = "جلب بيانات اليوم الحالي (بحث افتراضي)";
    }
  }

  return (
    <Stack
      direction="column"
      alignItems="center"
      spacing={1}
      sx={{
        mb: 2,
        borderBottom: "2px solid #000",
        // ضمان أن الحاوية الأبوية تستخدم RTL
        direction: "rtl",
      }}
    >
      <Typography variant="h5" sx={{ fontWeight: "bold" }}>
        {title}
      </Typography>
      {criteriaText && (
        <Typography
          variant="subtitle1"
          color="text.secondary"
          // 🚨 ضمان أن يكون النص الأب يتبع الـ RTL
          component="span"
          sx={{ direction: "rtl" }}
        >
          {criteriaText}
        </Typography>
      )}
    </Stack>
  );
}
