import { css } from "@emotion/css";

export const useStyles = () => ({
  page: css({
    minHeight: "100vh",
    padding: "32px 24px 48px",
    backgroundColor: "var(--mui-palette-background-default)",
  }),

  content: css({
    display: "grid",
    gap: "24px",
    maxWidth: "1200px",
    margin: "0 auto",
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

  summaryGrid: css({
    display: "grid",
    gap: "16px",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  }),

  summaryCard: css({
    padding: "20px",
    borderRadius: "18px",
    border: "1px solid var(--mui-palette-divider)",
    backgroundColor: "var(--mui-palette-background-paper)",
    display: "grid",
    gap: "8px",
  }),

  summaryLabel: css({
    color: "var(--mui-palette-text-secondary)",
  }),

  summaryValue: css({
    fontWeight: 700,
  }),

  tableCard: css({
    borderRadius: "18px",
    border: "1px solid var(--mui-palette-divider)",
    overflow: "hidden",
    backgroundColor: "var(--mui-palette-background-paper)",
  }),

  loaderBox: css({
    display: "flex",
    justifyContent: "center",
    padding: "32px 0",
  }),
});
