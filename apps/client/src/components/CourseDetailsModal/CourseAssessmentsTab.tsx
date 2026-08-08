import AddIcon from "@mui/icons-material/Add";
import {
  Alert,
  Box,
  Button,
  Chip,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import type { CourseDetailsAssessment } from "../../api/courses";
import {
  formatDate,
  statusChipSx,
  statusLabel,
  submissionModeLabel,
} from "./courseDetailsUtils";

type NewAssignment = {
  title: string;
  dueDate: string;
  type: "assignment" | "homework" | "project" | "lab" | "report" | "practice";
};

type Props = {
  assessments: CourseDetailsAssessment[];
  isAddingAssignment: boolean;
  setIsAddingAssignment: (v: boolean) => void;
  newAssignment: NewAssignment;
  setNewAssignment: React.Dispatch<React.SetStateAction<NewAssignment>>;
  addAssignmentMutation: { isPending: boolean };
  handleSaveAssignment: () => void;
};

export const CourseAssessmentsTab = ({
  assessments,
  isAddingAssignment,
  setIsAddingAssignment,
  newAssignment,
  setNewAssignment,
  addAssignmentMutation,
  handleSaveAssignment,
}: Props) => (
  <>
    {assessments.length === 0 ? (
      <Alert severity="info">לא נמצאו מטלות או מבחנים עבור הקורס.</Alert>
    ) : (
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          overflow: "hidden",
          bgcolor: "background.paper",
        }}
      >
        <Box sx={{ overflowX: "auto" }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns:
                "minmax(190px, 1fr) 90px 70px 105px 105px 110px",
              gap: 1,
              px: 2,
              py: 1.2,
              bgcolor: "action.hover",
              borderBottom: "1px solid",
              borderColor: "divider",
              minWidth: 730,
            }}
          >
            {["שם", "סוג", "משקל", "תאריך", "הגשה", "סטטוס"].map((label) => (
              <Typography
                key={label}
                fontSize={12}
                color="text.secondary"
                fontWeight={500}
              >
                {label}
              </Typography>
            ))}
          </Box>

          {assessments.map((assessment) => (
            <Box
              key={assessment.id}
              sx={{
                display: "grid",
                gridTemplateColumns:
                  "minmax(190px, 1fr) 90px 70px 105px 105px 110px",
                gap: 1,
                alignItems: "center",
                px: 2,
                py: 1.35,
                minWidth: 730,
                borderBottom: "1px solid",
                borderColor: "divider",
                "&:last-of-type": { borderBottom: "none" },
                "&:hover": { bgcolor: "action.hover" },
              }}
            >
              <Box minWidth={0}>
                <Typography fontSize={13} fontWeight={500} noWrap>
                  {assessment.title}
                </Typography>
                {assessment.notes ? (
                  <Typography fontSize={11} color="text.secondary" noWrap>
                    {assessment.notes}
                  </Typography>
                ) : null}
              </Box>

              <Chip
                size="small"
                label={assessment.typeLabel}
                sx={{
                  width: "fit-content",
                  bgcolor: "var(--sb-chip-type-default-bg)",
                  color: "var(--sb-chip-type-default-text)",
                  fontWeight: 500,
                  fontSize: 11,
                  height: 22,
                }}
              />

              <Typography fontSize={13}>
                {assessment.weightPercent === null
                  ? "—"
                  : `${assessment.weightPercent}%`}
              </Typography>

              <Typography fontSize={12} color="text.secondary">
                {formatDate(assessment.dueDate)}
              </Typography>

              <Typography fontSize={12} color="text.secondary">
                {submissionModeLabel(assessment)}
              </Typography>

              <Chip
                size="small"
                label={statusLabel(assessment.status)}
                sx={{
                  width: "fit-content",
                  ...statusChipSx(assessment.status),
                  fontWeight: 500,
                  fontSize: 11,
                  height: 22,
                }}
              />
            </Box>
          ))}
        </Box>
      </Paper>
    )}

    {isAddingAssignment ? (
      <Box
        sx={{
          mt: 2,
          p: 2,
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Typography fontWeight={600} fontSize={13} mb={1.5}>
          הוספת מטלה
        </Typography>

        <Box display="flex" flexDirection="column" gap={1.5}>
          <Box>
            <Typography fontSize={12} color="text.secondary" mb={0.5}>
              שם המטלה
            </Typography>
            <TextField
              fullWidth
              size="small"
              value={newAssignment.title}
              onChange={(e) =>
                setNewAssignment((v) => ({ ...v, title: e.target.value }))
              }
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
            />
          </Box>

          <Box display="flex" gap={1.5}>
            <Box flex={1}>
              <Typography fontSize={12} color="text.secondary" mb={0.5}>
                תאריך הגשה
              </Typography>
              <TextField
                fullWidth
                size="small"
                type="date"
                value={newAssignment.dueDate}
                onChange={(e) =>
                  setNewAssignment((v) => ({ ...v, dueDate: e.target.value }))
                }
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
              />
            </Box>
            <Box flex={1}>
              <Typography fontSize={12} color="text.secondary" mb={0.5}>
                סוג
              </Typography>
              <Select
                fullWidth
                size="small"
                value={newAssignment.type}
                onChange={(e) =>
                  setNewAssignment((v) => ({
                    ...v,
                    type: e.target.value as typeof v.type,
                  }))
                }
                sx={{ borderRadius: 1.5 }}
              >
                <MenuItem value="assignment">מטלה</MenuItem>
                <MenuItem value="homework">שיעורי בית</MenuItem>
                <MenuItem value="project">פרויקט</MenuItem>
                <MenuItem value="lab">סדנאי</MenuItem>
                <MenuItem value="report">דוח</MenuItem>
                <MenuItem value="practice">תרגול</MenuItem>
              </Select>
            </Box>
          </Box>

          <Box display="flex" gap={1} justifyContent="flex-end">
            <Button size="small" onClick={() => setIsAddingAssignment(false)}>
              ביטול
            </Button>
            <Button
              size="small"
              variant="contained"
              onClick={handleSaveAssignment}
              disabled={
                addAssignmentMutation.isPending ||
                !newAssignment.title.trim() ||
                !newAssignment.dueDate
              }
              sx={{ bgcolor: "#22c55e", "&:hover": { bgcolor: "#16a34a" } }}
            >
              הוסף
            </Button>
          </Box>
        </Box>
      </Box>
    ) : (
      <Box
        display="flex"
        alignItems="center"
        gap={0.5}
        mt={1}
        sx={{ cursor: "pointer", color: "text.secondary" }}
        onClick={() => setIsAddingAssignment(true)}
      >
        <Typography fontSize={13}>הוסף מטלה</Typography>
        <AddIcon fontSize="small" />
      </Box>
    )}
  </>
);
