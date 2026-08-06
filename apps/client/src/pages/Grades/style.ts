import { css } from "@emotion/css";

export const useStyles = () => ({
  page: css({
    minHeight: "100vh",
    backgroundColor:
      "var(--mui-palette-background-default)",
  }),

  topBar: css({
    minHeight: "53px",
    padding: "12px 24px",
    borderBottom:
      "1px solid var(--mui-palette-divider)",
    display: "flex",
    alignItems: "center",
    direction: "rtl",
    backgroundColor:
      "var(--mui-palette-background-paper)",
  }),

  topBarTitle: css({
    fontWeight: 500,
    fontSize: "1rem",
    color: "var(--mui-palette-text-primary)",
  }),

  content: css({
    display: "grid",
    gap: "24px",
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "32px 24px 48px",
    direction: "rtl",
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
    gridTemplateColumns:
      "repeat(auto-fit, minmax(220px, 1fr))",
  }),

  summaryCard: css({
    padding: "20px",
    borderRadius: "18px",
    border: "1px solid var(--mui-palette-divider)",
    backgroundColor:
      "var(--mui-palette-background-paper)",
    display: "grid",
    gap: "8px",
    boxShadow: "none",
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
    backgroundColor:
      "var(--mui-palette-background-paper)",
    boxShadow: "none",
  }),

  courseSummaryRow: css({
    "& > td": {
      borderBottom: "none",
      paddingTop: "18px",
      paddingBottom: "18px",
    },
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

  semesterChip: css({
    borderRadius: "999px",
    height: "24px",
    backgroundColor:
      "var(--mui-palette-action-hover)",
    color: "var(--mui-palette-text-secondary)",
    borderColor: "var(--mui-palette-divider)",
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
    opacity: 0.65,
    transition:
      "opacity 0.18s ease, color 0.18s ease",

    "&:hover": {
      opacity: 1,
      color: "#16a34a",
    },
  }),

  inlineEditor: css({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",

    "& .MuiTextField-root": {
      width: "84px",
    },
  }),

  saveButton: css({
    minWidth: "54px",
    backgroundColor: "#22c55e",
    boxShadow: "none",

    "&:hover": {
      backgroundColor: "#16a34a",
      boxShadow: "none",
    },
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

  assessmentDetailRow: css({
    "& > td": {
      borderBottom:
        "1px solid var(--mui-palette-divider)",
    },
  }),

  assessmentDetailCell: css({
    padding: "0 18px 18px !important",
    backgroundColor:
      "var(--mui-palette-background-paper)",
  }),

  assessmentPanel: css({
    border:
      "1px solid var(--mui-palette-divider)",
    borderRadius: "14px",
    overflow: "hidden",
    backgroundColor:
      "var(--mui-palette-background-default)",
  }),

  assessmentPanelHeader: css({
    minHeight: "48px",
    padding: "10px 14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    flexWrap: "wrap",
    borderBottom:
      "1px solid var(--mui-palette-divider)",
    backgroundColor:
      "var(--mui-palette-action-hover)",
  }),

  assessmentTableContainer: css({
    backgroundColor:
      "var(--mui-palette-background-paper)",
  }),

  assessmentTableHead: css({
    backgroundColor:
      "var(--mui-palette-background-default)",
  }),

  assessmentRow: css({
    "&:last-of-type td": {
      borderBottom: "none",
    },
  }),

  typeChip: css({
    height: "22px",
    fontSize: "0.7rem",
    fontWeight: 600,
    backgroundColor: "rgba(59, 130, 246, 0.10)",
    color: "#2563eb",
  }),

  weightChip: css({
    height: "22px",
    fontSize: "0.7rem",
    fontWeight: 600,
    backgroundColor: "#f8dce8",
    color: "#8a4b65",
  }),

  weightSummaryChip: css({
    height: "22px",
    fontSize: "0.7rem",
    backgroundColor:
      "var(--mui-palette-background-paper)",
    color: "var(--mui-palette-text-secondary)",
    border:
      "1px solid var(--mui-palette-divider)",
  }),

  completedWeightChip: css({
    height: "22px",
    fontSize: "0.7rem",
    fontWeight: 600,
    backgroundColor: "rgba(34, 197, 94, 0.10)",
    color: "#15803d",
  }),

  noAssessments: css({
    padding: "22px",
    textAlign: "center",
    color: "var(--mui-palette-text-secondary)",
    fontSize: "0.84rem",
    backgroundColor:
      "var(--mui-palette-background-paper)",
  }),

  loaderBox: css({
    display: "flex",
    justifyContent: "center",
    padding: "32px 0",
  }),
});