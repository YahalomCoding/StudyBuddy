import type { FormField } from "../../components/GenericFormModal/GenericFormModal";

export const TASK_FIELDS: FormField[] = [
  {
    type: "text",
    name: "title",
    label: "שם המשימה",
    placeholder: "קרא פרק 5",
  },
  { type: "date", name: "dueDate", label: "תאריך יעד" },
  {
    type: "select",
    name: "estimatedTime",
    label: "זמן משוער",
    options: [
      { label: "15 דקות", value: "15" },
      { label: "30 דקות", value: "30" },
      { label: "שעה", value: "60" },
      { label: "שעתיים", value: "120" },
    ],
  },
];

const ASSIGNMENT_BASE_FIELDS: FormField[] = [
  { type: "text", name: "title", label: "שם המשימה", placeholder: "חיבור" },
  { type: "date", name: "dueDate", label: "תאריך יעד" },
  {
    type: "select",
    name: "status",
    label: "סטאטוס",
    options: [
      { label: "לא התחיל", value: "not started" },
      { label: "פעיל", value: "active" },
      { label: "הושלם", value: "done" },
    ],
  },
  {
    type: "select",
    name: "type",
    label: "סוג המשימה",
    options: [
      { label: "מטלה", value: "assignment" },
      { label: "שיעורי בית", value: "homework" },
      { label: "תרגול", value: "practice" },
      { label: "פרויקט", value: "project" },
      { label: "דוח", value: "report" },
      { label: "מעבדה", value: "lab" },
    ],
  },
];

export type HomeModalType = "task" | "assignment";

export const buildAssignmentFields = (
  courseOptions: Array<{ label: string; value: string }>
): FormField[] => [
  {
    type: "select",
    name: "course",
    label: "שם הקורס",
    options: courseOptions,
  },
  ...ASSIGNMENT_BASE_FIELDS,
];

export const getHomeModalTitle = (modal: {
  type: HomeModalType;
  editId?: string;
}): string => {
  if (modal.editId) {
    return modal.type === "task" ? "ערוך משימה" : "ערוך מטלה";
  }

  return modal.type === "task" ? "הוסף משימה" : "הוסף מטלה";
};
