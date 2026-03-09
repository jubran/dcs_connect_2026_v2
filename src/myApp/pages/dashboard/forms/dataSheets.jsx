import { Helmet } from "react-helmet-async";

import DataSheet from "src/myApp/pages/Forms-sections/dataSheets";

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> Forms: Data Sheet Forms</title>
      </Helmet>

      <DataSheet />
    </>
  );
}
