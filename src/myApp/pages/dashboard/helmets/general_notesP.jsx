import { Helmet } from "react-helmet-async";

import GeneralView from "src/myApp/pages/helmets/general_notes";

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Nots</title>
      </Helmet>

      <GeneralView />
    </>
  );
}
