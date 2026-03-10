import ReviewPanel from "src/features/sequences/components/SequenceReviewPanel";
import SequenceManagerViewPresentational from "src/features/sequences/components/SequencePresentational";

const SequenceManagerView = ({
  isReviewMode,
  tasks,
  filterType,
  handleFilterChange,
  userNote,
  setUserNote,
  handleConfirmSave,
  handleCancelReview,
  handleBackToEdit,
  changedCount,
  ...restProps
}) => {
  return (
    <SequenceManagerViewPresentational
      isReviewMode={isReviewMode}
      tasks={tasks}
      {...restProps}
    >
      <ReviewPanel
        pendingTasks={tasks}
        filterType={filterType}
        onFilterChange={handleFilterChange}
        userNote={userNote}
        onNoteChange={setUserNote}
        onConfirm={handleConfirmSave}
        onCancel={handleCancelReview}
        onBack={handleBackToEdit}
        changesCount={changedCount}
      />
    </SequenceManagerViewPresentational>
  );
};

export default SequenceManagerView;
