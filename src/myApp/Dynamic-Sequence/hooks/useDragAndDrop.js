import { useCallback } from "react";
import { arrayMove } from "@dnd-kit/sortable";

export const useDragAndDrop = (tasks, setTasks, originalTasksRef) => {
  const handleDragEnd = useCallback(
    (event) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = tasks.findIndex((t) => t.id === active.id);
      const newIndex = tasks.findIndex((t) => t.id === over.id);

      if (oldIndex === -1 || newIndex === -1) return;

      const newTasks = arrayMove(tasks, oldIndex, newIndex).map((t, idx) => {
        const originalTask = originalTasksRef.current.find(
          (ot) => ot.id === t.id,
        );
        const originalSeq =
          originalTask?.sequence || t.originalSequence || oldIndex + 1;

        return {
          ...t,
          sequence: idx + 1,
          displaySequence: idx + 1,
          originalSequence: originalSeq,
          changed: idx + 1 !== originalSeq,
        };
      });

      setTasks(newTasks);

      return {
        message: `تم نقل ${active.id} من الترتيب ${oldIndex + 1} إلى ${newIndex + 1}`,
        oldIndex,
        newIndex,
      };
    },
    [tasks, setTasks, originalTasksRef],
  );

  return { handleDragEnd };
};
