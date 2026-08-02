import {
  Box,
  Card,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { useState } from "react";
import type {
  GradeAssessmentItem,
  GradesResponseItem,
} from "../../../api/grades";
import {
  CourseGradeRows,
  type EditingAssessment,
} from "./CourseGradeRows";
import { useStyles } from "../style";

type GradesTableProps = {
  courses: GradesResponseItem[];
  isLoading: boolean;
  isSaving: boolean;
  onSaveGrade: (
    courseId: string,
    assessment: GradeAssessmentItem,
    grade: number | null,
  ) => Promise<void>;
};

const parseGrade = (value: string) => {
  const trimmedValue = value.trim();

  if (trimmedValue === "") {
    return null;
  }

  const grade = Number(trimmedValue);

  if (!Number.isFinite(grade) || grade < 0 || grade > 100) {
    return undefined;
  }

  return grade;
};

export const GradesTable = ({
  courses,
  isLoading,
  isSaving,
  onSaveGrade,
}: GradesTableProps) => {
  const classes = useStyles();
  const [editingAssessment, setEditingAssessment] =
    useState<EditingAssessment>(null);

  const startEdit = (
    courseId: string,
    assessment: GradeAssessmentItem,
  ) => {
    setEditingAssessment({
      courseId,
      assessment,
      value: assessment.grade?.toString() ?? "",
    });
  };

  const saveGrade = async () => {
    if (!editingAssessment) {
      return;
    }

    const grade = parseGrade(editingAssessment.value);

    if (grade === undefined) {
      return;
    }

    await onSaveGrade(
      editingAssessment.courseId,
      editingAssessment.assessment,
      grade,
    );
    setEditingAssessment(null);
  };

  return (
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
                <TableCell align="center">ציון סופי</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {courses.map((course) => (
                <CourseGradeRows
                  key={course.studentSemesterCourseId}
                  course={course}
                  editingAssessment={editingAssessment}
                  isSaving={isSaving}
                  onStartEdit={startEdit}
                  onEditValueChange={(value) =>
                    setEditingAssessment((current) =>
                      current ? { ...current, value } : current,
                    )
                  }
                  onSave={saveGrade}
                />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Card>
  );
};
