import { css } from "@emotion/css";
import type { AssignmentType, ItemStatus } from "@studybuddy/types";

export const useStyles = () => {
  return {
    page: css({
      minHeight: "100vh",
      background:
        "radial-gradient(circle at 80% 0%, var(--sb-home-bg-start) 0%, var(--sb-home-bg-mid) 45%, var(--sb-home-bg-end) 100%)",
      paddingTop: "48px",
      paddingBottom: "48px",
      paddingLeft: "40px",
      paddingRight: "40px",
    }),
    content: css({
      maxWidth: "1180px",
      margin: "0 auto",
      direction: "rtl",
      display: "grid",
      gap: "24px",
    }),
    header: css({
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    }),
    title: css({
      fontWeight: 600,
      letterSpacing: "-0.01em",
    }),
    dashboardGrid: css({
      display: "grid",
      gridTemplateColumns: "1.45fr 1fr",
      gridTemplateAreas: `
        "todo upcoming"
        "assignments courses"
      `,
      gap: "24px",
      alignItems: "start",

      "@media (max-width: 1000px)": {
        gridTemplateColumns: "1fr",
        gridTemplateAreas: `
          "todo"
          "upcoming"
          "assignments"
          "courses"
        `,
      },
    }),
    todoArea: css({
      gridArea: "todo",
      height: "100%",
    }),
    upcomingArea: css({
      gridArea: "upcoming",
    }),
    assignmentsArea: css({
      gridArea: "assignments",
    }),
    coursesArea: css({
      gridArea: "courses",
    }),
    section: css({
      display: "grid",
      gap: "12px",
      height: "100%",
    }),
    sectionTitle: css({
      fontWeight: 600,
    }),
    card: css({
      background: "var(--mui-palette-background-paper)",
      border: "1px solid var(--mui-palette-divider)",
      borderRadius: "18px",
      overflow: "hidden",
      boxShadow: "0 8px 30px rgba(15, 23, 42, 0.06)",
    }),
    tablePaper: css({
      border: "1px solid var(--mui-palette-divider)",
      borderRadius: "18px",
      overflow: "hidden",
      boxShadow: "0 8px 30px rgba(15, 23, 42, 0.06)",
      background: "var(--mui-palette-background-paper)",
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
      backgroundColor: "var(--sb-home-overdue-row-bg)",
      borderLeft: "3px solid var(--sb-home-overdue-row-border)",
    }),
    overdueDaysCell: css({
      color: "var(--sb-home-overdue-text)",
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

const statusChipColors: Record<ItemStatus, ChipColors> = {
  done: {
    light: {
      backgroundColor: "var(--sb-chip-status-done-bg)",
      color: "var(--sb-chip-status-done-text)",
    },
    dark: {
      backgroundColor: "var(--sb-chip-status-done-bg)",
      color: "var(--sb-chip-status-done-text)",
    },
  },
  active: {
    light: {
      backgroundColor: "var(--sb-chip-status-active-bg)",
      color: "var(--sb-chip-status-active-text)",
    },
    dark: {
      backgroundColor: "var(--sb-chip-status-active-bg)",
      color: "var(--sb-chip-status-active-text)",
    },
  },
  "not started": {
    light: {
      backgroundColor: "var(--sb-chip-status-default-bg)",
      color: "var(--sb-chip-status-default-text)",
    },
    dark: {
      backgroundColor: "var(--sb-chip-status-default-bg)",
      color: "var(--sb-chip-status-default-text)",
    },
  },
};

export const statusChipClass = (status: ItemStatus) =>
  makeChipClass(statusChipColors[status]);

const typeChipDefault: ChipColors = {
  light: {
    backgroundColor: "var(--sb-chip-type-default-bg)",
    color: "var(--sb-chip-type-default-text)",
  },
  dark: {
    backgroundColor: "var(--sb-chip-type-default-bg)",
    color: "var(--sb-chip-type-default-text)",
  },
};

const typeChipColors: Record<AssignmentType, ChipColors> = {
  assignment: typeChipDefault,
  project: {
    light: {
      backgroundColor: "var(--sb-chip-type-project-bg)",
      color: "var(--sb-chip-type-project-text)",
    },
    dark: {
      backgroundColor: "var(--sb-chip-type-project-bg)",
      color: "var(--sb-chip-type-project-text)",
    },
  },
  practice: {
    light: {
      backgroundColor: "var(--sb-chip-type-practice-bg)",
      color: "var(--sb-chip-type-practice-text)",
    },
    dark: {
      backgroundColor: "var(--sb-chip-type-practice-bg)",
      color: "var(--sb-chip-type-practice-text)",
    },
  },
  homework: {
    light: {
      backgroundColor: "var(--sb-chip-type-default-bg)",
      color: "var(--sb-chip-type-default-text)",
    },
    dark: {
      backgroundColor: "var(--sb-chip-type-default-bg)",
      color: "var(--sb-chip-type-default-text)",
    },
  },
  report: {
    light: {
      backgroundColor: "var(--sb-chip-type-default-bg)",
      color: "var(--sb-chip-type-default-text)",
    },
    dark: {
      backgroundColor: "var(--sb-chip-type-default-bg)",
      color: "var(--sb-chip-type-default-text)",
    },
  },
  lab: typeChipDefault,
};

export const typeChipClass = (type: AssignmentType) =>
  makeChipClass(typeChipColors[type] ?? typeChipDefault);
