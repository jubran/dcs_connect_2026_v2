// components/SharedSnackbar.jsx
import React, { useRef, useEffect, useState } from "react";
import Snackbar from "@mui/material/Snackbar";
import { SnackbarContent, IconButton, Icon } from "@mui/material";
import SvgColor from "src/components/svg-color";

const SharedSnackbar = ({
  open,
  message,
  type = "success", // success, error, warning, info
  autoHideDuration = 4000,
  onClose,
  showCloseButton = true,
  draggable = false,
}) => {
  const snackbarRef = useRef(null);
  const isDraggingRef = useRef(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 20, y: 20 });

  // إعادة تعيين الموضع عند الفتح
  useEffect(() => {
    if (open) setPosition({ x: 20, y: 20 });
  }, [open]);

  // إعدادات السحب (اختياري)
  const handleMouseDown = (e) => {
    if (!draggable || !snackbarRef.current) return;
    const rect = snackbarRef.current.getBoundingClientRect();
    dragOffsetRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    isDraggingRef.current = true;
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current || !draggable) return;
    setPosition({
      x: e.clientX - dragOffsetRef.current.x,
      y: e.clientY - dragOffsetRef.current.y,
    });
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  // إضافة وإزالة مستمعات السحب
  useEffect(() => {
    if (open && draggable) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [open, draggable]);

  // الحصول على لون حسب النوع
  const getTypeColor = () => {
    switch (type) {
      case "success":
        return "#4caf50";
      case "error":
        return "#f44336";
      case "warning":
        return "#ff9800";
      case "info":
        return "#2196f3";
      default:
        return "#4caf50";
    }
  };

  // الحصول على أيقونة حسب النوع
  const getTypeIcon = () => {
    switch (type) {
      case "success":
        return (
          <SvgColor
            src="/assets/icons/components/ic_default.svg"
            sx={{ mr: 1 }}
          />
        );
      case "error":
        return (
          <SvgColor
            src="/assets/icons/components/ic_default.svg"
            sx={{ mr: 1 }}
          />
        );
      case "warning":
        return (
          <SvgColor
            src="/assets/icons/components/ic_default.svg"
            sx={{ mr: 1 }}
          />
        );
      default:
        return (
          <SvgColor
            src="/assets/icons/components/ic_default.svg"
            sx={{ mr: 1 }}
          />
        );
    }
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      sx={{
        "& .MuiSnackbarContent-root": {
          backgroundColor: getTypeColor(),
        },
      }}
    >
      <SnackbarContent
        ref={snackbarRef}
        message={
          <div
            style={{
              display: "flex",
              alignItems: "center",
              direction: "rtl",
              fontFamily:
                'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              fontSize: "16px",
              fontWeight: "500",
            }}
          >
            {getTypeIcon()}
            <span>{message}</span>
          </div>
        }
        action={
          showCloseButton && (
            <SvgColor
              src="/assets/icons/components/ic_default.svg"
              icon="mid"
              onClick={onClose}
            >
              <SvgColor
                src="/assets/icons/components/ic_default.svg"
                icon="mid:close"
                fontSize="small"
              />
            </SvgColor>
          )
        }
        onMouseDown={draggable ? handleMouseDown : undefined}
        style={{
          cursor: draggable ? "grab" : "default",
          transform: draggable
            ? `translate(${position.x}px, ${position.y}px)`
            : "none",
          userSelect: "none",
        }}
      />
    </Snackbar>
  );
};

export default SharedSnackbar;
