import { Helmet } from "react-helmet-async";

import TaskRiskAss from "src/myApp/pages/safety/taskRiskAss";

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <Helmet>
        <title> Safety: TRA</title>
      </Helmet>

      <TaskRiskAss />
    </>
  );
}
