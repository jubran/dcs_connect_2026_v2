import React from "react";
import { SEQUENCE_TYPES } from "src/features/sequences/sequenceEndpoints";
import SequencePage from "./SequenceMainPage";

const FtsViewPage = () => {
  return (
    <SequencePage
      sequenceType={SEQUENCE_TYPES.FTS}
      pageTitle="أولوية التشغيل والإيقاف للمنقيات"
    />
  );
};

export default FtsViewPage;
