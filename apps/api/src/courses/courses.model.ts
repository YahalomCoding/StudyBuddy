import type { NonAttribute } from "sequelize";
import {
  BelongsTo,
  BelongsToMany,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from "sequelize-typescript";
import { Degree } from "../degrees/degree.model";
import { SemesterCourse } from "../semester-courses/semester-course.model";
import { Semester } from "../semesters/semester.model";

@Table({
  indexes: [
    {
      name: "courses_degree_title_unique",
      unique: true,
      fields: ["degreeId", "title"],
    },
  ],
})
export class Course extends Model<Partial<Course>> {
  @PrimaryKey
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
  })
  declare id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare title: string;

  @ForeignKey(() => Degree)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  declare degreeId: string;

  @Column({ type: DataType.INTEGER, allowNull: false, defaultValue: 0 })
  declare credits: number;

  @BelongsTo(() => Degree)
  declare degree: NonAttribute<Degree>;

  @BelongsToMany(() => Semester, () => SemesterCourse)
  declare semesters: NonAttribute<Semester[]>;
}