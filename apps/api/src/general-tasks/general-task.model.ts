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
import { SemesterCourse } from "../semester-courses/semester-course.model";
import { Student } from "../students/student.model";

@Table
export class GeneralTask extends Model<Partial<GeneralTask>> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  declare id: string;

  @ForeignKey(() => Student)
  @Column({ type: DataType.UUID, allowNull: false })
  declare studentId: string;

  @BelongsTo(() => Student)
  declare student: NonAttribute<Student>;

  @ForeignKey(() => SemesterCourse)
  @Column({ type: DataType.UUID, allowNull: true })
  declare semesterCourseId: string;

  @BelongsTo(() => SemesterCourse)
  declare semesterCourse: NonAttribute<SemesterCourse | null>;

  @Column({ type: DataType.STRING, allowNull: false })
  declare description: string;

  @Column({ type: DataType.DATE, allowNull: false })
  declare dueDate: Date;

  @Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
  declare done: boolean;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 30 })
  declare estimatedTimeValue: number;

  @Column({ type: DataType.STRING, allowNull: false, defaultValue: "minutes" })
  declare estimatedTimeUnit: "minutes" | "hours" | "days";
}
