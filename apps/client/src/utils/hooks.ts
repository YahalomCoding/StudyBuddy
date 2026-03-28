import { useState } from "react";

export const useSimpleResizeToRight = ({
  defaultWidth = 380,
  defaultHeight = 500,
}) => {
  const [panelDimensions, setPanelDimensions] = useState({
    width: defaultWidth,
    height: defaultHeight,
  });

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = panelDimensions.width;
    const startHeight = panelDimensions.height;

    const onMouseMove = (moveEvent: MouseEvent) => {
      setPanelDimensions({
        width: Math.max(defaultWidth, startWidth + (moveEvent.clientX - startX)),
        height: Math.max(defaultHeight, startHeight - (moveEvent.clientY - startY)),
      });
    };

    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  return { panelDimensions, handleResizeMouseDown };
};
