import { Helmet } from "react-helmet-async";

import { JwtLoginView } from "src/myApp/pages/jwt";

// ----------------------------------------------------------------------

export default function LoginPage() {
  return (
    <>
      <Helmet>
        <title> Jwt: Login</title>
      </Helmet>

      <JwtLoginView />
    </>
  );
}
