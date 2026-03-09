import { Helmet } from "react-helmet-async";
import UnitsViewPage from "src/myApp/Dynamic-Sequence/views/SequenceManager.unitsViewPage";

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> Sequence: Units </title>
      </Helmet>
      <UnitsViewPage />
    </>
  );
}
