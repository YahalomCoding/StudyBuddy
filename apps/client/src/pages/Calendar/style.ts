import { css } from "@emotion/css";

export const useStyles = () => {
  return {
    page: css({
      height: "100vh",
      minHeight: 0,
      overflow: "hidden",
      backgroundColor: "var(--mui-palette-background-default)",

      "@media (max-width: 1000px), (max-height: 680px)": {
        height: "auto",
        minHeight: "100vh",
        overflow: "auto",
      },
    }),

    topBar: css({
      minHeight: "53px",
      padding: "12px 24px",
      borderBottom: "1px solid var(--mui-palette-divider)",
      display: "flex",
      alignItems: "center",
      direction: "rtl",
      backgroundColor: "var(--mui-palette-background-paper)",
    }),

    topBarTitle: css({
      fontWeight: 500,
      fontSize: "1rem",
      color: "var(--mui-palette-text-primary)",
    }),

    content: css({
      width: "100%",
      maxWidth: "1100px",
      height: "calc(100vh - 53px)",
      minHeight: 0,
      boxSizing: "border-box",
      margin: "0 auto",
      padding: "16px 24px",
      direction: "rtl",
      display: "grid",
      gridTemplateRows: "auto minmax(0, 1fr)",
      gap: "12px",
      overflow: "hidden",

      "@media (max-width: 1000px), (max-height: 680px)": {
        height: "auto",
        minHeight: "calc(100vh - 53px)",
        overflow: "visible",
      },

      "@media (max-width: 700px)": {
        padding: "16px",
      },
    }),

    header: css({
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "12px",
      minHeight: 0,

      "@media (max-width: 900px)": {
        flexDirection: "column",
        alignItems: "stretch",
      },
    }),

    headerTitleArea: css({
      display: "flex",
      alignItems: "center",
      gap: "12px",
      minWidth: 0,
    }),

    headerIcon: css({
      width: "38px",
      height: "38px",
      borderRadius: "12px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      backgroundColor: "#22c55e",
      color: "#ffffff",
    }),

    title: css({
      fontWeight: 600,
      fontSize: "1.4rem",
      lineHeight: 1.25,
      letterSpacing: "-0.01em",

      "@media (max-width: 700px)": {
        fontSize: "1.3rem",
      },
    }),

    subtitle: css({
      marginTop: "3px",
      color: "var(--mui-palette-text-secondary)",
      fontSize: "0.85rem",
    }),

    monthActions: css({
      display: "flex",
      alignItems: "center",
      gap: "5px",
      padding: "6px",
      border: "1px solid var(--mui-palette-divider)",
      borderRadius: "12px",
      backgroundColor: "var(--mui-palette-background-paper)",
      flexWrap: "wrap",
      boxShadow: "none",

      "@media (max-width: 700px)": {
        justifyContent: "center",
      },
    }),

    importButton: css({
      minHeight: "36px",
      padding: "7px 13px",
      borderRadius: "10px",
      border: "none",
      fontWeight: 600,
      fontSize: "0.82rem",
      whiteSpace: "nowrap",
      direction: "rtl",
      gap: "8px",
      boxShadow: "none",
      backgroundColor: "#22c55e",
      color: "#ffffff",

      "& .MuiButton-startIcon": {
        margin: 0,
      },

      "&:hover": {
        backgroundColor: "#16a34a",
        boxShadow: "none",
      },

      "&.Mui-disabled": {
        backgroundColor: "var(--mui-palette-action-disabledBackground)",
        color: "var(--mui-palette-action-disabled)",
      },
    }),

    monthNavigationButton: css({
      width: "34px",
      height: "34px",
      border: "1px solid var(--mui-palette-divider)",
      borderRadius: "9px",
      color: "var(--mui-palette-text-secondary)",
      transition:
        "background-color 0.18s ease, color 0.18s ease, border-color 0.18s ease",

      "&:hover": {
        color: "#16a34a",
        borderColor: "#86efac",
        backgroundColor: "rgba(34, 197, 94, 0.08)",
      },
    }),

    monthTitle: css({
      minWidth: "145px",
      padding: "0 6px",
      textAlign: "center",
      color: "var(--mui-palette-text-primary)",
      fontWeight: 600,
      fontSize: "0.92rem",
    }),

    todayButton: css({
      minHeight: "34px",
      display: "flex",
      alignItems: "center",
      padding: "7px 14px",
      borderRadius: "9px",
      backgroundColor: "rgba(34, 197, 94, 0.10)",
      color: "#16a34a",
      fontWeight: 600,
      fontSize: "0.84rem",
      cursor: "pointer",
      userSelect: "none",
      transition:
        "background-color 0.18s ease, color 0.18s ease",

      "&:hover": {
        backgroundColor: "#22c55e",
        color: "#ffffff",
      },
    }),

    calendarLayout: css({
      height: "100%",
      minHeight: 0,
      display: "grid",
      gridTemplateColumns: "minmax(0, 1fr) 280px",
      gap: "12px",
      alignItems: "start",
      overflow: "hidden",

      "@media (max-width: 1000px), (max-height: 680px)": {
        height: "auto",
        overflow: "visible",
        gridTemplateColumns: "1fr",
      },
    }),

    calendarCard: css({
      height: "100%",
      minHeight: 0,
      border: "1px solid var(--mui-palette-divider)",
      borderRadius: "12px",
      overflow: "hidden",
      boxShadow: "none",
      backgroundColor: "var(--mui-palette-background-paper)",
      display: "grid",
      gridTemplateRows: "38px minmax(0, 1fr)",
    }),

    weekHeader: css({
      display: "grid",
      gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
      backgroundColor: "var(--mui-palette-action-hover)",
      borderBottom: "1px solid var(--mui-palette-divider)",
    }),

    weekDay: css({
      padding: "9px 6px",
      textAlign: "center",
      color: "var(--mui-palette-text-secondary)",
      fontWeight: 600,
      fontSize: "0.78rem",
    }),

    daysGrid: css({
      minHeight: 0,
      display: "grid",
      gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
      gridTemplateRows: "repeat(6, minmax(0, 1fr))",
      backgroundColor: "var(--mui-palette-background-paper)",
      overflow: "hidden",
    }),

    dayCell: css({
      minHeight: 0,
      height: "100%",
      padding: "6px",
      borderBottom: "1px solid var(--mui-palette-divider)",
      borderLeft: "1px solid var(--mui-palette-divider)",
      cursor: "pointer",
      display: "grid",
      alignContent: "start",
      gap: "7px",
      minWidth: 0,
      position: "relative",
      overflow: "hidden",
      transition:
        "background-color 0.18s ease, box-shadow 0.18s ease",

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
        backgroundColor: "rgba(34, 197, 94, 0.08)",
        boxShadow: "inset 0 0 0 1px rgba(34, 197, 94, 0.30)",
      },

      '&[data-today="true"] $dayNumber': {
        backgroundColor: "#22c55e",
        color: "#ffffff",
      },

      "@media (max-width: 1000px), (max-height: 680px)": {
        minHeight: "90px",
      },

      "@media (max-width: 700px)": {
        minHeight: "82px",
        padding: "5px",
      },
    }),

    dayNumberRow: css({
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "8px",
    }),

    dayNumber: css({
      width: "24px",
      height: "24px",
      borderRadius: "999px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: 600,
      fontSize: "0.82rem",
      transition: "background-color 0.18s ease, color 0.18s ease",
    }),

    todayNumber: css({
      backgroundColor: "#22c55e",
      color: "#ffffff",
    }),

    eventCount: css({
      minWidth: "20px",
      height: "20px",
      padding: "0 6px",
      borderRadius: "999px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(34, 197, 94, 0.10)",
      color: "#16a34a",
      fontSize: "0.7rem",
      fontWeight: 700,
      flexShrink: 0,
    }),

    dayEvents: css({
      display: "grid",
      gap: "3px",
      minWidth: 0,
      overflow: "hidden",
    }),

    assignmentEvent: css({
      minHeight: "20px",
      display: "flex",
      alignItems: "center",
      padding: "2px 6px",
      borderRadius: "7px",
      borderRight: "3px solid #3b82f6",
      backgroundColor: "rgba(59, 130, 246, 0.10)",
      color: "#2563eb",
      minWidth: 0,
    }),

    todoEvent: css({
      minHeight: "20px",
      display: "flex",
      alignItems: "center",
      padding: "2px 6px",
      borderRadius: "7px",
      borderRight: "3px solid #22c55e",
      backgroundColor: "rgba(34, 197, 94, 0.10)",
      color: "#15803d",
      minWidth: 0,
    }),

    eventText: css({
      fontSize: "0.67rem",
      fontWeight: 600,
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    }),

    moreEvents: css({
      color: "var(--mui-palette-text-secondary)",
      fontSize: "0.7rem",
      fontWeight: 500,
      paddingRight: "6px",
    }),

    sideCard: css({
      alignSelf: "start",
      height: "auto",
      minHeight: 0,
      maxHeight: "100%",
      border: "1px solid var(--mui-palette-divider)",
      borderRadius: "12px",
      overflow: "hidden",
      boxShadow: "none",
      backgroundColor: "var(--mui-palette-background-paper)",
      display: "grid",
    }),

    sideHeader: css({
      display: "flex",
      alignItems: "center",
      gap: "9px",
      padding: "10px 12px",
      backgroundColor: "var(--mui-palette-action-hover)",
      borderBottom: "1px solid var(--mui-palette-divider)",
    }),

    sideHeaderIcon: css({
      width: "36px",
      height: "36px",
      borderRadius: "10px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      backgroundColor: "#22c55e",
      color: "#ffffff",
    }),

    eventsList: css({
      minHeight: 0,
      display: "grid",
      alignContent: "start",
      backgroundColor: "var(--mui-palette-background-paper)",
      overflow: "visible",
    }),

    emptyState: css({
      minHeight: "170px",
      padding: "30px 18px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
      textAlign: "center",
      color: "var(--mui-palette-text-secondary)",
      fontSize: "0.84rem",
    }),

    emptyStateIcon: css({
      width: "42px",
      height: "42px",
      borderRadius: "12px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(34, 197, 94, 0.08)",
      color: "#16a34a",
    }),

    eventCard: css({
      minHeight: "62px",
      display: "grid",
      gap: "7px",
      padding: "9px 12px",
      borderBottom: "1px solid var(--mui-palette-divider)",
      transition: "background-color 0.18s ease",

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
      borderRadius: "9px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    }),

    assignmentIconBox: css({
      backgroundColor: "rgba(59, 130, 246, 0.10)",
      color: "#2563eb",
    }),

    todoIconBox: css({
      backgroundColor: "rgba(34, 197, 94, 0.10)",
      color: "#15803d",
    }),

    eventCardTitle: css({
      fontWeight: 600,
      fontSize: "0.88rem",
    }),

    eventChips: css({
      display: "flex",
      alignItems: "center",
      flexWrap: "wrap",
      gap: "6px",
      paddingRight: "42px",
    }),

    loadingCard: css({
      minHeight: "150px",
      border: "1px solid var(--mui-palette-divider)",
      borderRadius: "12px",
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