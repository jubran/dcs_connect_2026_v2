export const getChangeStatus = (currentSeq, originalSeq) => {
  const current = Number(currentSeq) || 1;
  const original = Number(originalSeq) || 1;

  if (current === original) return "no-change";
  if (current < original) return "improved";
  return "decreased";
};

export const calculateChangesCount = (tasks) => {
  return tasks.filter((task) => task.changed).length;
};

export const prepareUpdatePayload = (
  tasks,
  userNote,
  employeeId,
  generateInfo,
) => {
  return {
    sequence: tasks.map((t) => ({
      id: t.id,
      newSequence: t.sequence,
      originalSequence: t.originalSequence,
    })),
    note: userNote.trim() ? userNote : null,
    info: generateInfo(employeeId),
  };
};
