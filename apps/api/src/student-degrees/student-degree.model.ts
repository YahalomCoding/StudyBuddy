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
import { Degree } from "../degrees/degree.model";
import { Student } from "../students/student.model";

@Table
export class StudentDegree extends Model<Partial<StudentDegree>> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  declare id: string;

  @ForeignKey(() => Student)
  @Column({ type: DataType.UUID, allowNull: false })
  declare studentId: string;

  @BelongsTo(() => Student)
  declare student: NonAttribute<Student>;

  @ForeignKey(() => Degree)
  @Column({ type: DataType.UUID, allowNull: false })
  declare degreeId: string;

  @BelongsTo(() => Degree)
  declare degree: NonAttribute<Degree>;
}
