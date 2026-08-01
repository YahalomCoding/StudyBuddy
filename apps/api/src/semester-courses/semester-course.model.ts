import {
  BelongsTo,
  BelongsToMany,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  PrimaryKey,
  Table,
} from "sequelize-typescript";
import type { NonAttribute } from "sequelize";
import { Semester } from "../semesters/semester.model";
import { Course } from "../courses/courses.model";
import { Student } from "../students/student.model";
import { StudentSemesterCourse } from "../student-semester-courses/student-semester-course.model";
import { GeneralTask } from "../general-tasks/general-task.model";

@Table
export class SemesterCourse extends Model<Partial<SemesterCourse>> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  declare id: string;

  @ForeignKey(() => Semester)
  @Column({ type: DataType.UUID, allowNull: false })
  declare semesterId: string;

  @BelongsTo(() => Semester)
  declare semester: NonAttribute<Semester>;

  @ForeignKey(() => Course)
  @Column({ type: DataType.UUID, allowNull: false })
  declare courseId: string;

  @BelongsTo(() => Course)
  declare course: NonAttribute<Course>;

  @BelongsToMany(() => Student, () => StudentSemesterCourse)
  declare students: NonAttribute<Student[]>;

  @HasMany(() => GeneralTask)
  declare generalTasks: NonAttribute<GeneralTask[]>;
}
