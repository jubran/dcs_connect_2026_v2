// components/DraggableSnackbar.jsx
import React, { useRef, useEffect, useState } from "react";
import Snackbar from "@mui/material/Snackbar";
import { SnackbarContent } from "@mui/material";

const DraggableSnackbar = ({ open, message, autoHideDuration, onClose }) => {
  const snackbarRef = useRef(null);
  const isDraggingRef = useRef(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 20, y: 20 });

  useEffect(() => {
    if (open) setPosition({ x: 20, y: 20 });
  }, [open]);

  const handleMouseDown = (e) => {
    if (!snackbarRef.current) return;
    const rect = snackbarRef.current.getBoundingClientRect();
    dragOffsetRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    isDraggingRef.current = true;
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current) return;
    setPosition({
      x: e.clientX - dragOffsetRef.current.x,
      y: e.clientY - dragOffsetRef.current.y,
    });
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  useEffect(() => {
    if (open) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [open]);

  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
    >
      <SnackbarContent
        ref={snackbarRef}
        message={message}
        onMouseDown={handleMouseDown}
        style={{
          display: "flex",
          justifyContent: "center",
          direction: "rtl",
          fontFamily:
            'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          fontSize: "16px",
          cursor: "grab",
          transform: `translate(${position.x}px, ${position.y}px)`,
        }}
      />
    </Snackbar>
  );
};

export default DraggableSnackbar;
