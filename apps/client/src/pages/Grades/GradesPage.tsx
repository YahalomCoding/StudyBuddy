import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import {
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  getGrades,
  updateCourseGrades,
  type UpdateCourseGradesPayload,
} from "../../api/grades";
import { useStyles } from "./style";

type CourseGradeSummary = {
  courseId: string;
  courseTitle: string;
  credits: number;
  examGrade: number | null;
  assignmentGrade: number | null;
  finalGrade: number | null;
  examId?: string | null;
  assignmentId?: string | null;
};

const roundGrade = (value: number | null) => {
  if (value === null) {
    return null;
  }

  return Math.round(value * 10) / 10;
};

export const GradesPage = () => {
  const classes = useStyles();
  const queryClient = useQueryClient();
  const [editingCell, setEditingCell] = useState<{
    courseId: string;
    type: "exam" | "assignment";
    value: string;
    gradeId?: string | null;
  } | null>(null);
  const { data, isLoading } = useQuery({
    queryKey: ["grades"],
    queryFn: getGrades,
  });

  const updateGradeMutation = useMutation({
    mutationFn: ({
      courseId,
      payload,
    }: {
      courseId: string;
      payload: UpdateCourseGradesPayload;
    }) => updateCourseGrades(courseId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["grades"] });
      setEditingCell(null);
    },
  });

  const courseSummaries = useMemo<CourseGradeSummary[]>(() => {
    return (data ?? [])
      .map((course: CourseGradeSummary) => ({
        courseId: course.courseId,
        courseTitle: course.courseTitle,
        credits: course.credits,
        examGrade: roundGrade(course.examGrade),
        assignmentGrade: roundGrade(course.assignmentGrade),
        finalGrade: roundGrade(course.finalGrade),
        examId: course.examId ?? null,
        assignmentId: course.assignmentId ?? null,
      }))
      .sort((left: CourseGradeSummary, right: CourseGradeSummary) => {
        const leftFinal = left.finalGrade ?? -1;
        const rightFinal = right.finalGrade ?? -1;
        return rightFinal - leftFinal;
      });
  }, [data]);

  const overallAverage = (() => {
    const validCourses = courseSummaries.filter(
      (course) => course.finalGrade !== null
    );

    if (validCourses.length === 0) {
      return null;
    }

    const totalCredits = validCourses.reduce(
      (sum, course) => sum + course.credits,
      0
    );
    const weightedTotal = validCourses.reduce(
      (sum, course) => sum + (course.finalGrade ?? 0) * course.credits,
      0
    );

    return roundGrade(weightedTotal / totalCredits);
  })();

  const totalCredits = courseSummaries.reduce(
    (sum, course) => sum + course.credits,
    0
  );

  const handleStartEdit = (
    course: CourseGradeSummary,
    type: "exam" | "assignment"
  ) => {
    setEditingCell({
      courseId: course.courseId,
      type,
      value:
        type === "exam"
          ? (course.examGrade?.toString() ?? "")
          : (course.assignmentGrade?.toString() ?? ""),
      gradeId:
        type === "exam"
          ? (course.examId ?? null)
          : (course.assignmentId ?? null),
    });
  };

  const handleSave = () => {
    if (!editingCell) {
      return;
    }

    const trimmedValue = editingCell.value.trim();
    const parsedValue = trimmedValue === "" ? null : Number(trimmedValue);

    if (
      parsedValue !== null &&
      (!Number.isFinite(parsedValue) || parsedValue < 0 || parsedValue > 100)
    ) {
      return;
    }

    updateGradeMutation.mutate({
      courseId: editingCell.courseId,
      payload:
        editingCell.type === "exam"
          ? { examGrade: parsedValue, examId: editingCell.gradeId ?? null }
          : {
              assignmentGrade: parsedValue,
              assignmentId: editingCell.gradeId ?? null,
            },
    });
  };

  return (
    <Box className={classes.page}>
      <Box className={classes.content}>
        <Stack spacing={1.5} className={classes.header}>
          <Typography variant="h4" className={classes.title}>
            הציונים שלי
          </Typography>
          <Typography variant="body1" className={classes.subtitle}>
            סקירה של הציונים למבחנים, משימות וציון סופי לכל קורס
          </Typography>
        </Stack>

        <Box className={classes.summaryGrid}>
          <Card className={classes.summaryCard}>
            <Typography variant="body2" className={classes.summaryLabel}>
              ממוצע כולל
            </Typography>
            <Typography variant="h4" className={classes.summaryValue}>
              {overallAverage ?? "—"}
            </Typography>
          </Card>
          <Card className={classes.summaryCard}>
            <Typography variant="body2" className={classes.summaryLabel}>
              סה"כ נקודות זכות
            </Typography>
            <Typography variant="h4" className={classes.summaryValue}>
              {totalCredits}
            </Typography>
          </Card>
        </Box>

        <Card className={classes.tableCard}>
          {isLoading ? (
            <Box className={classes.loaderBox}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell align="right">קורס</TableCell>
                    <TableCell align="center">מבחן</TableCell>
                    <TableCell align="center">מטלה</TableCell>
                    <TableCell align="center">ציון סופי</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {courseSummaries.map((course) => (
                    <TableRow key={course.courseId} hover>
                      <TableCell>
                        <Box className={classes.courseCell}>
                          <Typography fontWeight={600}>
                            {course.courseTitle}
                          </Typography>
                          <Chip
                            label={`${course.credits} נ"ז`}
                            size="small"
                            variant="outlined"
                            className={classes.creditChip}
                          />
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Box className={classes.gradeCell}>
                          {editingCell?.courseId === course.courseId &&
                          editingCell?.type === "exam" ? (
                            <Box className={classes.inlineEditor}>
                              <TextField
                                value={editingCell.value}
                                onChange={(event) =>
                                  setEditingCell((current) =>
                                    current
                                      ? {
                                          ...current,
                                          value: event.target.value,
                                        }
                                      : current
                                  )
                                }
                                size="small"
                                type="number"
                                inputProps={{ min: 0, max: 100, step: 0.1 }}
                              />
                              <Button
                                size="small"
                                variant="contained"
                                onClick={handleSave}
                                disabled={updateGradeMutation.isPending}
                              >
                                {updateGradeMutation.isPending ? "…" : "שמור"}
                              </Button>
                            </Box>
                          ) : (
                            <>
                              {course.examGrade !== null ? (
                                <Typography>{course.examGrade}</Typography>
                              ) : (
                                <Typography color="text.secondary">
                                  —
                                </Typography>
                              )}
                              <IconButton
                                size="small"
                                className={classes.editButton}
                                onClick={() => handleStartEdit(course, "exam")}
                              >
                                <EditOutlinedIcon fontSize="small" />
                              </IconButton>
                            </>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Box className={classes.gradeCell}>
                          {editingCell?.courseId === course.courseId &&
                          editingCell?.type === "assignment" ? (
                            <Box className={classes.inlineEditor}>
                              <TextField
                                value={editingCell.value}
                                onChange={(event) =>
                                  setEditingCell((current) =>
                                    current
                                      ? {
                                          ...current,
                                          value: event.target.value,
                                        }
                                      : current
                                  )
                                }
                                size="small"
                                type="number"
                                inputProps={{ min: 0, max: 100, step: 0.1 }}
                              />
                              <Button
                                size="small"
                                variant="contained"
                                onClick={handleSave}
                                disabled={updateGradeMutation.isPending}
                              >
                                {updateGradeMutation.isPending ? "…" : "שמור"}
                              </Button>
                            </Box>
                          ) : (
                            <>
                              {course.assignmentGrade !== null ? (
                                <Typography>
                                  {course.assignmentGrade}
                                </Typography>
                              ) : (
                                <Typography color="text.secondary">
                                  —
                                </Typography>
                              )}
                              <IconButton
                                size="small"
                                className={classes.editButton}
                                onClick={() =>
                                  handleStartEdit(course, "assignment")
                                }
                              >
                                <EditOutlinedIcon fontSize="small" />
                              </IconButton>
                            </>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        {course.finalGrade !== null ? (
                          <Chip
                            label={`${course.finalGrade}`}
                            size="small"
                            sx={classes.finalGradeChip(course.finalGrade)}
                          />
                        ) : (
                          "—"
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Card>
      </Box>
    </Box>
  );
};
