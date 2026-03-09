import { useState, useEffect } from "react";
import dayjs from "dayjs";
import useSWR from "swr";

import Card from "@mui/material/Card";
import { CardHeader, CircularProgress } from "@mui/material";
import { Box } from "@mui/system";

import ShowDataGrid from "./ShowDataGrid";
import DataGridToolbar from "./DataGridToolbar";

import {
  fetcher,
  buildEventsApiUrl,
  processEventsData,
} from "src/myApp/DynamicSearch/services/SearchManager.api";

export default function EventsViewPage() {
  const [dateValue, setDateValue] = useState(dayjs());
  const [location, setLocation] = useState("");

  // مفتاح SWR يعتمد على التاريخ و الموقع
  const [fetchKey, setFetchKey] = useState(null);

  // تحديث fetchKey تلقائيًا عند تغيير التاريخ أو الموقع
  useEffect(() => {
    const url = buildEventsApiUrl({
      startDate: dateValue.format("YYYY-MM-DD"),
      location,
    });
    if (url) setFetchKey(url);
  }, [dateValue, location]);

  const {
    data: rawData,
    error,
    isLoading,
  } = useSWR(fetchKey, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
  });

  const data = processEventsData(rawData);

  return (
    <Card sx={{ p: 2 }}>
      <CardHeader title="ملخص هذا اليوم" />

      <DataGridToolbar
        dateValue={dateValue}
        setDateValue={setDateValue}
        location={location}
        setLocation={setLocation}
        dataIs={data}
      />

      {error && (
        <p style={{ color: "red" }}>
          حدث خطأ أثناء جلب البيانات: {error.message}
        </p>
      )}

      {isLoading && (
        <Box display="flex" justifyContent="center" my={2}>
          <CircularProgress size={24} />
        </Box>
      )}

      {!isLoading && (
        <ShowDataGrid
          rows1={data}
          date={dateValue.format("YYYY-MM-DD")}
          // location={location}
        />
      )}
    </Card>
  );
}
// <Card sx={{ p: 2 }}>
//   <CardHeader title="ملخص هذا اليوم" />

//   <DataGridToolbar
//     dateValue={dateValue}
//     setDateValue={setDateValue}
//     location={location}
//     setLocation={setLocation}
//     dataIs={data}
//   />

//   {error && <p style={{ color: "red" }}>حدث خطأ أثناء جلب البيانات: {error.message}</p>}

//   {isLoading && (
//     <Box display="flex" justifyContent="center" my={2}>
//       <CircularProgress size={24} />
//     </Box>
//   )}

//   {!isLoading && data && data.length > 0 && (
//     <ShowDataGrid rows1={data} />
//   )}

//   {!isLoading && data && data.length === 0 && (
//     <Box textAlign="center" mt={2}>
//       لا توجد بيانات لعرضها
//     </Box>
//   )}
// </Card>
