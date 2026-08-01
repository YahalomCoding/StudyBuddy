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
import type { SyllabusData } from "./syllabus.schemas";

@Table
export class CourseSyllabus extends Model<Partial<CourseSyllabus>> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  declare id: string;

  @ForeignKey(() => StudentSemesterCourse)
  @Column({ type: DataType.UUID, allowNull: false, unique: true })
  declare studentSemesterCourseId: string;

  @BelongsTo(() => StudentSemesterCourse)
  declare studentSemesterCourse: NonAttribute<StudentSemesterCourse>;

  @Column({ type: DataType.STRING, allowNull: false })
  declare sourceFileName: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare parser: "ai" | "heuristic";

  @Column({ type: DataType.JSONB, allowNull: false })
  declare parsedData: SyllabusData;

  @Column({ type: DataType.DATE, allowNull: false })
  declare confirmedAt: Date;
}
