import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import {
  Box,
  Chip,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { Fragment } from "react";
import type {
  GradeAssessmentItem,
  GradesResponseItem,
} from "../../../api/grades";
import { useStyles } from "../style";
import { GradeEditor } from "./GradeEditor";

export type EditingAssessment = {
  courseId: string;
  assessment: GradeAssessmentItem;
  value: string;
} | null;

type CourseGradeRowsProps = {
  course: GradesResponseItem;
  editingAssessment: EditingAssessment;
  isSaving: boolean;
  onStartEdit: (courseId: string, assessment: GradeAssessmentItem) => void;
  onEditValueChange: (value: string) => void;
  onSave: () => void;
};

const formatSemester = (course: GradesResponseItem) => {
  if (course.semesterYearNumber === null || course.semesterNumber === null) {
    return null;
  }

  return `${course.semesterYearNumber} · סמסטר ${course.semesterNumber}`;
};

export const CourseGradeRows = ({
  course,
  editingAssessment,
  isSaving,
  onStartEdit,
  onEditValueChange,
  onSave,
}: CourseGradeRowsProps) => {
  const classes = useStyles();
  const semester = formatSemester(course);

  return (
    <Fragment>
      <TableRow hover className={classes.courseSummaryRow}>
        <TableCell>
          <Box className={classes.courseCell}>
            <Typography fontWeight={600}>{course.courseTitle}</Typography>

            <Chip
              label={`${course.credits} נ"ז`}
              size="small"
              variant="outlined"
              className={classes.creditChip}
            />

            {semester ? (
              <Chip
                label={semester}
                size="small"
                variant="outlined"
                className={classes.semesterChip}
              />
            ) : null}
          </Box>
        </TableCell>

        <TableCell align="center">
          {course.finalGrade !== null ? (
            <Chip
              label={`${course.finalGrade}`}
              size="small"
              sx={classes.finalGradeChip(course.finalGrade)}
            />
          ) : course.currentGrade !== null ? (
            <Stack spacing={0.35} alignItems="center">
              <Chip
                label={`${course.currentGrade}`}
                size="small"
                sx={classes.finalGradeChip(course.currentGrade)}
              />
              <Typography fontSize={10} color="text.secondary">
                נוכחי
              </Typography>
            </Stack>
          ) : (
            "—"
          )}
        </TableCell>
      </TableRow>

      <TableRow className={classes.assessmentDetailRow}>
        <TableCell colSpan={2} className={classes.assessmentDetailCell}>
          <Box className={classes.assessmentPanel}>
            <Box className={classes.assessmentPanelHeader}>
              <Typography fontWeight={600} fontSize={13}>
                רכיבי הציון בקורס
              </Typography>

              {course.totalWeightPercent > 0 ? (
                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                  <Chip
                    size="small"
                    label={`סה״כ ${course.totalWeightPercent}%`}
                    className={classes.weightSummaryChip}
                  />
                  <Chip
                    size="small"
                    label={`${course.completedWeightPercent}% עם ציון`}
                    className={classes.completedWeightChip}
                  />
                </Stack>
              ) : null}
            </Box>

            {course.assessments.length === 0 ? (
              <Typography className={classes.noAssessments}>
                לא נמצאו מטלות או מבחנים עבור הקורס.
              </Typography>
            ) : (
              <TableContainer className={classes.assessmentTableContainer}>
                <Table size="small">
                  <TableHead>
                    <TableRow className={classes.assessmentTableHead}>
                      <TableCell align="right">מטלה / מבחן</TableCell>
                      <TableCell align="center">סוג</TableCell>
                      <TableCell align="center">ציון</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {course.assessments.map((assessment) => {
                      const isEditing =
                        editingAssessment?.courseId === course.courseId &&
                        editingAssessment.assessment.id === assessment.id;

                      return (
                        <TableRow
                          key={assessment.id}
                          hover
                          className={classes.assessmentRow}
                        >
                          <TableCell align="right">
                            <Typography fontSize={13} fontWeight={500}>
                              {assessment.title}
                            </Typography>
                          </TableCell>

                          <TableCell align="center">
                            <Chip
                              size="small"
                              label={assessment.typeLabel}
                              className={classes.typeChip}
                            />
                          </TableCell>

                          <TableCell align="center">
                            {isEditing ? (
                              <GradeEditor
                                value={editingAssessment.value}
                                isSaving={isSaving}
                                onChange={onEditValueChange}
                                onSave={onSave}
                              />
                            ) : (
                              <Box className={classes.gradeCell}>
                                <Typography fontWeight={500}>
                                  {assessment.grade ?? "—"}
                                </Typography>
                                <IconButton
                                  size="small"
                                  className={classes.editButton}
                                  onClick={() =>
                                    onStartEdit(course.courseId, assessment)
                                  }
                                  aria-label={`עריכת ציון עבור ${assessment.title}`}
                                >
                                  <EditOutlinedIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        </TableCell>
      </TableRow>
    </Fragment>
  );
};
