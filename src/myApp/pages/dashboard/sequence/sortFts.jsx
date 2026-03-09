import { Helmet } from "react-helmet-async";
import FtsViewPage from "src/myApp/Dynamic-Sequence/views/SequenceManager.ftsViewPage";

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> Sequence: Fuel TR plant</title>
      </Helmet>

      <FtsViewPage />
    </>
  );
}
