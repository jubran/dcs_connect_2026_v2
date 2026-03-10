import React from "react";
import { SEQUENCE_TYPES } from "src/features/sequences/sequenceEndpoints";
import SequencePage from "./SequenceMainPage";

const CrudeViewPage = () => {
  return (
    <SequencePage
      sequenceType={SEQUENCE_TYPES.CRUDE}
      pageTitle="أولوية التشغيل والإيقاف لمنقيات الوقود الخام"
    />
  );
};

export default CrudeViewPage;
