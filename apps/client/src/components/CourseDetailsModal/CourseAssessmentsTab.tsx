import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import {
  Alert,
  Box,
  Button,
  Chip,
  IconButton,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
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

type EditingAssessment = {
  id: string;
  title: string;
  dueDate: string;
  status: "not started" | "active" | "done";
  type: "assignment" | "homework" | "project" | "lab" | "report" | "practice";
  kind: string;
} | null;

type Props = {
  assessments: CourseDetailsAssessment[];
  isAddingAssignment: boolean;
  setIsAddingAssignment: (v: boolean) => void;
  newAssignment: NewAssignment;
  setNewAssignment: React.Dispatch<React.SetStateAction<NewAssignment>>;
  addAssignmentMutation: { isPending: boolean };
  handleSaveAssignment: () => void;
  editingAssessment: EditingAssessment;
  setEditingAssessment: React.Dispatch<React.SetStateAction<EditingAssessment>>;
  updateAssignmentMutation: {
    isPending: boolean;
    mutate: (args: {
      id: string;
      payload: {
        title?: string;
        dueDate?: string;
        status?: "not started" | "active" | "done";
        type?:
          "assignment" | "homework" | "practice" | "project" | "report" | "lab";
      };
    }) => void;
  };
  updateExamMutation: {
    isPending: boolean;
    mutate: (args: {
      id: string;
      payload: { date?: string; type?: number };
    }) => void;
  };
};

export const CourseAssessmentsTab = ({
  assessments,
  isAddingAssignment,
  setIsAddingAssignment,
  newAssignment,
  setNewAssignment,
  addAssignmentMutation,
  handleSaveAssignment,
  editingAssessment,
  setEditingAssessment,
  updateAssignmentMutation,
  updateExamMutation,
}: Props) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
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
                  "minmax(190px, 1fr) 90px 70px 105px 105px 110px 36px",
                gap: 1,
                px: 2,
                py: 1.2,
                bgcolor: "action.hover",
                borderBottom: "1px solid",
                borderColor: "divider",
                minWidth: 760,
              }}
            >
              {["שם", "סוג", "משקל", "תאריך", "הגשה", "סטטוס", ""].map(
                (label) => (
                  <Typography
                    key={label}
                    fontSize={12}
                    color="text.secondary"
                    fontWeight={500}
                  >
                    {label}
                  </Typography>
                )
              )}
            </Box>

            {assessments.map((assessment) => (
              <Box
                key={assessment.id}
                onMouseEnter={() => setHoveredId(assessment.id)}
                onMouseLeave={() =>
                  setHoveredId((p) => (p === assessment.id ? null : p))
                }
                sx={{
                  display: "grid",
                  gridTemplateColumns:
                    "minmax(190px, 1fr) 90px 70px 105px 105px 110px 36px",
                  gap: 1,
                  alignItems: "center",
                  px: 2,
                  py: 1.35,
                  minWidth: 760,
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  "&:last-of-type": { borderBottom: "none" },
                  transition: "background-color 0.15s ease",
                  ...(hoveredId === assessment.id && {
                    bgcolor: "action.hover",
                  }),
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

                <Box display="flex" justifyContent="center">
                  {assessment.databaseId && hoveredId === assessment.id && (
                    <IconButton
                      size="small"
                      sx={{ p: 0.4, color: "text.secondary" }}
                      onClick={() =>
                        setEditingAssessment({
                          id: assessment.databaseId!,
                          title: assessment.title,
                          dueDate: assessment.dueDate ?? "",
                          status: assessment.status ?? "not started",
                          type: "assignment",
                          kind: assessment.kind,
                        })
                      }
                    >
                      <EditOutlinedIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  )}
                </Box>
              </Box>
            ))}
          </Box>
        </Paper>
      )}

      {editingAssessment && (
        <Box
          sx={{
            mt: 2,
            p: 2,
            borderRadius: 2,
            border: "1px solid",
            borderColor: "primary.main",
            bgcolor: "background.paper",
          }}
        >
          <Typography fontWeight={600} fontSize={13} mb={1.5}>
            {editingAssessment.kind === "exam" ? "עריכת מבחן" : "עריכת מטלה"}
          </Typography>

          <Box display="flex" flexDirection="column" gap={1.5}>
            {editingAssessment.kind !== "exam" && (
              <Box>
                <Typography fontSize={12} color="text.secondary" mb={0.5}>
                  שם המטלה
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={editingAssessment.title}
                  onChange={(e) =>
                    setEditingAssessment((v) =>
                      v ? { ...v, title: e.target.value } : v
                    )
                  }
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
                />
              </Box>
            )}

            <Box display="flex" gap={1.5}>
              <Box flex={1}>
                <Typography fontSize={12} color="text.secondary" mb={0.5}>
                  תאריך
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  value={editingAssessment.dueDate}
                  onChange={(e) =>
                    setEditingAssessment((v) =>
                      v ? { ...v, dueDate: e.target.value } : v
                    )
                  }
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
                />
              </Box>

              {editingAssessment.kind === "exam" ? (
                <Box flex={1}>
                  <Typography fontSize={12} color="text.secondary" mb={0.5}>
                    סוג
                  </Typography>
                  <Select
                    fullWidth
                    size="small"
                    value={editingAssessment.title}
                    onChange={(e) =>
                      setEditingAssessment((v) =>
                        v ? { ...v, title: e.target.value } : v
                      )
                    }
                    sx={{ borderRadius: 1.5 }}
                  >
                    <MenuItem value="מועד א'">מועד א'</MenuItem>
                    <MenuItem value="מועד ב'">מועד ב'</MenuItem>
                  </Select>
                </Box>
              ) : (
                <>
                  <Box flex={1}>
                    <Typography fontSize={12} color="text.secondary" mb={0.5}>
                      סטטוס
                    </Typography>
                    <Select
                      fullWidth
                      size="small"
                      value={editingAssessment.status}
                      onChange={(e) =>
                        setEditingAssessment((v) =>
                          v
                            ? {
                                ...v,
                                status: e.target.value as typeof v.status,
                              }
                            : v
                        )
                      }
                      sx={{ borderRadius: 1.5 }}
                    >
                      <MenuItem value="not started">לא התחיל</MenuItem>
                      <MenuItem value="active">בתהליך</MenuItem>
                      <MenuItem value="done">בוצע</MenuItem>
                    </Select>
                  </Box>
                  <Box flex={1}>
                    <Typography fontSize={12} color="text.secondary" mb={0.5}>
                      סוג
                    </Typography>
                    <Select
                      fullWidth
                      size="small"
                      value={editingAssessment.type}
                      onChange={(e) =>
                        setEditingAssessment((v) =>
                          v
                            ? { ...v, type: e.target.value as typeof v.type }
                            : v
                        )
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
                </>
              )}
            </Box>

            <Box display="flex" gap={1} justifyContent="flex-end">
              <Button size="small" onClick={() => setEditingAssessment(null)}>
                ביטול
              </Button>
              <Button
                size="small"
                variant="contained"
                onClick={() => {
                  if (editingAssessment.kind === "exam") {
                    updateExamMutation.mutate({
                      id: editingAssessment.id,
                      payload: { date: editingAssessment.dueDate || undefined },
                    });
                  } else {
                    updateAssignmentMutation.mutate({
                      id: editingAssessment.id,
                      payload: {
                        title: editingAssessment.title.trim(),
                        dueDate: editingAssessment.dueDate || undefined,
                        status: editingAssessment.status,
                        type: editingAssessment.type,
                      },
                    });
                  }
                }}
                disabled={
                  updateAssignmentMutation.isPending ||
                  updateExamMutation.isPending ||
                  (editingAssessment.kind !== "exam" &&
                    !editingAssessment.title.trim())
                }
                sx={{ bgcolor: "#22c55e", "&:hover": { bgcolor: "#16a34a" } }}
              >
                שמור
              </Button>
            </Box>
          </Box>
        </Box>
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
};
