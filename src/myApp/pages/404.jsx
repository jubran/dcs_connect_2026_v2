import { Helmet } from "react-helmet-async";

import { NotFoundView } from "src/myApp/pages/error";

// ----------------------------------------------------------------------

export default function NotFoundPage() {
  return (
    <>
      <Helmet>
        <title> 404 Page Not Found!</title>
      </Helmet>

      <NotFoundView />
    </>
  );
}
