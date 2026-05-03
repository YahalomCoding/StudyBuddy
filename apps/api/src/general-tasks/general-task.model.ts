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
import { Student } from "../students/student.model";
import { SemesterCourse } from "../semester-courses/semester-course.model";

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
}
