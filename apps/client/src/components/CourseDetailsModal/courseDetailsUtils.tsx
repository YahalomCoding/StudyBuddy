import { Box, Paper, Typography } from "@mui/material";
import type { CourseDetailsAssessment } from "../../api/courses";

export const TabPanel = ({
  activeTab,
  index,
  children,
}: {
  activeTab: number;
  index: number;
  children: React.ReactNode;
}) => {
  if (activeTab !== index) return null;
  return <Box sx={{ pt: 2.5 }}>{children}</Box>;
};

export const InfoField = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <Box>
    <Typography fontSize={12} color="text.secondary" sx={{ mb: 0.35 }}>
      {label}
    </Typography>
    <Typography fontSize={14} fontWeight={500}>
      {value}
    </Typography>
  </Box>
);

export const ContentSection = ({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) => (
  <Paper
    elevation={0}
    sx={{
      borderRadius: 3,
      border: "1px solid",
      borderColor: "divider",
      p: 2,
      bgcolor: "background.paper",
    }}
  >
    <Box display="flex" alignItems="center" gap={1} mb={1.5}>
      {icon}
      <Typography fontSize={15} fontWeight={600}>
        {title}
      </Typography>
    </Box>
    {children}
  </Paper>
);

export const valueOrDash = (
  value: string | number | null | undefined
): string | number => {
  if (value === null || value === undefined || value === "") return "לא צוין";
  return value;
};

export const formatDate = (value: string | null): string => {
  if (!value) return "לא צוין";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("he-IL");
};

export const statusLabel = (
  status: CourseDetailsAssessment["status"]
): string => {
  switch (status) {
    case "done":
      return "בוצע";
    case "active":
      return "בתהליך";
    case "not started":
      return "לא התחיל";
    default:
      return "לא צוין";
  }
};

export const submissionModeLabel = (
  assessment: CourseDetailsAssessment
): string => {
  if (assessment.submissionMode === "individual") return "אישי";
  if (assessment.submissionMode === "group")
    return assessment.groupSize ? `${assessment.groupSize} סטודנטים` : "קבוצתי";
  return "לא צוין";
};

export const statusChipSx = (status: CourseDetailsAssessment["status"]) => {
  if (status === "done")
    return {
      bgcolor: "var(--sb-chip-status-done-bg)",
      color: "var(--sb-chip-status-done-text)",
    };
  if (status === "active")
    return {
      bgcolor: "var(--sb-chip-status-active-bg)",
      color: "var(--sb-chip-status-active-text)",
    };
  return {
    bgcolor: "var(--sb-chip-status-default-bg)",
    color: "var(--sb-chip-status-default-text)",
  };
};
