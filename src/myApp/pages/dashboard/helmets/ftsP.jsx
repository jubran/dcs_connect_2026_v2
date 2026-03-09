import { Helmet } from "react-helmet-async";

import FtsView from "src/myApp/pages/helmets/fts";

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> Dashboard: FTS</title>
      </Helmet>

      <FtsView />
    </>
  );
}
