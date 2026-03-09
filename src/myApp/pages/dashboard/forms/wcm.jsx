import { Helmet } from "react-helmet-async";

import Wcm from "src/myApp/pages/Forms-sections/wcm";

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> Forms: WCM Forms</title>
      </Helmet>

      <Wcm />
    </>
  );
}
