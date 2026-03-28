import { Box } from "@mui/material";

export const ResizeIcon = ({
  handleResizeMouseDown,
}: {
  handleResizeMouseDown: React.MouseEventHandler<HTMLDivElement>;
}) => (
  <Box
    onMouseDown={handleResizeMouseDown}
    sx={{
      position: "absolute",
      top: 0,
      right: 0,
      width: 22,
      height: 22,
      cursor: "ne-resize",
      zIndex: 10,
      opacity: 0.3,
      transition: "opacity 0.15s",
      color: "text.primary",
      "&:hover": { opacity: 0.85 },
    }}
  >
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      style={{ position: "absolute", top: 5, right: 5 }}
    >
      <line
        x1="12"
        y1="10"
        x2="2"
        y2="0"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="12"
        y1="5"
        x2="7"
        y2="0"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  </Box>
);
