import { css } from "@emotion/css";

export const useStyles = () => ({
  page: css({
    minHeight: "100vh",
    backgroundColor: "var(--mui-palette-background-default)",
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

  pageContent: css({
    width: "100%",
    maxWidth: "1100px",
    boxSizing: "border-box",
    margin: "0 auto",
    padding: "24px",
    direction: "rtl",
    display: "grid",
    gap: "24px",
  }),

  header: css({
    display: "grid",
    gap: "6px",
  }),

  title: css({
    fontWeight: 600,
    letterSpacing: "-0.01em",
  }),

  subtitle: css({
    color: "var(--mui-palette-text-secondary)",
  }),

  loaderBox: css({
    display: "flex",
    justifyContent: "center",
    padding: "32px 0",
  }),

  boardGrid: css({
    display: "grid",
    gap: "16px",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    "@media (max-width: 900px)": {
      gridTemplateColumns: "1fr",
    },
  }),

  column: css({
    minHeight: "420px",
    border: "1px solid var(--mui-palette-divider)",
    borderRadius: "12px",
    padding: "16px",
    backgroundColor: "var(--mui-palette-background-paper)",
  }),

  columnHeader: css({
    display: "grid",
    gap: "4px",
  }),

  columnTitle: css({
    fontWeight: 600,
  }),

  columnBody: css({
    display: "grid",
    gap: "12px",
  }),

  emptyState: css({
    border: "1px dashed var(--mui-palette-divider)",
    borderRadius: "12px",
    padding: "32px 16px",
    textAlign: "center",
    color: "var(--mui-palette-text-secondary)",
  }),

  assignmentCard: css({
    cursor: "grab",
    border: "1px solid var(--mui-palette-divider)",
    borderRadius: "12px",
    boxShadow: "none",
    backgroundColor: "var(--mui-palette-background-paper)",
    transition: "transform 0.18s ease, border-color 0.18s ease",
    "&:hover": {
      transform: "translateY(-2px)",
      borderColor: "rgba(34, 197, 94, 0.45)",
    },
  }),

  cardContent: css({
    padding: "16px",
    paddingBottom: "16px !important",
  }),

  cardInner: css({
    display: "grid",
    gap: "12px",
  }),

  assignmentTitle: css({
    fontWeight: 600,
  }),

  assignmentCourse: css({
    color: "var(--mui-palette-text-secondary)",
  }),

  chipRow: css({
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "8px",
  }),

  metaRow: css({
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "8px",
  }),

  dueDateText: css({
    color: "var(--mui-palette-text-secondary)",
  }),

  daysLabel: css({
    fontWeight: 700,
  }),

  typeChip: css({
    fontWeight: 600,
    backgroundColor: "rgba(59, 130, 246, 0.10)",
    color: "#2563eb",
    borderRadius: 999,
    paddingLeft: "6px",
    paddingRight: "6px",
  }),

  statusChip: css({
    borderRadius: 999,
  }),
});
