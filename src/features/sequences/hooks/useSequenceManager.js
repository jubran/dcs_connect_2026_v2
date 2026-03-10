import { useState, useCallback } from "react";
import { generateInfo } from "src/shared/utils";
import {
  calculateChangesCount,
  prepareUpdatePayload,
} from "src/features/sequences/utils/sequenceHelpers";
import { enhanceTasksWithStatus } from "src/features/sequences/utils/sequenceNormalizer";
import { sequenceApi } from "src/features/sequences/services/sequenceApi";

export const useSequenceManager = ({
  tasks,
  setTasks,
  originalTasksRef,
  apiUpdateEndpoint,
  employeeId,
  setSnackbar,
  setReviewOpen,
}) => {
  const [userNote, setUserNote] = useState("");
  const [pendingTasks, setPendingTasks] = useState([]);
  const [filterType, setFilterType] = useState("all");

  const handleReviewAndSave = useCallback(() => {
    if (tasks.length === 0) {
      setSnackbar({ open: true, message: "لا توجد وحدات لمراجعتها" });
      return;
    }

    const tasksWithChanges = enhanceTasksWithStatus(
      tasks,
      originalTasksRef.current,
    );
    setPendingTasks(tasksWithChanges);
    setReviewOpen(true);
    setFilterType("all");
  }, [tasks, originalTasksRef, setSnackbar, setReviewOpen]);

  const handleFilterChange = (event, newFilter) => {
    if (newFilter !== null) {
      setFilterType(newFilter);
    }
  };

  const handleConfirmSave = useCallback(async () => {
    try {
      const payload = prepareUpdatePayload(
        pendingTasks,
        userNote,
        employeeId,
        generateInfo,
      );

      const result = await sequenceApi.updateSequence(
        apiUpdateEndpoint,
        payload,
      );

      // Update local state
      const updatedTasks = pendingTasks.map((task) => ({
        ...task,
        originalSequence: task.sequence,
        changed: false,
      }));

      setTasks(updatedTasks);
      originalTasksRef.current = updatedTasks.map((t) => ({ ...t }));

      setSnackbar({
        open: true,
        message: result.message || "✅ تم حفظ الترتيب والملاحظة بنجاح!",
      });

      setReviewOpen(false);
      setUserNote("");
      setPendingTasks([]);
    } catch (err) {
      setSnackbar({
        open: true,
        message: `حدث خطأ أثناء الحفظ: ${err.message}`,
      });
    }
  }, [
    pendingTasks,
    userNote,
    employeeId,
    apiUpdateEndpoint,
    setTasks,
    originalTasksRef,
    setSnackbar,
    setReviewOpen,
  ]);

  const handleReset = useCallback(() => {
    const resetTasks = originalTasksRef.current.map((originalTask) => {
      const currentTask = tasks.find((t) => t.id === originalTask.id);
      return {
        ...currentTask,
        sequence: originalTask.sequence,
        originalSequence: originalTask.sequence,
        changed: false,
      };
    });

    setTasks(resetTasks);
    setSnackbar({
      open: true,
      message: "تم إعادة التعيين إلى الترتيب الأصلي",
    });
  }, [tasks, originalTasksRef, setTasks, setSnackbar]);

  const handleCancelReview = useCallback(() => {
    setReviewOpen(false);
    setPendingTasks([]);
    setUserNote("");
    setSnackbar({
      open: true,
      message: "تم إلغاء عملية الحفظ",
    });
  }, [setReviewOpen, setSnackbar]);

  const handleBackToEdit = useCallback(() => {
    setReviewOpen(false);
    setPendingTasks([]);
  }, [setReviewOpen]);

  const changesCount = calculateChangesCount(pendingTasks);

  return {
    userNote,
    setUserNote,
    pendingTasks,
    setPendingTasks,
    filterType,
    setFilterType,
    handleReviewAndSave,
    handleConfirmSave,
    handleCancelReview,
    handleReset,
    handleBackToEdit,
    handleFilterChange,
    changesCount,
  };
};
