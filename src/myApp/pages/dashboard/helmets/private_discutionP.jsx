import { Helmet } from "react-helmet-async";

import PrivateDiscution from "src/myApp/pages/helmets/private_discution";

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Discutions</title>
      </Helmet>

      <PrivateDiscution />
    </>
  );
}
