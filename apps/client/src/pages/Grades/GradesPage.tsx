import { Box, Stack, Typography } from "@mui/material";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useMemo } from "react";
import {
  getGrades,
  gradesQueryKey,
  updateCourseGrades,
  type GradeAssessmentItem,
  type GradesResponseItem,
  type UpdateCourseGradesPayload,
} from "../../api/grades";
import { homeDashboardQueryKey } from "../../api/home";
import { GradesSummary } from "./components/GradesSummary";
import { GradesTable } from "./components/GradesTable";
import { useStyles } from "./style";

const roundGrade = (value: number | null) => {
  if (value === null) {
    return null;
  }

  return Math.round(value * 10) / 10;
};

const sortCourses = (courses: GradesResponseItem[]) =>
  [...courses]
    .map((course) => ({
      ...course,
      finalGrade: roundGrade(course.finalGrade),
      currentGrade: roundGrade(course.currentGrade),
    }))
    .sort((left, right) => {
      const leftYear =
        left.semesterYearNumber ?? Number.MAX_SAFE_INTEGER;
      const rightYear =
        right.semesterYearNumber ?? Number.MAX_SAFE_INTEGER;

      if (leftYear !== rightYear) {
        return leftYear - rightYear;
      }

      const leftSemester =
        left.semesterNumber ?? Number.MAX_SAFE_INTEGER;
      const rightSemester =
        right.semesterNumber ?? Number.MAX_SAFE_INTEGER;

      if (leftSemester !== rightSemester) {
        return leftSemester - rightSemester;
      }

      return left.courseTitle.localeCompare(
        right.courseTitle,
        "he",
      );
    });

const calculateOverallAverage = (
  courses: GradesResponseItem[],
) => {
  const gradedCourses = courses.filter(
    (course) => course.finalGrade !== null,
  );

  if (gradedCourses.length === 0) {
    return null;
  }

  const credits = gradedCourses.reduce(
    (sum, course) => sum + course.credits,
    0,
  );

  if (credits === 0) {
    return roundGrade(
      gradedCourses.reduce(
        (sum, course) => sum + (course.finalGrade ?? 0),
        0,
      ) / gradedCourses.length,
    );
  }

  const weightedTotal = gradedCourses.reduce(
    (sum, course) =>
      sum + (course.finalGrade ?? 0) * course.credits,
    0,
  );

  return roundGrade(weightedTotal / credits);
};

export const GradesPage = () => {
  const classes = useStyles();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: gradesQueryKey,
    queryFn: getGrades,
    staleTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
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
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: gradesQueryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: homeDashboardQueryKey,
          refetchType: "all",
        }),
      ]);
    },
  });

  const courses = useMemo(
    () => sortCourses(data ?? []),
    [data],
  );
  const totalCredits = courses.reduce(
    (sum, course) => sum + course.credits,
    0,
  );
  const overallAverage = useMemo(
    () => calculateOverallAverage(courses),
    [courses],
  );

  const saveAssessmentGrade = async (
    courseId: string,
    assessment: GradeAssessmentItem,
    grade: number | null,
  ) => {
    await updateGradeMutation.mutateAsync({
      courseId,
      payload:
        assessment.gradeType === "exam"
          ? {
              examGrade: grade,
              examId: assessment.databaseId,
              assessmentTitle: assessment.title,
              assessmentDueDate: assessment.dueDate,
              assessmentKind: assessment.kind,
            }
          : {
              assignmentGrade: grade,
              assignmentId: assessment.databaseId,
              assessmentTitle: assessment.title,
              assessmentDueDate: assessment.dueDate,
              assessmentKind: assessment.kind,
            },
    });
  };

  return (
    <Box className={classes.page}>
      <Box className={classes.topBar}>
        <Typography className={classes.topBarTitle}>
          ציונים
        </Typography>
      </Box>

      <Box className={classes.content}>
        <Stack spacing={1.5} className={classes.header}>
          <Typography variant="h4" className={classes.title}>
            הציונים שלי
          </Typography>
          <Typography
            variant="body1"
            className={classes.subtitle}
          >
            הציונים, האחוזים והתרומה של כל מטלה ומבחן
            לציון הקורס
          </Typography>
        </Stack>

        <GradesSummary
          overallAverage={overallAverage}
          totalCredits={totalCredits}
        />

        <GradesTable
          courses={courses}
          isLoading={isLoading}
          isSaving={updateGradeMutation.isPending}
          onSaveGrade={saveAssessmentGrade}
        />
      </Box>
    </Box>
  );
};