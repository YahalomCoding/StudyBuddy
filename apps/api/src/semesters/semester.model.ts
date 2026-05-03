import type { NonAttribute } from "sequelize";
import {
  BelongsToMany,
  Column,
  DataType,
  Model,
  PrimaryKey,
  Table,
} from "sequelize-typescript";
import { Course } from "../courses/course.model";
import { SemesterCourse } from "../semester-courses/semester-course.model";

@Table
export class Semester extends Model<Partial<Semester>> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  declare id: string;

  @Column({ type: DataType.INTEGER, allowNull: false })
  declare yearNumber: number;

  @Column({ type: DataType.INTEGER, allowNull: false })
  declare semesterNumber: number;

  @BelongsToMany(() => Course, () => SemesterCourse)
  declare courses: NonAttribute<Course[]>;
}
