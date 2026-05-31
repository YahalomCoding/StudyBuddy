import AddIcon from "@mui/icons-material/Add";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import {
  Box,
  Checkbox,
  Chip,
  IconButton,
  Paper,
  Typography,
} from "@mui/material";
import {
  type AssignmentItem,
  type AssignmentType,
  type ItemStatus,
  type TodoItem,
} from "@studybuddy/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  getHomeDashboard,
  homeDashboardQueryKey,
  updateAssignment,
  updateGeneralTask,
} from "../../api/home";
import { ChatBotBubble } from "../../components/Chatbot";
import { CoursesSummary } from "../../components/CoursesSummery/CoursesSummery";
import {
  GenericFormModal,
  type FormField,
  type FormValues,
} from "../../components/GenericFormModal/GenericFormModal";
import { UpcomingEvents } from "../../components/UpcomingEvents";
import {
  applyOptimisticAssignmentUpdate,
  applyOptimisticTodoDoneUpdate,
  applyOptimisticTodoEstimatedTimeUpdate,
  rollbackOptimisticDashboardUpdate,
  rollbackOptimisticTodoDoneUpdate,
} from "./functions";
import { statusChipClass, typeChipClass } from "./style";
import {
  ASSIGNMENT_STATUSES,
  ASSIGNMENT_TYPES,
  assignmentTypeToDisplayName,
  formatDueDate,
  formatDuration,
  getNextValue,
  getRelativeDueDate,
  isOverdue,
  relativeDueDateToDisplayName,
  statusToDisplayName,
} from "./utils";

// ─── Field schemas ─────────────────────────────────────────────────────────────

const TASK_FIELDS: FormField[] = [
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
      { label: "15 min", value: "15" },
      { label: "30 min", value: "30" },
      { label: "1 hour", value: "60" },
      { label: "2 hours", value: "120" },
    ],
  },
];

const ASSIGNMENT_FIELDS: FormField[] = [
  { type: "text", name: "course", label: "שם הקורס", placeholder: "מתמטיקה" },
  { type: "text", name: "title", label: "שם המשימה", placeholder: "חיבור" },
  { type: "date", name: "dueDate", label: "תאריך יעד" },
  {
    type: "select",
    name: "status",
    label: "סטאטוס",
    options: [
      { label: "Not Started", value: "not_started" },
      { label: "In Progress", value: "in_progress" },
      { label: "Completed", value: "completed" },
    ],
  },
  {
    type: "select",
    name: "type",
    label: "סוג המשימה",
    options: [
      { label: "Homework", value: "homework" },
      { label: "Exam", value: "exam" },
      { label: "Project", value: "project" },
      { label: "Other", value: "other" },
    ],
  },
];

// ─── Modal state type ──────────────────────────────────────────────────────────

type ModalState = {
  type: "task" | "assignment";
  values: FormValues;
  editId?: string; // present → edit mode
};

// ─── Card wrapper ──────────────────────────────────────────────────────────────

const SectionCard = ({
  title,
  icon,
  children,
  onPrev,
  onNext,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  onPrev?: () => void;
  onNext?: () => void;
}) => (
  <Paper
    elevation={0}
    sx={{
      borderRadius: 3,
      border: "1px solid",
      borderColor: "divider",
      p: 2,
      bgcolor: "background.paper",
    }}
  >
    <Box
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      mb={1.5}
    >
      <Box display="flex" alignItems="center" gap={1}>
        {icon}
        <Typography fontWeight={600} fontSize={15}>
          {title}
        </Typography>
      </Box>
      <Box display="flex" alignItems="center">
        <IconButton size="small" onClick={onPrev} sx={{ p: 0.3 }}>
          <ChevronRightIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" onClick={onNext} sx={{ p: 0.3 }}>
          <ChevronLeftIcon fontSize="small" />
        </IconButton>
      </Box>
    </Box>
    {children}
  </Paper>
);

// ─── Main Component ────────────────────────────────────────────────────────────

