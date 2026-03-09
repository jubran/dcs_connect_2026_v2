import { Helmet } from "react-helmet-async";

import SafeWorkPro from "src/myApp/pages/safety/safeWorkPro";

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> Safety: JSP</title>
      </Helmet>

      <SafeWorkPro />
    </>
  );
}
