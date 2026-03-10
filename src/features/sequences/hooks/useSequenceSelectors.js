import { useMemo } from "react";

export const useSequenceSelectors = ({ tasks, reviewOpen, snackbar }) => {
  const changedCount = useMemo(
    () => tasks.filter((t) => t.changed).length,
    [tasks],
  );

  const hasTasks = useMemo(() => tasks.length > 0, [tasks]);
  const hasChanges = useMemo(() => changedCount > 0, [changedCount]);

  const footerText = useMemo(() => {
    if (hasChanges) {
      return `⚠️ لديك ${changedCount} تغييرات غير محفوظة`;
    }
    return "اسحب للتعديل • انقر للإمساك • حرر للإفلات";
  }, [hasChanges, changedCount]);

  return {
    hasTasks,
    hasChanges,
    changedCount,
    footerText,
    isReviewMode: reviewOpen,
    snackbarOpen: snackbar.open,
  };
};
