import { css } from "@emotion/css";

export const useStyles = () => {
  return {
    page: css({
      minHeight: "100vh",
      backgroundColor: "var(--mui-palette-background-default)",
      padding: "24px",
    }),

    content: css({
      maxWidth: "1180px",
      margin: "0 auto",
      direction: "rtl",
      display: "grid",
      gap: "18px",
    }),

    header: css({
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "16px",

      "@media (max-width: 800px)": {
        flexDirection: "column",
        alignItems: "stretch",
      },
    }),

    title: css({
      fontWeight: 600,
    }),

    monthActions: css({
      display: "flex",
      alignItems: "center",
      gap: "2px",
      padding: "8px 12px",
      border: "1px solid var(--mui-palette-divider)",
      borderRadius: "18px",
      backgroundColor: "var(--mui-palette-background-paper)",
    }),

    monthTitle: css({
      minWidth: "150px",
      textAlign: "center",
      color: "var(--mui-palette-text-secondary)",
      fontWeight: 500,
      fontSize: "0.95rem",
    }),

    todayButton: css({
      marginRight: "8px",
      padding: "6px 14px",
      borderRadius: "999px",
      backgroundColor: "var(--mui-palette-action-hover)",
      color: "var(--mui-palette-text-primary)",
      fontWeight: 500,
      fontSize: "0.9rem",
      cursor: "pointer",

      "&:hover": {
        backgroundColor: "var(--mui-palette-action-selected)",
      },
    }),

    calendarLayout: css({
      display: "grid",
      gridTemplateColumns: "minmax(0, 1fr) 340px",
      gap: "18px",
      alignItems: "start",

      "@media (max-width: 1000px)": {
        gridTemplateColumns: "1fr",
      },
    }),

    calendarCard: css({
      border: "1px solid var(--mui-palette-divider)",
      borderRadius: "18px",
      overflow: "hidden",
      boxShadow: "none",
      backgroundColor: "var(--mui-palette-background-paper)",
    }),

    weekHeader: css({
      display: "grid",
      gridTemplateColumns: "repeat(7, 1fr)",
      backgroundColor: "var(--mui-palette-action-hover)",
      borderBottom: "1px solid var(--mui-palette-divider)",
    }),

    weekDay: css({
      padding: "14px 8px",
      textAlign: "center",
      color: "var(--mui-palette-text-secondary)",
      fontWeight: 500,
      fontSize: "0.92rem",
    }),

    daysGrid: css({
      display: "grid",
      gridTemplateColumns: "repeat(7, 1fr)",
      backgroundColor: "var(--mui-palette-background-paper)",
    }),

    dayCell: css({
      minHeight: "118px",
      padding: "10px",
      borderBottom: "1px solid var(--mui-palette-divider)",
      borderLeft: "1px solid var(--mui-palette-divider)",
      cursor: "pointer",
      display: "grid",
      alignContent: "start",
      gap: "8px",

      "&:hover": {
        backgroundColor: "var(--mui-palette-action-hover)",
      },

      "&:nth-child(7n)": {
        borderLeft: "none",
      },

      '&[data-current-month="false"]': {
        opacity: 0.42,
        backgroundColor: "var(--mui-palette-action-hover)",
      },

      '&[data-selected="true"]': {
        backgroundColor: "var(--mui-palette-action-selected)",
      },

      '&[data-today="true"]': {
        boxShadow: "inset 0 0 0 2px var(--mui-palette-primary-main)",
      },
    }),

    dayNumberRow: css({
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    }),

    dayNumber: css({
      fontWeight: 500,
      fontSize: "0.92rem",
    }),

    eventCount: css({
      width: "22px",
      height: "22px",
      borderRadius: "999px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "var(--mui-palette-action-hover)",
      color: "var(--mui-palette-text-secondary)",
      fontSize: "0.78rem",
      fontWeight: 600,
    }),

    dayEvents: css({
      display: "grid",
      gap: "5px",
      minWidth: 0,
    }),

    assignmentEvent: css({
      minHeight: "26px",
      display: "flex",
      alignItems: "center",
      padding: "4px 8px",
      borderRadius: "999px",
      backgroundColor: "var(--sb-chip-type-project-bg)",
      color: "var(--sb-chip-type-project-text)",
    }),

    todoEvent: css({
      minHeight: "26px",
      display: "flex",
      alignItems: "center",
      padding: "4px 8px",
      borderRadius: "999px",
      backgroundColor: "var(--sb-chip-status-default-bg)",
      color: "var(--sb-chip-status-default-text)",
    }),

    eventText: css({
      fontSize: "0.78rem",
      fontWeight: 500,
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    }),

    moreEvents: css({
      color: "var(--mui-palette-text-secondary)",
      fontSize: "0.78rem",
      paddingRight: "6px",
    }),

    sideCard: css({
      border: "1px solid var(--mui-palette-divider)",
      borderRadius: "18px",
      overflow: "hidden",
      boxShadow: "none",
      backgroundColor: "var(--mui-palette-background-paper)",
      display: "grid",
    }),

    sideHeader: css({
      display: "flex",
      alignItems: "center",
      gap: "10px",
      padding: "14px 18px",
      backgroundColor: "var(--mui-palette-action-hover)",
      borderBottom: "1px solid var(--mui-palette-divider)",
    }),

    eventsList: css({
      display: "grid",
      backgroundColor: "var(--mui-palette-background-paper)",
    }),

    eventCard: css({
      minHeight: "72px",
      display: "grid",
      gap: "10px",
      padding: "12px 18px",
      borderBottom: "1px solid var(--mui-palette-divider)",

      "&:hover": {
        backgroundColor: "var(--mui-palette-action-hover)",
      },

      "&:last-child": {
        borderBottom: "none",
      },
    }),

    eventCardHeader: css({
      display: "flex",
      alignItems: "center",
      gap: "10px",
      minWidth: 0,
    }),

    eventIconBox: css({
      width: "32px",
      height: "32px",
      borderRadius: "999px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      backgroundColor: "var(--mui-palette-action-hover)",
      color: "var(--mui-palette-text-secondary)",
    }),

    eventCardTitle: css({
      fontWeight: 500,
      fontSize: "0.95rem",
    }),

    eventChips: css({
      display: "flex",
      alignItems: "center",
      flexWrap: "wrap",
      gap: "6px",
      paddingRight: "42px",
    }),

    loadingCard: css({
      border: "1px solid var(--mui-palette-divider)",
      borderRadius: "18px",
      padding: "32px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "12px",
      boxShadow: "none",
      backgroundColor: "var(--mui-palette-background-paper)",
    }),
  };
};