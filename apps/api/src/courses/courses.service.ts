import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Assignment } from "../assignments/assignment.model";
import { Degree } from "../degrees/degree.model";
import { Exam } from "../exams/exam.model";
import { SemesterCourse } from "../semester-courses/semester-course.model";
import { Semester } from "../semesters/semester.model";
import { StudentSemesterCourse } from "../student-semester-courses/student-semester-course.model";
import { Student } from "../students/student.model";
import { CourseSyllabus } from "../syllabi/course-syllabus.model";
import type { AssessmentKind, SyllabusData } from "../syllabi/syllabus.schemas";

type SyllabusAssessment = SyllabusData["assessments"][number];
import { Course } from "./courses.model";
import type {
  CourseDetailsAssessment,
  CourseDetailsResponse,
} from "./course-details.types";

@Injectable()
export class CoursesService {
  constructor(
    @InjectModel(Student)
    private readonly studentModel: typeof Student,
    @InjectModel(StudentSemesterCourse)
    private readonly studentSemesterCourseModel: typeof StudentSemesterCourse,
    @InjectModel(CourseSyllabus)
    private readonly courseSyllabusModel: typeof CourseSyllabus,
    @InjectModel(Assignment)
    private readonly assignmentModel: typeof Assignment,
    @InjectModel(Exam)
    private readonly examModel: typeof Exam
  ) {}

  async getCourseDetails(
    userId: string,
    studentSemesterCourseId: string
  ): Promise<CourseDetailsResponse> {
    const student = await this.studentModel.findOne({
      where: { userId },
    });

    if (!student) {
      throw new BadRequestException(
        "Complete onboarding before viewing course details"
      );
    }

    const studentSemesterCourse = await this.studentSemesterCourseModel.findOne(
      {
        where: {
          id: studentSemesterCourseId,
          studentId: student.id,
        },
        include: [
          {
            model: SemesterCourse,
            required: true,
            include: [
              {
                model: Course,
                required: true,
                include: [{ model: Degree, required: true }],
              },
              {
                model: Semester,
                required: true,
              },
            ],
          },
        ],
      }
    );

    if (!studentSemesterCourse) {
      throw new NotFoundException(
        "Course was not found for the current student"
      );
    }

    const [syllabusRecord, assignments, exams] = await Promise.all([
      this.courseSyllabusModel.findOne({
        where: { studentSemesterCourseId },
      }),
      this.assignmentModel.findAll({
        where: { studentSemesterCourseId },
        order: [["deadline", "ASC"]],
      }),
      this.examModel.findAll({
        where: { studentSemesterCourseId },
        order: [["date", "ASC"]],
      }),
    ]);

    const semesterCourse = studentSemesterCourse.semesterCourse;
    const course = semesterCourse.course;
    const degree = course.degree;
    const semester = semesterCourse.semester;
    const syllabus = syllabusRecord?.parsedData ?? null;

    return {
      studentSemesterCourseId: studentSemesterCourse.id,
      courseId: course.id,
      semesterCourseId: semesterCourse.id,
      degreeId: degree.id,
      degreeTitle: degree.title,

      title: syllabus?.course.title?.trim() || course.title,
      englishTitle: syllabus?.course.englishTitle ?? null,
      code: syllabus?.course.code ?? null,
      credits: syllabus?.course.credits ?? null,
      weeklyHours: syllabus?.course.weeklyHours ?? null,

      academicYearLabel:
        syllabus?.course.academicYearLabel?.trim() ||
        String(semester.yearNumber),
      semesterLabel:
        syllabus?.course.semesterLabel?.trim() ||
        String(semester.semesterNumber),
      yearNumber: semester.yearNumber,
      semesterNumber: semester.semesterNumber,

      institution: syllabus?.institution ?? null,
      faculty: syllabus?.faculty ?? null,
      grade: studentSemesterCourse.grade,

      lecturers: syllabus?.lecturers ?? [],
      description: syllabus?.description ?? null,
      teachingMethod: syllabus?.teachingMethod ?? null,
      prerequisites: syllabus?.prerequisites ?? [],
      learningOutcomes: syllabus?.learningOutcomes ?? [],
      topics:
        syllabus?.topics.map((topic, index) => ({
          id: topic.id,
          order: topic.order ?? index + 1,
          title: topic.title,
        })) ?? [],
      policies: syllabus?.policies ?? [],
      aiPolicy: syllabus?.aiPolicy ?? null,
      bibliography: syllabus?.bibliography ?? [],
      notes: syllabus?.notes ?? [],

      assessments: this.buildAssessments(syllabus, assignments, exams),

      syllabus: {
        exists: Boolean(syllabusRecord),
        id: syllabusRecord?.id ?? null,
        sourceFileName: syllabusRecord?.sourceFileName ?? null,
        parser: syllabusRecord?.parser ?? null,
        confirmedAt: syllabusRecord?.confirmedAt?.toISOString() ?? null,
      },
    };
  }

