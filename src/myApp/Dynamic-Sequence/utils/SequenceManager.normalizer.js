export const normalizeSequenceData = (apiData, type) => {
  if (!Array.isArray(apiData)) return [];

  return apiData
    .map((item) => {
      if (!item || !item.id) return null;

      // تحديد الـ label حسب النوع
      let label = item.id.toString();

      switch (type) {
        case "BOP-29":
          label = "SP# " + item.id.toString();
          break;

        case "COTP":
          const locationPart = item.location ?? ""; // SKID#1 SP#3

          // البحث عن جميع الأرقام
          const numbers = locationPart.match(/\d+/g); // ['1','3']

          // أخذ آخر رقم
          const lastNumber = numbers?.[numbers.length - 1] || "";

          label = `${item.group_id}\n SP ${lastNumber}`;
          break;

        case "UNITS":
          label = item.location || item.id.toString();
          break;

        default:
          label =
            item.location || item.name || item.label || item.id.toString();
      }

      const baseItem = {
        id: item.id.toString(),
        label,
        shortLabel: item.id,
        sequence: Number(item.sequence) || 0,
        originalSequence: Number(item.sequence) || 0,
        group: item.cpsid || item.group_id || null,
        note: item.note || "",
        info: item.info || "",
        raw: item,
        changed: false,
      };

      return baseItem;
    })
    .filter(Boolean);
};

export const enhanceTasksWithStatus = (tasks, originalTasks) => {
  return tasks.map((task) => {
    const originalTask = originalTasks.find((t) => t.id === task.id);
    const originalSeq =
      originalTask?.sequence || task.originalSequence || task.sequence;

    return {
      ...task,
      originalSequence: originalSeq,
      changed: task.sequence !== originalSeq,
    };
  });
};
