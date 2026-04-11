import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from "sequelize-typescript";
import type { NonAttribute } from "sequelize";
import { StudentSemesterCourse } from "../student-semester-courses/student-semester-course.model";

@Table
export class Assignment extends Model<Partial<Assignment>> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  declare id: string;

  @ForeignKey(() => StudentSemesterCourse)
  @Column({ type: DataType.UUID, allowNull: false })
  declare studentSemesterCourseId: string;

  @BelongsTo(() => StudentSemesterCourse)
  declare studentSemesterCourse: NonAttribute<StudentSemesterCourse>;

  @Column({ type: DataType.STRING, allowNull: false })
  declare description: string;

  @Column({ type: DataType.DATE, allowNull: false })
  declare deadline: Date;

  @Column({ type: DataType.INTEGER, allowNull: true })
  declare grade: number | null;
}
