import { Suspense, useTransition } from "react";
import { Grid, LinearProgress } from "@mui/material";
import useSWR from "swr";
import { useSettingsContext } from "src/components/settings";
import { _locations } from "src/_mock";

import API_ROUTES from "src/shared/utils/API_ROUTES";
import { fetcher } from "src/shared/utils/axios";
import { TabsCard as PlantTabsCard } from "src/features/dashboard/components/PlantTabsCard";

// const fetcher = (url) => fetch(url).then((res) => res.json());

export default function PlantStatusPage() {
  const [isPending, startTransition] = useTransition();
  const settings = useSettingsContext();

  const {
    data: unitData,
    error: unitError,
    isLoading: unitLoading,
  } = useSWR(API_ROUTES.units.status.all(), fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  const {
    data: ftpData,
    error: ftpError,
    isLoading: ftpLoading,
  } = useSWR(API_ROUTES.units.status.cotp(), fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  const {
    data: fuData,
    error: fuError,
    isLoading: fuLoading,
  } = useSWR(API_ROUTES.units.status.fu(), fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  const {
    data: ft6Data,
    error: ft6Error,
    isLoading: ft6Loading,
  } = useSWR(API_ROUTES.units.status.ft6(), fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  const {
    data: tanksData,
    error: tanksError,
    isLoading: tanksLoading,
  } = useSWR(API_ROUTES.tanks.status.all(), fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  if (unitLoading || ftpLoading || fuLoading || ft6Loading || tanksLoading)
    return (
      <Suspense fallback={<LinearProgress />}>
        {isPending ? "جاري تحميل البيانات..." : "جارٍ التحميل..."}
      </Suspense>
    );

  // // Loader
  // if (unitLoading || ftpLoading || fuLoading || ft6Loading || tanksLoading)
  //   return <div>جاري تحميل البيانات...</div>;

  // Error
  if (unitError || ftpError || fuError || ft6Error || tanksError)
    return <div>حدث خطأ أثناء تحميل البيانات</div>;

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <PlantTabsCard
          title="الوضع الحالي للمحطة"
          units={Array.isArray(unitData) ? unitData : []}
          cotp={Array.isArray(ftpData) ? ftpData : []}
          fus={Array.isArray(fuData) ? fuData : []}
          ft6={Array.isArray(ft6Data) ? ft6Data : []}
          tanks={Array.isArray(tanksData) ? tanksData : []}
          root={[_locations]}
          sx={{
            height: "auto",
            bgcolor: settings.themeMode === "dark" ? "grey.800" : "grey.100",
          }}
        />
      </Grid>
    </Grid>
  );
}
