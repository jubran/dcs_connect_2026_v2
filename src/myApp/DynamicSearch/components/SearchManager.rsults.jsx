import React from "react";
import { Typography } from "@mui/material";
import ShowDataGrid from "src/myApp/DynamicDashboared/eventsView/ShowDataGrid";

const SearchResults = ({ isLoading, error, data, hasSearched, searchUrl }) => {
  if (error) {
    return (
      <Typography color="error" sx={{ p: 2 }}>
        حدث خطأ أثناء جلب البيانات: {error.message}
      </Typography>
    );
  }

  if (isLoading && searchUrl) {
    return <Typography sx={{ p: 2 }}>جاري البحث والتحميل...</Typography>;
  }

  if (!isLoading && data && searchUrl) {
    if (data.length === 0) {
      return (
        <Typography sx={{ p: 2, color: "text.secondary" }}>
          لم يتم العثور على فعاليات بالمعايير المحددة.
        </Typography>
      );
    }
    return <ShowDataGrid rows1={data} />;
  }

  if (!hasSearched) {
    return (
      <Typography sx={{ p: 2, color: "text.secondary" }}>
        يرجى إدخال معايير البحث ثم النقر على "بحث".
      </Typography>
    );
  }

  return null;
};

export default SearchResults;
