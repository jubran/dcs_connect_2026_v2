import { Helmet } from "react-helmet-async";
import CrudeViewPage from "src/myApp/Dynamic-Sequence/views/SequenceManager.crudeViewPage";

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> Sequence: CRUDE </title>
      </Helmet>

      <CrudeViewPage />
    </>
  );
}
