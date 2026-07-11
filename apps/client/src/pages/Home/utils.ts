import type {
  AssignmentType,
  DurationValue,
  ItemStatus,
  RelativeDueDate,
} from "@studybuddy/types";

export const ASSIGNMENT_STATUSES: ItemStatus[] = [
  "not started",
  "active",
  "done",
];

export const ASSIGNMENT_TYPES: AssignmentType[] = [
  "assignment",
  "homework",
  "practice",
  "project",
  "report",
  "lab",
];

export const getNextValue = <T>(values: T[], current: T): T => {
  const currentIndex = values.indexOf(current);

  if (currentIndex < 0 || currentIndex === values.length - 1) {
    return values[0] as T;
  }

  return values[currentIndex + 1] as T;
};

const dueDateFormatter = new Intl.DateTimeFormat("he-IL", {
  day: "numeric",
  month: "long",
});

export const formatDueDate = (value: Date): string => {
  return dueDateFormatter.format(value);
};

export const formatDuration = ({ value, unit }: DurationValue): string => {
  const unitLabel: Record<DurationValue["unit"], string> = {
    minutes: "דק'",
    hours: "שעות",
    days: "ימים",
  };

  return `${value} ${unitLabel[unit]}`;
};

export const statusToDisplayName = (status: ItemStatus): string => {
  const labels: Record<ItemStatus, string> = {
    "not started": "לא התחיל",
    active: "פעיל",
    done: "הושלם",
  };

  return labels[status];
};

export const assignmentTypeToDisplayName = (type: AssignmentType): string => {
  const labels: Record<AssignmentType, string> = {
    assignment: "מטלה",
    homework: "שיעורי בית",
    practice: "תרגול",
    project: "פרויקט",
    report: "דוח",
    lab: "מעבדה",
  };

  return labels[type];
};

const MS_PER_DAY = 1000 * 60 * 60 * 24;

const startOfDay = (value: Date): Date => {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
};

export const getRelativeDueDate = (
  dueDate: Date,
  status: ItemStatus,
  now: Date = new Date()
): RelativeDueDate => {
  if (status === "done") {
    return { kind: "completed" };
  }

  const dueDay = startOfDay(dueDate);
  const nowDay = startOfDay(now);
  const dayDiff = Math.round(
    (dueDay.getTime() - nowDay.getTime()) / MS_PER_DAY
  );

  if (dayDiff === 0) {
    return { kind: "today" };
  }

  if (dayDiff > 0) {
    return { kind: "due_in", days: dayDiff };
  }

  return { kind: "overdue", days: Math.abs(dayDiff) };
};

export const relativeDueDateToDisplayName = (
  value: RelativeDueDate
): string => {
  switch (value.kind) {
    case "completed":
      return "בוצע";
    case "today":
      return "היום";
    case "due_in":
      return value.days === 1 ? "יום אחד" : `${value.days} ימים`;
    case "overdue":
      return "באיחור";
    default:
      return "";
  }
};

export const isOverdue = (value: RelativeDueDate): boolean => {
  return value.kind === "overdue";
};
