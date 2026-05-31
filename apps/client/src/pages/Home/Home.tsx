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
  createGeneralTask,
  createHomeAssignment,
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
      { label: "15 דקות", value: "15" },
      { label: "30 דקות", value: "30" },
      { label: "שעה", value: "60" },
      { label: "שעתיים", value: "120" },
    ],
  },
];

const ASSIGNMENT_FIELDS: FormField[] = [
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
      { label: "שיעורי בית", value: "homework" },
      { label: "תרגול", value: "practice" },
      { label: "פרויקט", value: "project" },
      { label: "דוח", value: "report" },
      { label: "מעבדה", value: "lab" },
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

  const createTaskMutation = useMutation({
    mutationFn: createGeneralTask,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: homeDashboardQueryKey });
    },
  });

  const createAssignmentMutation = useMutation({
    mutationFn: createHomeAssignment,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: homeDashboardQueryKey });
    },
  });

  // ── Rows ──────────────────────────────────────────────────────────────────────

  const todoRows: TodoItem[] = useMemo(
    () =>
      (data?.todos ?? []).map((item) => ({
        ...item,
        dueDate: new Date(item.dueDate),
      })),
    [data?.todos]
  );

  const assignmentRows: AssignmentItem[] = useMemo(
    () =>
      (data?.assignments ?? []).map((item) => ({
        ...item,
        dueDate: new Date(item.dueDate),
      })),
    [data?.assignments]
  );

  const assignmentCourseOptions = useMemo(() => {
    const uniqueCourseTitles = Array.from(
      new Set((data?.coursesSummary ?? []).map((course) => course.courseTitle))
    ).filter(Boolean);

    return uniqueCourseTitles.map((courseTitle) => ({
      label: courseTitle,
      value: courseTitle,
    }));
  }, [data?.coursesSummary]);

  const assignmentFormFields = useMemo<FormField[]>(
    () => [
      {
        type: "select",
        name: "course",
        label: "שם הקורס",
        options: assignmentCourseOptions,
      },
      ...ASSIGNMENT_FIELDS,
    ],
    [assignmentCourseOptions]
  );

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleTodoToggle = (id: string, currentDone: boolean) => {
    updateTask({ id, done: !currentDone });
  };

  const handleAssignmentStatusCycle = (row: AssignmentItem) => {
    updateAssignmentMutation.mutate({
      id: row.id,
      payload: { status: getNextValue(ASSIGNMENT_STATUSES, row.status) },
    });
  };

  const handleAssignmentTypeCycle = (row: AssignmentItem) => {
    updateAssignmentMutation.mutate({
      id: row.id,
      payload: { type: getNextValue(ASSIGNMENT_TYPES, row.type) },
    });
  };

  const openAssignmentModal = () => {
    if (assignmentCourseOptions.length === 0) {
      return;
    }

    setModal({ type: "assignment", values: {} });
  };

  // ── Modal save handler ────────────────────────────────────────────────────────

  const handleModalSave = (values: FormValues) => {
    if (!modal) return;

    if (modal.type === "task") {
      const estimatedMinutes = parseInt(values.estimatedTime ?? "30", 10);
      createTaskMutation.mutate({
        title: values.title ?? "משימה",
        dueDate: values.dueDate ?? new Date().toISOString(),
        estimatedTimeValue: Math.max(1, estimatedMinutes),
        estimatedTimeUnit: "minutes",
      });
    }

    if (modal.type === "assignment") {
      createAssignmentMutation.mutate({
        course: values.course ?? "",
        title: values.title ?? "מטלה",
        dueDate: values.dueDate ?? new Date().toISOString(),
        status: (values.status as ItemStatus) ?? "not started",
        type: (values.type as AssignmentType) ?? "homework",
      });
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
            <SectionCard title="Assignments" onNext={openAssignmentModal}>
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
                onClick={openAssignmentModal}
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
          fields={modal.type === "task" ? TASK_FIELDS : assignmentFormFields}
          values={modal.values}
          onChange={(name: string, value: string) =>
            setModal((prev) =>
              prev
                ? { ...prev, values: { ...prev.values, [name]: value } }
                : null
            )
          }
          onSave={handleModalSave}
          saveLabel="שמור"
          cancelLabel="ביטול"
        />
      )}
    </Box>
  );
};
