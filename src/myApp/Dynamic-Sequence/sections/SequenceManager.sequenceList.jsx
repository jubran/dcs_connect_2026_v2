import { memo, useMemo } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { Typography, Box, Paper, Divider } from "@mui/material";
import DroppableList from "src/myApp/DynamicSequence/sequence-sections/SequenceManager.droppableList";

const SequenceList = memo(({ tasks, sensors, onDragEnd }) => {
  if (!tasks.length) {
    return (
      <Typography align="center" sx={{ py: 4 }}>
        لا توجد وحدات
      </Typography>
    );
  }

  // تجميع المهام حسب group_id
  const groupedTasks = useMemo(() => {
    const groups = {};
    tasks.forEach((task) => {
      if (!groups[task.group_id]) {
        groups[task.group_id] = [];
      }
      groups[task.group_id].push(task);
    });
    return groups;
  }, [tasks]);

  const groupIds = Object.keys(groupedTasks);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={(event) => onDragEnd(event)}
    >
      {groupIds.length === 1 ? (
        // حالة مجموعة واحدة - عرض واحد
        <DroppableList tasks={groupedTasks[groupIds[0]]} />
      ) : (
        // حالة متعددة المجموعات - عرض كل مجموعة
        groupIds.map((groupId, index) => (
          <Box key={groupId} sx={{ mb: 3 }}>
            <Paper
              elevation={1}
              sx={{
                p: 2,
                mb: 2,
                backgroundColor: "grey.50",
                borderLeft: 4,
                borderColor: "primary.main",
              }}
            >
              <Typography variant="h6" color="primary" gutterBottom>
                المجموعة: {groupId}
                <Typography
                  component="span"
                  variant="body2"
                  sx={{ ml: 2, color: "text.secondary" }}
                >
                  ({groupedTasks[groupId].length} وحدة)
                </Typography>
              </Typography>
            </Paper>
            <DroppableList tasks={groupedTasks[groupId]} groupId={groupId} />
            {index < groupIds.length - 1 && <Divider sx={{ my: 3 }} />}
          </Box>
        ))
      )}
    </DndContext>
  );
});

export default SequenceList;
