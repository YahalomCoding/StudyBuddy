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

  courseCell: css({
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexWrap: "wrap",
  }),

  creditChip: css({
    borderRadius: "999px",
    height: "24px",
    backgroundColor: "#f8dce8",
    color: "#8a4b65",
    borderColor: "#e8b8cb",
  }),

  gradeCell: css({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
  }),

  editButton: css({
    color: "var(--mui-palette-text-secondary)",
    padding: "4px",
  }),

  inlineEditor: css({
    display: "flex",
    alignItems: "center",
    gap: "8px",
  }),

  finalGradeChip: (value: number | null) => ({
    backgroundColor:
      value === null
        ? "#f8e9f2"
        : value >= 85
          ? "#eaf8ea"
          : value >= 70
            ? "#f2f8e8"
            : value >= 60
              ? "#fff7e6"
              : "#fdeceb",
    color:
      value === null
        ? "#7d4a66"
        : value >= 85
          ? "#3f7d4f"
          : value >= 70
            ? "#6c7a3a"
            : value >= 60
              ? "#9a6b1d"
              : "#a2463b",
    border:
      value === null
        ? "1px solid #e9cfe0"
        : value >= 85
          ? "1px solid #cfe9d1"
          : value >= 70
            ? "1px solid #dfe8c3"
            : value >= 60
              ? "1px solid #f4dfb2"
              : "1px solid #f2c5bd",
    fontWeight: 600,
  }),

  loaderBox: css({
    display: "flex",
    justifyContent: "center",
    padding: "32px 0",
  }),
});
