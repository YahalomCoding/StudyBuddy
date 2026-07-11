import {
  Column,
  DataType,
  HasOne,
  Model,
  PrimaryKey,
  Table,
} from "sequelize-typescript";
import type { NonAttribute } from "sequelize";
import { Student } from "../students/student.model";

@Table
export class User extends Model<Partial<User>> {
  @PrimaryKey
  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
  declare id: string;

  @Column({ type: DataType.STRING, allowNull: false, unique: true })
  declare username: string;

  @Column({ type: DataType.STRING, allowNull: true, unique: true })
  declare email: string | null;

  @Column({ type: DataType.STRING, allowNull: true })
  declare password: string | null;

  @Column({ type: DataType.STRING, allowNull: false, defaultValue: "local" })
  declare authProvider: "local" | "google";

  @Column({ type: DataType.STRING, allowNull: true, unique: true })
  declare providerId: string | null;

  @Column({ type: DataType.STRING, allowNull: true })
  declare profileImage: string | null;

  @HasOne(() => Student)
  declare student: NonAttribute<Student>;
}
