export type DurationUnit = "minutes" | "hours" | "days";

export interface DurationValue {
  value: number;
  unit: DurationUnit;
}

export type ItemStatus = "not started" | "active" | "done";

export type AssignmentType =
  "assignment" | "homework" | "practice" | "project" | "report" | "lab";

export interface TodoItem {
  id: string;
  title: string;
  dueDate: Date;
  done: boolean;
  estimatedTime: DurationValue;
}

export interface AssignmentItem {
  id: string;
  status: ItemStatus;
  course: string;
  title: string;
  dueDate: Date;
  type: AssignmentType;
}

export type RelativeDueDate =
  | { kind: "completed" }
  | { kind: "today" }
  | { kind: "due_in"; days: number }
  | { kind: "overdue"; days: number };

export enum CourseSemesterOption {
  A = "A",
  B = "B",
  Summer = "Summer",
}
