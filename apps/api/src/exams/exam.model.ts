import type { NonAttribute } from "sequelize";
import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from "sequelize-typescript";
import { StudentSemesterCourse } from "../student-semester-courses/student-semester-course.model";

@Table
export class Exam extends Model<Partial<Exam>> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  declare id: string;

  @ForeignKey(() => StudentSemesterCourse)
  @Column({ type: DataType.UUID, allowNull: false })
  declare studentSemesterCourseId: string;

  @BelongsTo(() => StudentSemesterCourse)
  declare studentSemesterCourse: NonAttribute<StudentSemesterCourse>;

  @Column({ type: DataType.DATE, allowNull: false })
  declare date: Date;

  @Column({ type: DataType.INTEGER, allowNull: false })
  declare type: number;

  @Column({ type: DataType.INTEGER, allowNull: true })
  declare grade: number | null;
}
