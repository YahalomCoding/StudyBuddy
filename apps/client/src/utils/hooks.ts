import { useState } from "react";

export const useSimpleResizeTopLeft = ({
  defaultWidth = 360,
  defaultHeight = 520,
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
        width: Math.max(280, startWidth - (moveEvent.clientX - startX)),
        height: Math.max(300, startHeight - (moveEvent.clientY - startY)),
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
