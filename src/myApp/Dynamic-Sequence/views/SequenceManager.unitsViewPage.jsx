import React from "react";
import { SEQUENCE_TYPES } from "../constants/apiEndpoints";
import SequencePage from "./SequenceManager.sequenceMainViewPage";

const UnitsViewPage = () => {
  return (
    <SequencePage
      sequenceType={SEQUENCE_TYPES.GT}
      pageTitle="أولوية التشغيل والإيقاف للوحدات"
    />
  );
};

export default UnitsViewPage;
