import React from "react";
import { Chip } from "@mui/material";

import { getChangeStatus } from "src/myApp/Dynamic-Sequence/utils/SequenceManager.helpers";
import SvgColor from "src/components/svg-color";

const ChangeBadge = ({ task, originalTasksRef, showBadge = true }) => {
  if (!showBadge || !task) return null;

  const originalTask = originalTasksRef?.current?.find((t) => t.id === task.id);
  const originalSeq = task.originalSequence || originalTask?.sequence || 1;
  const currentSeq = task.sequence || 1;

  const changeStatus = getChangeStatus(currentSeq, originalSeq);

  if (changeStatus === "no-change") return null;

  const changeAmount = Math.abs(currentSeq - originalSeq);

  return (
    <Chip
      size="small"
      icon={
        changeStatus === "improved" ? (
          <SvgColor
            src="/assets/icons/components/ic_arrow_up.svg"
            width={16}
            height={16}
          />
        ) : (
          <SvgColor
            src="/assets/icons/components/ic_arrow_down.svg"
            width={16}
            height={16}
          />
        )
      }
      label={`${changeAmount}`}
      color={changeStatus === "improved" ? "success" : "warning"}
      variant="outlined"
      sx={{ fontWeight: "bold", ml: 1 }}
    />
  );
};

export const ChangesCountBadge = ({ count }) => {
  if (count === 0) return null;

  return (
    <Chip
      label={`${count} تغيير`}
      color="warning"
      variant="outlined"
      size="small"
    />
  );
};

export default ChangeBadge;
