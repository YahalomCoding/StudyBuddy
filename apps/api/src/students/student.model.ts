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
import { User } from "../users/user.model";
import { Degree } from "../degrees/degree.model";
import { StudentDegree } from "../student-degrees/student-degree.model";
import { SemesterCourse } from "../semester-courses/semester-course.model";
import { StudentSemesterCourse } from "../student-semester-courses/student-semester-course.model";
import { GeneralTask } from "../general-tasks/general-task.model";

@Table
export class Student extends Model<Partial<Student>> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  declare id: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false, unique: true })
  declare userId: string;

  @BelongsTo(() => User)
  declare user: NonAttribute<User>;

  @Column({ type: DataType.INTEGER, allowNull: false })
  declare coursesPerSemester: number;

  @Column({ type: DataType.STRING, allowNull: false })
  declare workStatus: string;

  @Column({ type: DataType.ARRAY(DataType.STRING), allowNull: false })
  declare studyAvailabilityDays: string[];

  @Column({ type: DataType.INTEGER, allowNull: false })
  declare realisticStudyHoursPerDay: number;

  @Column({ type: DataType.STRING, allowNull: false })
  declare focusTime: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare preferredStudyDuration: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare strongTopics: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare challengingTopics: string;

  @Column({ type: DataType.STRING, allowNull: false })
  declare semesterFocusGoal: string;

  @BelongsToMany(() => Degree, () => StudentDegree)
  declare degrees: NonAttribute<Degree[]>;

  @BelongsToMany(() => SemesterCourse, () => StudentSemesterCourse)
  declare semesterCourses: NonAttribute<SemesterCourse[]>;

  @HasMany(() => GeneralTask)
  declare generalTasks: NonAttribute<SemesterCourse[]>;
}
