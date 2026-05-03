import {
  BelongsToMany,
  Column,
  DataType,
  HasMany,
  Model,
  PrimaryKey,
  Table,
} from "sequelize-typescript";
import type { NonAttribute } from "sequelize";
import { Course } from "../courses/course.model";
import { StudentDegree } from "../student-degrees/student-degree.model";
import { Student } from "../students/student.model";

@Table
export class Degree extends Model<Partial<Degree>> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  declare id: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare title: string;

  @Column({ type: DataType.INTEGER, allowNull: false })
  declare type: number;

  @Column({ type: DataType.INTEGER, allowNull: false })
  declare duration: number;

  @HasMany(() => Course)
  declare courses: NonAttribute<Course[]>;

  @BelongsToMany(() => Student, () => StudentDegree)
  declare students: NonAttribute<Student[]>;
}
