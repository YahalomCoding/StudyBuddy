import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  PrimaryKey,
  Table,
} from "sequelize-typescript";
import type { NonAttribute } from "sequelize";
import { Student } from "../students/student.model";
import { SemesterCourse } from "../semester-courses/semester-course.model";
import { Assignment } from "../assignments/assignment.model";
import { Exam } from "../exams/exam.model";

@Table
export class StudentSemesterCourse extends Model<
  Partial<StudentSemesterCourse>
> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  declare id: string;

  @ForeignKey(() => Student)
  @Column({ type: DataType.UUID, allowNull: false })
  declare studentId: string;

  @BelongsTo(() => Student)
  declare student: NonAttribute<Student>;

  @ForeignKey(() => SemesterCourse)
  @Column({ type: DataType.UUID, allowNull: false })
  declare semesterCourseId: string;

  @BelongsTo(() => SemesterCourse)
  declare semesterCourse: NonAttribute<SemesterCourse>;

  @Column({ type: DataType.INTEGER, allowNull: true })
  declare grade: number | null;

  @HasMany(() => Assignment)
  declare assignments: NonAttribute<Assignment[]>;

  @HasMany(() => Exam)
  declare exams: NonAttribute<Exam[]>;
}
