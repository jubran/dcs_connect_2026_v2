import { useState, useEffect, useRef } from "react";

export const useItemsPerRow = () => {
  const [itemsPerRow, setItemsPerRow] = useState(5);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const updateItemsPerRow = () => {
      const width = containerRef.current.offsetWidth;
      setItemsPerRow(Math.max(1, Math.floor(width / 240)));
    };

    const observer = new ResizeObserver(updateItemsPerRow);
    observer.observe(containerRef.current);

    // تحديث أولي
    updateItemsPerRow();

    return () => observer.disconnect();
  }, []);

  return { itemsPerRow, containerRef };
};
