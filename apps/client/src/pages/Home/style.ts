import { css } from "@emotion/css";

export const useStyles = () => {
  return {
    page: css({
      minHeight: "100vh",
      background:
        "radial-gradient(circle at 80% 0%, #fff3dc 0%, #f6f9fc 45%, #edf6ff 100%)",
      paddingTop: "48px",
      paddingBottom: "48px",
      paddingLeft: "40px",
      paddingRight: "40px",
      '[data-mui-color-scheme="dark"] &': {
        background:
          "radial-gradient(circle at 80% 0%, #1a1030 0%, #111827 45%, #0d1f35 100%)",
      },
    }),
    content: css({
      maxWidth: "1180px",
      margin: "0 auto",
      display: "grid",
      gap: "40px",
      direction: "rtl",
    }),
    title: css({
      fontWeight: 600,
      letterSpacing: "-0.01em",
    }),
    section: css({
      display: "grid",
      gap: "12px",
    }),
    sectionTitle: css({
      fontWeight: 600,
    }),
    tablePaper: css({
      border: "1px solid var(--mui-palette-divider)",
      borderRadius: "8px",
      overflow: "hidden",
      boxShadow: "none",
    }),
    tableHeadRow: css({
      backgroundColor: "var(--mui-palette-action-hover)",
    }),
    taskNameCell: css({
      fontWeight: 500,
    }),
    assignmentNameCell: css({
      fontWeight: 500,
    }),
    overdueRow: css({
      backgroundColor: "#fff8f6",
      borderLeft: "3px solid #fca5a5",
      '[data-mui-color-scheme="dark"] &': {
        backgroundColor: "#2d1212",
      },
    }),
    overdueDaysCell: css({
      color: "#b42318",
      fontWeight: 600,
    }),
    regularDaysCell: css({
      color: "var(--mui-palette-text-secondary)",
    }),
    chipBase: css({
      fontWeight: 500,
    }),
  };
};

type ChipColors = {
  light: { backgroundColor: string; color: string };
  dark: { backgroundColor: string; color: string };
};

const makeChipClass = ({ light, dark }: ChipColors) =>
  css({
    fontWeight: 500,
    backgroundColor: light.backgroundColor,
    color: light.color,
    '[data-mui-color-scheme="dark"] &': {
      backgroundColor: dark.backgroundColor,
      color: dark.color,
    },
  });

const statusChipColors: Record<string, ChipColors> = {
  הושלם: {
    light: { backgroundColor: "#e8f5e9", color: "#2e7d32" },
    dark: { backgroundColor: "#1b3a2d", color: "#81c995" },
  },
  פעיל: {
    light: { backgroundColor: "#e3f2fd", color: "#1565c0" },
    dark: { backgroundColor: "#0d2137", color: "#64b5f6" },
  },
};
const statusChipDefault: ChipColors = {
  light: { backgroundColor: "#fff3e0", color: "#b54708" },
  dark: { backgroundColor: "#2d1a00", color: "#ffb74d" },
};

export const statusChipClass = (status: string) =>
  makeChipClass(statusChipColors[status] ?? statusChipDefault);

const typeChipColors: Record<string, ChipColors> = {
  פרויקט: {
    light: { backgroundColor: "#e3f2fd", color: "#1d4ed8" },
    dark: { backgroundColor: "#0d2137", color: "#60a5fa" },
  },
  תרגול: {
    light: { backgroundColor: "#e8f5e9", color: "#2e7d32" },
    dark: { backgroundColor: "#1b3a2d", color: "#81c995" },
  },
};
const typeChipDefault: ChipColors = {
  light: { backgroundColor: "#f3f4f6", color: "#4b5563" },
  dark: { backgroundColor: "#1f2937", color: "#9ca3af" },
};

export const typeChipClass = (type: string) =>
  makeChipClass(typeChipColors[type] ?? typeChipDefault);
