import React, { useMemo, useRef, useState, useEffect } from "react";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import { Box, useTheme } from "@mui/material";
import { useDroppable } from "@dnd-kit/core";
import DraggableListItem from "src/features/sequences/components/SequenceDraggableItem";
import { useItemsPerRow } from "../hooks/useItemsPerRow";

function DroppableList({ tasks, groupId }) {
  const theme = useTheme();
  const containerRef = useRef(null);

  const itemIds = useMemo(() => tasks.map((t) => t.id), [tasks]);

  const droppableId = groupId ? `group-${groupId}` : "main-list";

  const { setNodeRef, isOver } = useDroppable({
    id: droppableId,
  });

  useItemsPerRow(containerRef);

  return (
    <SortableContext
      id={droppableId}
      items={itemIds}
      strategy={rectSortingStrategy}
    >
      <Box
        ref={(el) => {
          setNodeRef(el);
          containerRef.current = el;
        }}
        sx={{
          direction: "rtl",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
          gap: 2,
          p: groupId ? 2 : 3,
          borderRadius: groupId ? 2 : 3,
          backgroundColor: isOver
            ? theme.palette.primary.light + "22"
            : theme.palette.grey[50],
          border: "2px dashed",
          borderColor: isOver ? "primary.main" : theme.palette.grey[300],
          position: "relative",
        }}
      >
        {tasks.length === 0 && (
          <Box
            sx={{
              gridColumn: "1 / -1",
              textAlign: "center",
              py: 6,
              opacity: 0.6,
            }}
          >
            لا توجد وحدات في هذه المجموعة
          </Box>
        )}

        {tasks.map((task) => (
          <DraggableListItem key={task.id} task={task} groupId={groupId} />
        ))}
      </Box>
    </SortableContext>
  );
}

export default DroppableList;
