import React from "react";
import { SEQUENCE_TYPES } from "../constants/apiEndpoints";
import SequencePage from "./SequenceManager.sequenceMainViewPage";

const CrudeViewPage = () => {
  return (
    <SequencePage
      sequenceType={SEQUENCE_TYPES.CRUDE}
      pageTitle="أولوية التشغيل والإيقاف لمنقيات الوقود الخام"
    />
  );
};

export default CrudeViewPage;
