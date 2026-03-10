import React from "react";
import { SEQUENCE_TYPES } from "src/features/sequences/sequenceEndpoints";
import SequencePage from "./SequenceMainPage";

const UnitsViewPage = () => {
  return (
    <SequencePage
      sequenceType={SEQUENCE_TYPES.GT}
      pageTitle="أولوية التشغيل والإيقاف للوحدات"
    />
  );
};

export default UnitsViewPage;
