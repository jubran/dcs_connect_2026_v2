import { Helmet } from "react-helmet-async";
import SearchCars from "src/myApp/DynamicSearch/views/searchCars";

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> Search: Operation Vehicle</title>
      </Helmet>

      <SearchCars />
    </>
  );
}
