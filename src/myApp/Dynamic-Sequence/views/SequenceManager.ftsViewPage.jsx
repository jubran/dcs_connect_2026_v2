import React from "react";
import { SEQUENCE_TYPES } from "../constants/apiEndpoints";
import SequencePage from "./SequenceManager.sequenceMainViewPage";

const FtsViewPage = () => {
  return (
    <SequencePage
      sequenceType={SEQUENCE_TYPES.FTS}
      pageTitle="أولوية التشغيل والإيقاف للمنقيات"
    />
  );
};

export default FtsViewPage;
