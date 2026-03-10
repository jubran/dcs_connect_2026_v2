import { useState, useRef, useEffect, useMemo } from "react";
import {
  PointerSensor,
  KeyboardSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";

import SequenceManagerView from "src/features/sequences/components/SequenceView"; // استدعاء المكون الرئيسي
import { useSequenceApi } from "../hooks/useSequenceApi";
import { useDragAndDrop } from "../hooks/useDragAndDrop";
import { useSequenceSelectors } from "src/features/sequences/hooks/useSequenceSelectors";
import { normalizeSequenceData } from "src/features/sequences/utils/sequenceNormalizer";
import { useSequenceManager } from "src/features/sequences/hooks/useSequenceManager";

const SequenceManagerContainer = ({
  apiEndpoint,
  apiUpdateEndpoint,
  type,
  title,
  employeeId,
}) => {
  const [tasks, setTasks] = useState([]);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });

  const originalTasksRef = useRef([]);

  const { data, isLoading, error } = useSequenceApi(apiEndpoint);

  const { handleDragEnd } = useDragAndDrop(tasks, setTasks, originalTasksRef);

  const sequenceManager = useSequenceManager({
    tasks,
    setTasks,
    originalTasksRef,
    apiUpdateEndpoint,
    employeeId,
    setSnackbar,
    setReviewOpen,
  });

  useEffect(() => {
    if (!data) return;

    const normalized = normalizeSequenceData(data, type).sort(
      (a, b) => a.sequence - b.sequence,
    );

    setTasks(normalized);
    originalTasksRef.current = normalized.map((t) => ({ ...t }));
  }, [data, type]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    }),
  );

  const selectors = useSequenceSelectors({
    tasks,
    reviewOpen,
    snackbar,
  });

  const isReviewMode = reviewOpen || selectors?.isReviewMode || false;

  return (
    <SequenceManagerView
      tasks={tasks}
      sensors={sensors}
      snackbar={snackbar}
      setSnackbar={setSnackbar}
      isReviewMode={isReviewMode}
      {...selectors}
      {...sequenceManager}
      title={title}
      isLoading={isLoading}
      error={error}
      onDragEnd={handleDragEnd}
      onReview={sequenceManager.handleReviewAndSave}
      onReset={sequenceManager.handleReset}
      onConfirm={sequenceManager.handleConfirmSave}
      onCancel={sequenceManager.handleCancelReview}
      onBack={sequenceManager.handleBackToEdit}
      handleFilterChange={sequenceManager.handleFilterChange}
      setUserNote={sequenceManager.setUserNote}
      filterType={sequenceManager.filterType}
      userNote={sequenceManager.userNote}
      changedCount={selectors.changedCount}
      hasTasks={selectors.hasTasks}
      hasChanges={selectors.hasChanges}
    />
  );
};

export default SequenceManagerContainer;