  private buildAssessments(
    syllabus: SyllabusData | null,
    assignments: Assignment[],
    exams: Exam[]
  ): CourseDetailsAssessment[] {
    const syllabusAssessments = syllabus?.assessments ?? [];
    const usedAssignmentIds = new Set<string>();
    const usedExamIds = new Set<string>();

    const extractedItems = syllabusAssessments.map((assessment, index) => {
      if (assessment.kind === "exam") {
        const exam = this.findMatchingExam(assessment, exams, usedExamIds);

        if (exam) {
          usedExamIds.add(exam.id);
        }

        return this.toSyllabusAssessmentResponse(
          assessment,
          index,
          exam ?? null,
          null
        );
      }

      const assignment = this.findMatchingAssignment(
        assessment,
        assignments,
        usedAssignmentIds
      );

      if (assignment) {
        usedAssignmentIds.add(assignment.id);
      }

      return this.toSyllabusAssessmentResponse(
        assessment,
        index,
        null,
        assignment ?? null
      );
    });

    const additionalAssignments = assignments
      .filter((assignment) => !usedAssignmentIds.has(assignment.id))
      .map<CourseDetailsAssessment>((assignment) => ({
        id: `assignment-${assignment.id}`,
        databaseId: assignment.id,
        source: "assignment",
        title: assignment.description,
        kind: this.assignmentTypeToKind(assignment.type),
        typeLabel: this.assignmentTypeLabel(assignment.type),
        weightPercent: null,
        dueDate: this.toDateOnly(assignment.deadline),
        status: assignment.status,
        grade: assignment.grade,
        submissionMode: "unknown",
        groupSize: null,
        requiredPages: null,
        notes: null,
      }));

    const additionalExams = exams
      .filter((exam) => !usedExamIds.has(exam.id))
      .map<CourseDetailsAssessment>((exam) => ({
        id: `exam-${exam.id}`,
        databaseId: exam.id,
        source: "exam",
        title: this.examTypeLabel(exam.type),
        kind: "exam",
        typeLabel: this.examTypeLabel(exam.type),
        weightPercent: null,
        dueDate: this.toDateOnly(exam.date),
        status: exam.grade === null ? "not started" : "done",
        grade: exam.grade,
        submissionMode: "individual",
        groupSize: null,
        requiredPages: null,
        notes: null,
      }));

    return [
      ...extractedItems,
      ...additionalAssignments,
      ...additionalExams,
    ].sort((left, right) => {
      if (!left.dueDate && !right.dueDate) {
        return left.title.localeCompare(right.title, "he");
      }

      if (!left.dueDate) return 1;
      if (!right.dueDate) return -1;

      return left.dueDate.localeCompare(right.dueDate);
    });
  }

  private toSyllabusAssessmentResponse(
    assessment: SyllabusAssessment,
    index: number,
    exam: Exam | null,
    assignment: Assignment | null
  ): CourseDetailsAssessment {
    const databaseId = assignment?.id ?? exam?.id ?? null;
    const databaseDueDate = assignment?.deadline ?? exam?.date ?? null;

    return {
      id: assessment.id || `syllabus-assessment-${index + 1}`,
      databaseId,
      source: "syllabus",
      title: assessment.title,
      kind: assessment.kind,
      typeLabel: this.assessmentKindLabel(assessment.kind),
      weightPercent: assessment.weightPercent,
      dueDate:
        databaseDueDate !== null
          ? this.toDateOnly(databaseDueDate)
          : assessment.dueDate,
      status:
        assignment?.status ??
        (exam ? (exam.grade === null ? "not started" : "done") : null),
      grade: assignment?.grade ?? exam?.grade ?? null,
      submissionMode: assessment.submissionMode,
      groupSize: assessment.groupSize,
      requiredPages: assessment.requiredPages,
      notes: assessment.notes,
    };
  }

  private findMatchingAssignment(
    assessment: SyllabusAssessment,
    assignments: Assignment[],
    usedIds: Set<string>
  ): Assignment | undefined {
    const normalizedTitle = this.normalizeText(assessment.title);

    const exactTitleMatch = assignments.find(
      (assignment) =>
        !usedIds.has(assignment.id) &&
        this.normalizeText(assignment.description) === normalizedTitle
    );

    if (exactTitleMatch) {
      return exactTitleMatch;
    }

    if (assessment.dueDate) {
      return assignments.find(
        (assignment) =>
          !usedIds.has(assignment.id) &&
          this.toDateOnly(assignment.deadline) === assessment.dueDate
      );
    }

    return undefined;
  }

  private findMatchingExam(
    assessment: SyllabusAssessment,
    exams: Exam[],
    usedIds: Set<string>
  ): Exam | undefined {
    if (assessment.dueDate) {
      const dateMatch = exams.find(
        (exam) =>
          !usedIds.has(exam.id) &&
          this.toDateOnly(exam.date) === assessment.dueDate
      );

      if (dateMatch) {
        return dateMatch;
      }
    }

    return exams.find((exam) => !usedIds.has(exam.id));
  }

  private normalizeText(value: string): string {
    return value.trim().toLocaleLowerCase("he").replace(/\s+/g, " ");
  }

  private toDateOnly(value: Date): string {
    return value.toISOString().slice(0, 10);
  }

  private assignmentTypeToKind(type: Assignment["type"]): AssessmentKind {
    switch (type) {
      case "project":
        return "project";
      case "lab":
        return "lab";
      case "practice":
        return "participation";
      case "assignment":
      case "homework":
      case "report":
        return "assignment";
    }
  }

  private assignmentTypeLabel(type: Assignment["type"]): string {
    switch (type) {
      case "assignment":
        return "מטלה";
      case "homework":
        return "שיעורי בית";
      case "practice":
        return "תרגול";
      case "project":
        return "פרויקט";
      case "report":
        return "דוח";
      case "lab":
        return "מעבדה";
    }
  }

  private assessmentKindLabel(kind: AssessmentKind): string {
    switch (kind) {
      case "assignment":
        return "מטלה";
      case "exam":
        return "מבחן";
      case "project":
        return "פרויקט";
      case "presentation":
        return "הצגה";
      case "participation":
        return "השתתפות";
      case "lab":
        return "מעבדה";
      case "other":
        return "אחר";
    }
  }

  private examTypeLabel(type: number): string {
    switch (type) {
      case 1:
        return "מועד א׳";
      case 2:
        return "מועד ב׳";
      default:
        return "מבחן";
    }
  }
}
