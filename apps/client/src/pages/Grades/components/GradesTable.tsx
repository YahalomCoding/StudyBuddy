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
import { useStyles } from "../style";
import { CourseGradeRows, type EditingAssessment } from "./CourseGradeRows";

type GradesTableProps = {
  courses: GradesResponseItem[];
  isLoading: boolean;
  isSaving: boolean;
  onSaveGrade: (
    courseId: string,
    assessment: GradeAssessmentItem,
    grade: number | null
  ) => Promise<void>;
  onSaveWeight: (
    courseId: string,
    assessmentId: string,
    weightPercent: number
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
  onSaveWeight,
}: GradesTableProps) => {
  const classes = useStyles();
  const [editingAssessment, setEditingAssessment] =
    useState<EditingAssessment>(null);
  const [editingWeight, setEditingWeight] = useState<{
    courseId: string;
    assessmentId: string;
    value: string;
  } | null>(null);

  const startEdit = (courseId: string, assessment: GradeAssessmentItem) => {
    setEditingAssessment({
      courseId,
      assessment,
      value: assessment.grade?.toString() ?? "",
    });
  };

  const saveGrade = async () => {
    if (!editingAssessment) return;
    const grade = parseGrade(editingAssessment.value);
    if (grade === undefined) return;
    await onSaveGrade(
      editingAssessment.courseId,
      editingAssessment.assessment,
      grade
    );
    setEditingAssessment(null);
  };

  const saveWeight = async () => {
    if (!editingWeight) return;
    const w = parseFloat(editingWeight.value);
    if (!Number.isFinite(w) || w < 0 || w > 100) return;
    await onSaveWeight(editingWeight.courseId, editingWeight.assessmentId, w);
    setEditingWeight(null);
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
                  editingWeight={editingWeight}
                  isSaving={isSaving}
                  onStartEdit={startEdit}
                  onStartWeightEdit={(courseId, assessment) =>
                    setEditingWeight({
                      courseId,
                      assessmentId: assessment.id,
                      value: assessment.weightPercent?.toString() ?? "",
                    })
                  }
                  onEditValueChange={(value) =>
                    setEditingAssessment((current) =>
                      current ? { ...current, value } : current
                    )
                  }
                  onEditWeightChange={(value) =>
                    setEditingWeight((current) =>
                      current ? { ...current, value } : current
                    )
                  }
                  onSave={saveGrade}
                  onSaveWeight={saveWeight}
                />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Card>
  );
};
