import { Helmet } from "react-helmet-async";

import FuelTanksView from "src/myApp/pages/helmets/fuel_tanks";

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Fuel Tanks</title>
      </Helmet>

      <FuelTanksView />
    </>
  );
}
