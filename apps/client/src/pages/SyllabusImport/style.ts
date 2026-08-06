import { css } from "@emotion/css";
import type { AssessmentKind } from "../../api/syllabi";

export const useStyles = () => ({
  page: css({
    minHeight: "100vh",
    background: "var(--mui-palette-background-default)",
    padding: 0,
  }),

  topBar: css({
    padding: "12px 24px",
    borderBottom: "1px solid var(--mui-palette-divider)",
    display: "flex",
    alignItems: "center",
    minHeight: "49px",
    background: "var(--mui-palette-background-default)",
    direction: "rtl",
  }),

  content: css({
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "24px",
    direction: "rtl",
    display: "grid",
    gap: "16px",

    "@media (max-width: 700px)": {
      padding: "16px",
    },
  }),

  pageIntro: css({
    borderRadius: "12px",
    border: "1px solid var(--mui-palette-divider)",
    padding: "16px 20px",
    background: "var(--mui-palette-background-paper)",
  }),

  introIcon: css({
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #a78bfa 0%, #60a5fa 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  }),

  greenButton: css({
    backgroundColor: "#22c55e !important",
    color: "#ffffff !important",
    borderRadius: "10px !important",
    boxShadow: "none !important",
    fontWeight: "600 !important",
    textTransform: "none !important",

    "&:hover": {
      backgroundColor: "#16a34a !important",
      boxShadow: "none !important",
    },

    "&.Mui-disabled": {
      backgroundColor: "var(--mui-palette-action-disabledBackground) !important",
      color: "var(--mui-palette-action-disabled) !important",
    },
  }),

  section: css({
    display: "block",
  }),

  sectionHeader: css({
    marginBottom: "16px",
  }),

  sectionTitle: css({
    fontWeight: "600 !important",
    fontSize: "15px !important",
  }),

  sectionSubtitle: css({
    color: "var(--mui-palette-text-secondary)",
    fontSize: "13px",
    lineHeight: 1.6,
    marginTop: "4px",
  }),

  card: css({
    background: "var(--mui-palette-background-paper)",
    border: "1px solid var(--mui-palette-divider)",
    borderRadius: "12px",
    padding: "16px",
    overflow: "hidden",
    boxShadow: "none",

    "& .MuiInputBase-input": {
      fontSize: "13px",
    },

    "& .MuiInputLabel-root": {
      fontSize: "13px",
    },
  }),

  cardContent: css({
    padding: 0,
  }),

  stepperCard: css({
  background: "var(--mui-palette-background-paper)",
  border: "1px solid var(--mui-palette-divider)",
  borderRadius: "12px",
  padding: "14px 18px",
  boxShadow: "none",
  overflow: "hidden",

  "& .MuiStepper-root": {
    direction: "rtl",
  },

  "& .MuiStepLabel-label": {
    fontSize: "12px",
  },

  "& .MuiStepIcon-root.Mui-active": {
    color: "#22c55e",
  },

  "& .MuiStepIcon-root.Mui-completed": {
    color: "#22c55e",
  },

  "& .MuiStepConnector-root.MuiStepConnector-alternativeLabel": {
    top: "12px",
    left: "calc(50% + 20px)",
    right: "calc(-50% + 20px)",
  },

  "& .MuiStepConnector-line": {
    borderColor: "var(--mui-palette-divider)",
  },

  "& .MuiStepConnector-root.Mui-active .MuiStepConnector-line, & .MuiStepConnector-root.Mui-completed .MuiStepConnector-line":
    {
      borderColor: "#22c55e",
    },
}),

  uploadCard: css({
    minHeight: "240px",
    background: "var(--mui-palette-background-paper)",
    border: "1px solid var(--mui-palette-divider)",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    padding: "28px",
    boxShadow: "none",
    transition: "border-color 0.18s ease, background-color 0.18s ease",
  }),

  uploadCardDragging: css({
    borderColor: "#22c55e",
    backgroundColor: "var(--mui-palette-action-hover)",
  }),

  uploadIcon: css({
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #a78bfa 0%, #60a5fa 100%)",
    display: "grid",
    placeItems: "center",
  }),

  infoCard: css({
    background: "var(--mui-palette-background-paper)",
    border: "1px solid var(--mui-palette-divider)",
    borderRadius: "12px",
    padding: "16px",
    boxShadow: "none",
  }),

  tablePaper: css({
    border: "1px solid var(--mui-palette-divider)",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "none",
    background: "var(--mui-palette-background-paper)",

    "& .MuiTableCell-root": {
      fontSize: "13px",
      borderColor: "var(--mui-palette-divider)",
    },

    "& .MuiTableCell-head": {
      fontSize: "12px",
      fontWeight: 400,
      color: "var(--mui-palette-text-secondary)",
    },
  }),

  tableHeadRow: css({
    backgroundColor: "var(--mui-palette-action-hover)",
  }),

  tableRow: css({
    transition: "background-color 0.18s ease",

    "&:hover": {
      backgroundColor: "var(--mui-palette-action-hover)",
    },
  }),

  stickyActions: css({
    position: "sticky",
    bottom: "12px",
    zIndex: 2,
    background: "var(--mui-palette-background-paper)",
    border: "1px solid var(--mui-palette-divider)",
    borderRadius: "12px",
    padding: "16px",
    boxShadow: "none",
  }),

  successCard: css({
    background: "var(--mui-palette-background-paper)",
    border: "1px solid var(--mui-palette-divider)",
    borderRadius: "12px",
    padding: "40px 24px",
    textAlign: "center",
    boxShadow: "none",
  }),

  addRow: css({
    display: "flex",
    alignItems: "center",
    gap: "4px",
    width: "fit-content",
    cursor: "pointer",
    color: "var(--mui-palette-text-secondary)",
    marginTop: "12px",
    transition: "color 0.18s ease",

    "&:hover": {
      color: "var(--mui-palette-primary-main)",
    },
  }),

  chipBase: css({
    fontWeight: 500,
  }),
});

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

const defaultTypeChip: ChipColors = {
  light: {
    backgroundColor: "var(--sb-chip-type-default-bg)",
    color: "var(--sb-chip-type-default-text)",
  },
  dark: {
    backgroundColor: "var(--sb-chip-type-default-bg)",
    color: "var(--sb-chip-type-default-text)",
  },
};

const projectChip: ChipColors = {
  light: {
    backgroundColor: "var(--sb-chip-type-project-bg)",
    color: "var(--sb-chip-type-project-text)",
  },
  dark: {
    backgroundColor: "var(--sb-chip-type-project-bg)",
    color: "var(--sb-chip-type-project-text)",
  },
};

const practiceChip: ChipColors = {
  light: {
    backgroundColor: "var(--sb-chip-type-practice-bg)",
    color: "var(--sb-chip-type-practice-text)",
  },
  dark: {
    backgroundColor: "var(--sb-chip-type-practice-bg)",
    color: "var(--sb-chip-type-practice-text)",
  },
};

const activeChip: ChipColors = {
  light: {
    backgroundColor: "var(--sb-chip-status-active-bg)",
    color: "var(--sb-chip-status-active-text)",
  },
  dark: {
    backgroundColor: "var(--sb-chip-status-active-bg)",
    color: "var(--sb-chip-status-active-text)",
  },
};

const doneChip: ChipColors = {
  light: {
    backgroundColor: "var(--sb-chip-status-done-bg)",
    color: "var(--sb-chip-status-done-text)",
  },
  dark: {
    backgroundColor: "var(--sb-chip-status-done-bg)",
    color: "var(--sb-chip-status-done-text)",
  },
};

const defaultStatusChip: ChipColors = {
  light: {
    backgroundColor: "var(--sb-chip-status-default-bg)",
    color: "var(--sb-chip-status-default-text)",
  },
  dark: {
    backgroundColor: "var(--sb-chip-status-default-bg)",
    color: "var(--sb-chip-status-default-text)",
  },
};

const assessmentChipColors: Record<AssessmentKind, ChipColors> = {
  assignment: defaultTypeChip,
  exam: practiceChip,
  project: projectChip,
  presentation: projectChip,
  participation: defaultTypeChip,
  lab: practiceChip,
  other: defaultTypeChip,
};

export const assessmentTypeChipClass = (kind: AssessmentKind) =>
  makeChipClass(assessmentChipColors[kind] ?? defaultTypeChip);

export const activeStatusChipClass = makeChipClass(activeChip);
export const doneStatusChipClass = makeChipClass(doneChip);
export const defaultStatusChipClass = makeChipClass(defaultStatusChip);