export const Home = () => {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, isFetched } = useQuery({
    queryKey: homeDashboardQueryKey,
    queryFn: getHomeDashboard,
  });
  const isInitialLoading = isLoading && !isFetched;

  // ── Modal state ──────────────────────────────────────────────────────────────
  const [modal, setModal] = useState<ModalState | null>(null);

  // ── Temporary local items (not saved to DB) ──────────────────────────────────
  const [localTodos, setLocalTodos] = useState<TodoItem[]>([]);
  const [localAssignments, setLocalAssignments] = useState<AssignmentItem[]>(
    []
  );

  // ── Mutations ────────────────────────────────────────────────────────────────

  const { mutate: updateTask } = useMutation({
    meta: { disableLoadingDefault: true },
    mutationFn: ({ id, done }: { id: string; done: boolean }) =>
      updateGeneralTask(id, { done }),
    onMutate: ({ id, done }) =>
      applyOptimisticTodoDoneUpdate(queryClient, id, done),
    onError: (_error, _variables, context) => {
      rollbackOptimisticTodoDoneUpdate(queryClient, context?.previousDashboard);
    },
  });

  const updateAssignmentMutation = useMutation({
    meta: { disableLoadingDefault: true },
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: { status?: ItemStatus; type?: AssignmentType };
    }) => updateAssignment(id, payload),
    onMutate: ({ id, payload }) =>
      applyOptimisticAssignmentUpdate(queryClient, id, payload),
    onError: (_error, _variables, context) => {
      rollbackOptimisticDashboardUpdate(
        queryClient,
        context?.previousDashboard
      );
    },
  });

  const updateTodoEstimatedTimeMutation = useMutation({
    meta: { disableLoadingDefault: true },
    mutationFn: ({
      id,
      estimatedTimeValue,
      estimatedTimeUnit,
    }: {
      id: string;
      estimatedTimeValue: number;
      estimatedTimeUnit: "minutes" | "hours" | "days";
    }) => updateGeneralTask(id, { estimatedTimeValue, estimatedTimeUnit }),
    onMutate: ({ id, estimatedTimeValue, estimatedTimeUnit }) =>
      applyOptimisticTodoEstimatedTimeUpdate(
        queryClient,
        id,
        estimatedTimeValue,
        estimatedTimeUnit
      ),
    onError: (_error, _variables, context) => {
      rollbackOptimisticDashboardUpdate(
        queryClient,
        context?.previousDashboard
      );
    },
  });

  // ── Rows: merge server data + local temp items ────────────────────────────────

  const todoRows: TodoItem[] = useMemo(
    () => [
      ...(data?.todos ?? []).map((item) => ({
        ...item,
        dueDate: new Date(item.dueDate),
      })),
      ...localTodos,
    ],
    [data?.todos, localTodos]
  );

  const assignmentRows: AssignmentItem[] = useMemo(
    () => [
      ...(data?.assignments ?? []).map((item) => ({
        ...item,
        dueDate: new Date(item.dueDate),
      })),
      ...localAssignments,
    ],
    [data?.assignments, localAssignments]
  );

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleTodoToggle = (id: string, currentDone: boolean) => {
    // If it's a local item, toggle locally
    if (localTodos.some((t) => t.id === id)) {
      setLocalTodos((prev) =>
        prev.map((t) => (t.id === id ? { ...t, done: !currentDone } : t))
      );
      return;
    }
    updateTask({ id, done: !currentDone });
  };

  const handleAssignmentStatusCycle = (row: AssignmentItem) => {
    if (localAssignments.some((a) => a.id === row.id)) {
      setLocalAssignments((prev) =>
        prev.map((a) =>
          a.id === row.id
            ? { ...a, status: getNextValue(ASSIGNMENT_STATUSES, row.status) }
            : a
        )
      );
      return;
    }
    updateAssignmentMutation.mutate({
      id: row.id,
      payload: { status: getNextValue(ASSIGNMENT_STATUSES, row.status) },
    });
  };

  const handleAssignmentTypeCycle = (row: AssignmentItem) => {
    if (localAssignments.some((a) => a.id === row.id)) {
      setLocalAssignments((prev) =>
        prev.map((a) =>
          a.id === row.id
            ? { ...a, type: getNextValue(ASSIGNMENT_TYPES, row.type) }
            : a
        )
      );
      return;
    }
    updateAssignmentMutation.mutate({
      id: row.id,
      payload: { type: getNextValue(ASSIGNMENT_TYPES, row.type) },
    });
  };

  // ── Modal save handler ────────────────────────────────────────────────────────

  const handleModalSave = (values: FormValues) => {
    if (!modal) return;

    if (modal.type === "task") {
      const estimatedMinutes = parseInt(values.estimatedTime ?? "30", 10);
      const newTask: TodoItem = {
        id: `local-task-${Date.now()}`,
        title: values.title ?? "Untitled Task",
        dueDate: values.dueDate ? new Date(values.dueDate) : new Date(),
        done: false,
        estimatedTime: {
          value:
            estimatedMinutes < 60 ? estimatedMinutes : estimatedMinutes / 60,
          unit: estimatedMinutes < 60 ? "minutes" : "hours",
        },
      };

      if (modal.editId) {
        setLocalTodos((prev) =>
          prev.map((t) => (t.id === modal.editId ? newTask : t))
        );
      } else {
        setLocalTodos((prev) => [...prev, newTask]);
      }
    }

    if (modal.type === "assignment") {
      const newAssignment: AssignmentItem = {
        id: `local-assignment-${Date.now()}`,
        title: values.title ?? "Untitled Assignment",
        course: values.course ?? "",
        dueDate: values.dueDate ? new Date(values.dueDate) : new Date(),
        status: (values.status as ItemStatus) ?? "not_started",
        type: (values.type as AssignmentType) ?? "homework",
      };

      if (modal.editId) {
        setLocalAssignments((prev) =>
          prev.map((a) => (a.id === modal.editId ? newAssignment : a))
        );
      } else {
        setLocalAssignments((prev) => [...prev, newAssignment]);
      }
    }

    setModal(null);
  };

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", p: 0 }}>
      <ChatBotBubble exampleQuestions={["What exams do I have this week?"]} />

      {/* Page header */}
      <Box
        sx={{
          px: 3,
          py: 1.5,
          borderBottom: "1px solid",
          borderColor: "divider",
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <Typography fontWeight={500}>Home</Typography>
      </Box>

      <Box sx={{ p: 3, maxWidth: 1100, mx: "auto" }}>
        {/* ── AI Study Plan Banner ───────────────────────────────── */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            p: 2,
            mb: 2.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            bgcolor: "background.paper",
          }}
        >
          <Box display="flex" alignItems="center" gap={2}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #a78bfa 0%, #60a5fa 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <AutoAwesomeIcon sx={{ color: "white", fontSize: 24 }} />
            </Box>
            <Box>
              <Typography fontWeight={600} fontSize={15}>
                Generate AI Study Plan
              </Typography>
              <Typography variant="body2" color="text.secondary">
                A custom AI-generated study plan map you progress.{" "}
                <Typography
                  component="span"
                  variant="body2"
                  color="primary"
                  sx={{ cursor: "pointer" }}
                >
                  Learn more!
                </Typography>
              </Typography>
            </Box>
          </Box>
          <Box
            sx={{
              bgcolor: "#22c55e",
              color: "white",
              px: 3,
              py: 1.2,
              borderRadius: 2.5,
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer",
              "&:hover": { bgcolor: "#16a34a" },
              transition: "background 0.2s",
              whiteSpace: "nowrap",
            }}
          >
            Generate Plan
          </Box>
        </Paper>

        {/* ── Two-column grid ────────────────────────────────────── */}
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
          {/* LEFT column */}
          <Box display="flex" flexDirection="column" gap={2}>
            {/* To Do card */}
            <SectionCard
              title="To Do"
              icon={<CheckCircleIcon sx={{ color: "#22c55e", fontSize: 20 }} />}
            >
              {isInitialLoading && (
                <Typography color="text.secondary" fontSize={13}>
                  טוען...
                </Typography>
              )}
              {isError && (
                <Typography color="error" fontSize={13}>
                  לא הצלחנו לטעון משימות כרגע
                </Typography>
              )}
              {/* Header row */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto auto auto",
                  gap: 1,
                  pb: 0.5,
                  mb: 0.5,
                  borderBottom: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Typography
                  fontSize={12}
                  color="text.secondary"
                  textAlign="right"
                >
                  שם משימה
                </Typography>
                <Typography
                  fontSize={12}
                  color="text.secondary"
                  textAlign="right"
                >
                  תאריך יעד
                </Typography>
                <Typography
                  fontSize={12}
                  color="text.secondary"
                  textAlign="center"
                >
                  בוצע
                </Typography>
                <Typography
                  fontSize={12}
                  color="text.secondary"
                  textAlign="right"
                >
                  זמן משוער
                </Typography>
              </Box>

              {todoRows.map((row) => (
                <Box
                  key={row.id}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto auto auto",
                    gap: 1,
                    alignItems: "center",
                    py: 0.8,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    "&:last-of-type": { borderBottom: "none" },
                  }}
                >
                  <Typography
                    fontSize={13}
                    sx={{
                      textDecoration: row.done ? "line-through" : "none",
                      color: row.done ? "text.secondary" : "text.primary",
                      textAlign: "right",
                    }}
                  >
                    {row.title}
                  </Typography>
                  <Typography
                    fontSize={13}
                    color="text.secondary"
                    textAlign="right"
                  >
                    {formatDueDate(row.dueDate)}
                  </Typography>
                  <Box display="flex" justifyContent="center">
                    <Checkbox
                      checked={row.done}
                      size="small"
                      disableRipple
                      onChange={() => handleTodoToggle(row.id, row.done)}
                      sx={{ p: 0 }}
                    />
                  </Box>
                  <Typography
                    fontSize={13}
                    color="primary"
                    fontWeight={500}
                    textAlign="right"
                    sx={{ cursor: "pointer" }}
                    onClick={() => {
                      // Only cycle estimated time for server items
                      if (localTodos.some((t) => t.id === row.id)) return;
                      const nextEstimatedTimeValue =
                        row.estimatedTime.value >= 120
                          ? 15
                          : row.estimatedTime.value + 15;
                      updateTodoEstimatedTimeMutation.mutate({
                        id: row.id,
                        estimatedTimeValue: nextEstimatedTimeValue,
                        estimatedTimeUnit: row.estimatedTime.unit,
                      });
                    }}
                  >
                    {formatDuration(row.estimatedTime)}
                  </Typography>
                </Box>
              ))}

              {/* Add Task row */}
              <Box
                display="flex"
                alignItems="center"
                gap={0.5}
                sx={{ cursor: "pointer", color: "text.secondary", mt: 1 }}
                onClick={() => setModal({ type: "task", values: {} })}
              >
                <AddIcon fontSize="small" />
                <Typography fontSize={13}>הוסף משימה</Typography>
              </Box>
            </SectionCard>

            {/* Assignments card */}
            <SectionCard
              title="Assignments"
              onNext={() => setModal({ type: "assignment", values: {} })}
            >
              {/* Header */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "auto auto 1fr auto auto auto",
                  gap: 1,
                  pb: 0.5,
                  mb: 0.5,
                  borderBottom: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Typography
                  fontSize={12}
                  color="text.secondary"
                  textAlign="right"
                >
                  סטטוס
                </Typography>
                <Typography
                  fontSize={12}
                  color="text.secondary"
                  textAlign="right"
                >
                  קורס
                </Typography>
                <Typography
                  fontSize={12}
                  color="text.secondary"
                  textAlign="right"
                >
                  שם מטלה
                </Typography>
                <Typography
                  fontSize={12}
                  color="text.secondary"
                  textAlign="right"
                >
                  תאריך יעד
                </Typography>
                <Typography
                  fontSize={12}
                  color="text.secondary"
                  textAlign="right"
                >
                  סוג
                </Typography>
                <Typography
                  fontSize={12}
                  color="text.secondary"
                  textAlign="right"
                >
                  ימים שנותרו
                </Typography>
              </Box>

              {isInitialLoading && (
                <Typography color="text.secondary" fontSize={13}>
                  טוען...
                </Typography>
              )}
              {isError && (
                <Typography color="error" fontSize={13}>
                  לא הצלחנו לטעון מטלות כרגע
                </Typography>
              )}

              {assignmentRows.map((row) => {
                const relativeDueDate = getRelativeDueDate(
                  row.dueDate,
                  row.status
                );
                return (
                  <Box
                    key={row.id}
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "auto auto 1fr auto auto auto",
                      gap: 1,
                      alignItems: "center",
                      py: 0.8,
                      borderBottom: "1px solid",
                      borderColor: "divider",
                      "&:last-of-type": { borderBottom: "none" },
                      ...(isOverdue(relativeDueDate) && {
                        bgcolor: "var(--sb-home-overdue-row-bg)",
                        borderColor: "var(--sb-home-overdue-row-border)",
                      }),
                    }}
                  >
                    <Chip
                      label={statusToDisplayName(row.status)}
                      size="small"
                      className={statusChipClass(row.status)}
                      onClick={() => handleAssignmentStatusCycle(row)}
                      sx={{ fontSize: 11, height: 22 }}
                    />
                    <Typography fontSize={12} color="text.secondary" noWrap>
                      {row.course}
                    </Typography>
                    <Typography fontSize={13} noWrap textAlign="right">
                      {row.title}
                    </Typography>
                    <Typography fontSize={12} color="text.secondary" noWrap>
                      {formatDueDate(row.dueDate)}
                    </Typography>
                    <Chip
                      label={assignmentTypeToDisplayName(row.type)}
                      size="small"
                      className={typeChipClass(row.type)}
                      onClick={() => handleAssignmentTypeCycle(row)}
                      sx={{ fontSize: 11, height: 22 }}
                    />
                    <Typography
                      fontSize={12}
                      fontWeight={500}
                      textAlign="right"
                      sx={{
                        color: isOverdue(relativeDueDate)
                          ? "var(--sb-home-overdue-text)"
                          : "text.secondary",
                      }}
                    >
                      {relativeDueDateToDisplayName(relativeDueDate)}
                    </Typography>
                  </Box>
                );
              })}

              {/* Add Assignment row */}
              <Box
                display="flex"
                alignItems="center"
                gap={0.5}
                sx={{ cursor: "pointer", color: "text.secondary", mt: 1 }}
                onClick={() => setModal({ type: "assignment", values: {} })}
              >
                <AddIcon fontSize="small" />
                <Typography fontSize={13}>הוסף מטלה</Typography>
              </Box>
            </SectionCard>
          </Box>

          {/* RIGHT column */}
          <Box display="flex" flexDirection="column" gap={2}>
            <UpcomingEvents />
            <CoursesSummary />
          </Box>
        </Box>
      </Box>

      {/* ── Generic Modal ────────────────────────────────────────── */}
      {modal && (
        <GenericFormModal
          open
          onClose={() => setModal(null)}
          title={
            modal.editId
              ? modal.type === "task"
                ? "ערוך משימה"
                : "ערוך מטלה"
              : modal.type === "task"
                ? "הוסף משימה"
                : "הוסף מטלה"
          }
          fields={modal.type === "task" ? TASK_FIELDS : ASSIGNMENT_FIELDS}
          values={modal.values}
          onChange={(name: any, value: any) =>
            setModal((prev) =>
              prev
                ? { ...prev, values: { ...prev.values, [name]: value } }
                : null
            )
          }
          onSave={handleModalSave}
        />
      )}
    </Box>
  );
};
