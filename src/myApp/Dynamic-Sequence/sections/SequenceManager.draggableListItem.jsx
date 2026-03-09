// components/DraggableListItem.jsx
import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Paper, Box, Typography } from "@mui/material";

function DraggableListItem({ task, groupId }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    transition: { duration: 300, easing: "cubic-bezier(0.2, 0, 0.2, 1)" },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    width: "120px",
    height: "80px",
    zIndex: isDragging ? 2000 : 1,
    cursor: isDragging ? "grabbing" : "grab",
    opacity: isDragging ? 0.8 : 1,
    filter: isDragging ? "drop-shadow(0 10px 20px rgba(0,0,0,0.3))" : "none",
  };
  const groupColors = {
    "SKID-1": "#e3f2fd",
    "SKID-2": "#fce4ec",
    "CPS-1": "#e8f5e9",
    "CPS-2": "#e0f7fa",
    // أضف كل مجموعة هنا
  };

  return (
    <Box
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      sx={{ position: "relative" }}
    >
      <Paper
        sx={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 2,
          border: isDragging ? "4px solid" : "2px solid",
          // bgcolor: isDragging ? "linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)" : "background.paper",
          bgcolor: isDragging
            ? "linear-gradient(135deg, #bbdefb 0%, #90caf9 100%)"
            : groupColors[task.group] || "background.paper",
          borderColor: isDragging ? "primary.main" : "grey.200",
          boxShadow: isDragging ? 8 : 2,
          transform: isDragging ? "scale(1.05)" : "scale(1)",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            borderColor: "#00a76f52",
            boxShadow: 4,
            transform: "translateY(-4px)",
          },
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            fontSize: "12px",
            color: "grey.500",
            opacity: 0.3,
            userSelect: "none",
          }}
        >
          ⋮⋮
        </Box>

        <Typography
          variant="body2"
          sx={{
            whiteSpace: "pre-line",
            fontWeight: 700,
            textAlign: "center",
            color: "primary.main",
            fontSize: "0.9rem",
          }}
        >
          {task.label}
        </Typography>

        {isDragging && (
          <Typography
            variant="caption"
            sx={{
              color: "primary.main",
              fontWeight: 600,
              mt: 0.5,
            }}
          >
            يجري السحب...
          </Typography>
        )}
      </Paper>

      {isDragging && (
        <Box
          sx={{
            position: "absolute",
            top: -4,
            left: -4,
            right: -4,
            bottom: -4,
            borderRadius: 4,
            border: "2px dashed",
            borderColor: "primary.light",
            animation: "pulse 1.5s infinite",
            pointerEvents: "none",
            zIndex: -1,
            "@keyframes pulse": {
              "0%, 100%": { opacity: 0.5 },
              "50%": { opacity: 0.2 },
            },
          }}
        />
      )}
    </Box>
  );
}

export default React.memo(DraggableListItem);
