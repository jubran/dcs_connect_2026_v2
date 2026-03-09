import { Helmet } from "react-helmet-async";

import MyProfileCP from "src/myApp/pages/ControlPanel/myProfile";

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> Administration: My Profile</title>
      </Helmet>

      <MyProfileCP />
    </>
  );
}
