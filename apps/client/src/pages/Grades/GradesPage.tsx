import {
  Box,
  Card,
  Chip,
  CircularProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { getGrades } from "../../api/grades";
import { useStyles } from "./style";

type CourseGradeSummary = {
  courseId: string;
  courseTitle: string;
  credits: number;
  examGrade: number | null;
  assignmentGrade: number | null;
  finalGrade: number | null;
};

const roundGrade = (value: number | null) => {
  if (value === null) {
    return null;
  }

  return Math.round(value * 10) / 10;
};

const getGradeColor = (value: number | null) => {
  if (value === null) return "default";
  if (value >= 85) return "success";
  if (value >= 70) return "primary";
  if (value >= 60) return "warning";
  return "error";
};

export const GradesPage = () => {
  const classes = useStyles();
  const { data, isLoading } = useQuery({
    queryKey: ["grades"],
    queryFn: getGrades,
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
                    <TableCell>קורס</TableCell>
                    <TableCell align="center">מבחן</TableCell>
                    <TableCell align="center">מטלה</TableCell>
                    <TableCell align="center">ציון סופי</TableCell>
                    <TableCell align="center">נקודות זכות</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {courseSummaries.map((course) => (
                    <TableRow key={course.courseId} hover>
                      <TableCell>
                        <Typography fontWeight={600}>
                          {course.courseTitle}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        {course.examGrade !== null ? (
                          <Chip
                            label={`${course.examGrade}`}
                            color={getGradeColor(course.examGrade)}
                            size="small"
                          />
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell align="center">
                        {course.assignmentGrade !== null ? (
                          <Chip
                            label={`${course.assignmentGrade}`}
                            color={getGradeColor(course.assignmentGrade)}
                            size="small"
                          />
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell align="center">
                        {course.finalGrade !== null ? (
                          <Chip
                            label={`${course.finalGrade}`}
                            color={getGradeColor(course.finalGrade)}
                            size="small"
                          />
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell align="center">{course.credits}</TableCell>
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
