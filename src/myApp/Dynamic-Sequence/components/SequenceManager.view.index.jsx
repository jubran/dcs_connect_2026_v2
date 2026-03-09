import ReviewPanel from "src/myApp/Dynamic-Sequence/sections/SequenceManager.reviewPanel";
import SequenceManagerViewPresentational from "src/myApp/Dynamic-Sequence/components/SequenceManager.view.presentational";

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
