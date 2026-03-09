import { Helmet } from "react-helmet-async";

import MyGroupCP from "src/myApp/pages/ControlPanel/myGroup";

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> Administration: My Group</title>
      </Helmet>

      <MyGroupCP />
    </>
  );
}
