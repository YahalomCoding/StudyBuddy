import { css } from "@emotion/css";

export const useStyles = () => ({
  page: css({
    padding: "32px 16px 48px",
    backgroundColor: "var(--mui-palette-background-default)",
    minHeight: "100vh",
  }),

  pageContent: css({
    display: "grid",
    gap: "24px",
  }),

  header: css({
    display: "grid",
    gap: "6px",
  }),

  title: css({
    fontWeight: 700,
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
    gap: "20px",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    "@media (max-width: 900px)": {
      gridTemplateColumns: "1fr",
    },
  }),

  column: css({
    minHeight: "420px",
    border: "1px solid var(--mui-palette-divider)",
    borderRadius: "24px",
    padding: "16px",
    backgroundColor: "var(--mui-palette-background-paper)",
  }),

  columnHeader: css({
    display: "grid",
    gap: "4px",
  }),

  columnTitle: css({
    fontWeight: 700,
  }),

  columnBody: css({
    display: "grid",
    gap: "12px",
  }),

  emptyState: css({
    border: "1px dashed var(--mui-palette-divider)",
    borderRadius: "16px",
    padding: "32px 16px",
    textAlign: "center",
    color: "var(--mui-palette-text-secondary)",
  }),

  assignmentCard: css({
    cursor: "grab",
    border: "1px solid var(--mui-palette-divider)",
    boxShadow: "none",
    backgroundColor: "var(--mui-palette-background-paper)",
    transition: "transform 0.2s ease",
    "&:hover": {
      transform: "translateY(-2px)",
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
    fontWeight: 700,
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
    fontWeight: 700,
    backgroundColor: "#f8d7e3",
    color: "#8b3f5d",
    border: "1px solid #efc2d4",
    borderRadius: 999,
    paddingLeft: "6px",
    paddingRight: "6px",
  }),

  statusChip: css({
    borderRadius: 999,
  }),
});
