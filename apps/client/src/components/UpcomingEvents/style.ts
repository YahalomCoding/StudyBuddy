import { css } from "@emotion/css";

export const useStyles = () => {
  return {
    section: css({
      display: "grid",
      gap: "12px",
      direction: "rtl",
    }),

    sectionTitle: css({
      fontWeight: 600,
    }),

    paper: css({
      border: "1px solid var(--mui-palette-divider)",
      borderRadius: "18px",
      overflow: "hidden",
      boxShadow: "none",
      backgroundColor: "var(--mui-palette-background-paper)",
    }),

    content: css({
      display: "grid",
      gap: "0",
      backgroundColor: "var(--mui-palette-background-paper)",
    }),

    headerRow: css({
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "14px 18px",
      backgroundColor: "var(--mui-palette-action-hover)",
      borderBottom: "1px solid var(--mui-palette-divider)",
    }),

    pageIndicator: css({
      color: "var(--mui-palette-text-secondary)",
      fontWeight: 500,
      fontSize: "0.95rem",
    }),

    navActions: css({
      display: "flex",
      alignItems: "center",
      gap: "2px",
    }),

    navButton: css({
      color: "var(--mui-palette-text-secondary)",
    }),

    rows: css({
      display: "grid",
    }),

    row: css({
      minHeight: "72px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "12px",
      padding: "12px 18px",
      borderBottom: "1px solid var(--mui-palette-divider)",

      "&:hover": {
        backgroundColor: "var(--mui-palette-action-hover)",
      },

      "&:last-child": {
        borderBottom: "none",
      },
    }),

    rowEmpty: css({
      height: "72px",
      opacity: 0,
      pointerEvents: "none",
    }),

    rowMain: css({
      display: "flex",
      alignItems: "center",
      gap: "10px",
      minWidth: 0,
    }),

    iconWrap: css({
      width: "32px",
      height: "32px",
      borderRadius: "999px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    }),

    examIcon: css({
      backgroundColor: "var(--sb-chip-status-default-bg)",
      color: "var(--sb-chip-status-default-text)",
    }),

    assignmentIcon: css({
      backgroundColor: "var(--sb-chip-type-project-bg)",
      color: "var(--sb-chip-type-project-text)",
    }),

    textWrap: css({
      display: "grid",
      gap: "2px",
      minWidth: 0,
    }),

    courseTitle: css({
      fontWeight: 500,
    }),

    description: css({
      color: "var(--mui-palette-text-secondary)",
      fontSize: "0.92rem",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    }),

    metaWrap: css({
      display: "grid",
      gap: "2px",
      justifyItems: "end",
      flexShrink: 0,
    }),

    dateText: css({
      fontWeight: 500,
    }),

    semesterText: css({
      color: "var(--mui-palette-text-secondary)",
      fontSize: "0.9rem",
    }),
  };
};
