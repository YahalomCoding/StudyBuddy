import AddIcon from "@mui/icons-material/Add";
import AddTaskIcon from "@mui/icons-material/AddTask";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
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
  deleteGeneralTask,
  deleteHomeAssignment,
  getHomeDashboard,
  homeDashboardQueryKey,
  updateAssignment,
  updateGeneralTask,
} from "../../api/home";
import { ChatBotBubble } from "../../components/Chatbot";
import { CoursesSummary } from "../../components/CoursesSummery/CoursesSummery";
import { CourseDetailsModal } from "../../components/CourseDetailsModal";
import {
  GenericFormModal,
  type FormValues,
} from "../../components/GenericFormModal/GenericFormModal";
import { HomeAiFeatures } from "../../components/HomeAiFeatures/HomeAiFeatures";
import { UpcomingEvents } from "../../components/UpcomingEvents";
import {
  buildAssignmentFields,
  getHomeModalTitle,
  TASK_FIELDS,
  type HomeModalType,
} from "./formConfig";
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

// ─── Modal state type ──────────────────────────────────────────────────────────

type ModalState = {
  type: HomeModalType;
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

export const Home = () => {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, isFetched } = useQuery({
    queryKey: homeDashboardQueryKey,
    queryFn: getHomeDashboard,
  });
  const isInitialLoading = isLoading && !isFetched;

  const [modal, setModal] = useState<ModalState | null>(null);
  const [selectedTodoId, setSelectedTodoId] = useState<string | null>(null);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<
    string | null
  >(null);
  const [hoveredTodoId, setHoveredTodoId] = useState<string | null>(null);
  const [hoveredAssignmentId, setHoveredAssignmentId] = useState<string | null>(
    null
  );
  const [selectedCourseTitle, setSelectedCourseTitle] = useState<string | null>(
    null
  );
  const [courseDetailsOpen, setCourseDetailsOpen] = useState(false);
  const [courseDetailsCourseTitle, setCourseDetailsCourseTitle] = useState<
    string | null
  >(null);
  const [
    courseDetailsStudentSemesterCourseId,
    setCourseDetailsStudentSemesterCourseId,
  ] = useState<string | null>(null);

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
      payload: {
        title?: string;
        dueDate?: string;
        status?: ItemStatus;
        type?: AssignmentType;
      };
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

  const updateTodoDetailsMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: {
        title?: string;
        dueDate?: string;
        estimatedTimeValue?: number;
        estimatedTimeUnit?: "minutes" | "hours" | "days";
      };
    }) => updateGeneralTask(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: homeDashboardQueryKey });
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

  const deleteTaskMutation = useMutation({
    mutationFn: deleteGeneralTask,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: homeDashboardQueryKey });
      setSelectedTodoId(null);
      setHoveredTodoId(null);
    },
  });

  const deleteAssignmentMutation = useMutation({
    mutationFn: deleteHomeAssignment,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: homeDashboardQueryKey });
      setSelectedAssignmentId(null);
      setHoveredAssignmentId(null);
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

  const filteredAssignmentRows = useMemo(() => {
    if (!selectedCourseTitle) {
      return assignmentRows;
    }

    return assignmentRows.filter((row) => row.course === selectedCourseTitle);
  }, [assignmentRows, selectedCourseTitle]);

  const assignmentCourseOptions = useMemo(() => {
    const uniqueCourseTitles = Array.from(
      new Set((data?.coursesSummary ?? []).map((course) => course.courseTitle))
    ).filter(Boolean);

    return uniqueCourseTitles.map((courseTitle) => ({
      label: courseTitle,
      value: courseTitle,
    }));
  }, [data?.coursesSummary]);

  const assignmentFormFields = useMemo(
    () => buildAssignmentFields(assignmentCourseOptions),
    [assignmentCourseOptions]
  );

  const assignmentEditFields = useMemo(
    () => assignmentFormFields.filter((field) => field.name !== "course"),
    [assignmentFormFields]
  );

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

  const handleAddTodoFromAssignment = (row: AssignmentItem) => {
    createTaskMutation.mutate({
      title: `מטלה: ${row.title}`,
      dueDate: row.dueDate.toISOString(),
      estimatedTimeValue: 30,
      estimatedTimeUnit: "minutes",
    });
  };

  const openAssignmentModal = () => {
    if (assignmentCourseOptions.length === 0) {
      return;
    }

    setModal({ type: "assignment", values: {} });
  };

  const openTaskEditModal = (row: TodoItem) => {
    setModal({
      type: "task",
      editId: row.id,
      values: {
        title: row.title,
        dueDate: row.dueDate.toISOString().slice(0, 10),
        estimatedTime: String(row.estimatedTime.value),
      },
    });
  };

  const openAssignmentEditModal = (row: AssignmentItem) => {
    setModal({
      type: "assignment",
      editId: row.id,
      values: {
        title: row.title,
        dueDate: row.dueDate.toISOString().slice(0, 10),
        status: row.status,
        type: row.type,
      },
    });
  };

  const handleCourseSelect = (courseTitle: string | null) => {
    setSelectedCourseTitle(courseTitle);
  };

  const handleCourseOpen = (
    courseTitle: string,
    studentSemesterCourseId: string
  ) => {
    setCourseDetailsCourseTitle(courseTitle);
    setCourseDetailsStudentSemesterCourseId(
      studentSemesterCourseId
    );
    setCourseDetailsOpen(true);
  };

  const handleCourseDetailsClose = () => {
    setCourseDetailsOpen(false);
    setCourseDetailsCourseTitle(null);
    setCourseDetailsStudentSemesterCourseId(null);
  };

  const handleModalSave = (values: FormValues) => {
    if (!modal) return;

    if (modal.type === "task") {
      const estimatedMinutes = parseInt(values.estimatedTime ?? "30", 10);

      if (modal.editId) {
        updateTodoDetailsMutation.mutate({
          id: modal.editId,
          payload: {
            title: values.title ?? "משימה",
            dueDate: values.dueDate ?? new Date().toISOString(),
            estimatedTimeValue: Math.max(1, estimatedMinutes),
            estimatedTimeUnit: "minutes",
          },
        });
        setModal(null);
        return;
      }

      createTaskMutation.mutate({
        title: values.title ?? "משימה",
        dueDate: values.dueDate ?? new Date().toISOString(),
        estimatedTimeValue: Math.max(1, estimatedMinutes),
        estimatedTimeUnit: "minutes",
      });
    }

    if (modal.type === "assignment") {
      if (modal.editId) {
        updateAssignmentMutation.mutate({
          id: modal.editId,
          payload: {
            title: values.title ?? "מטלה",
            dueDate: values.dueDate ?? new Date().toISOString(),
            status: (values.status as ItemStatus) ?? "not started",
            type: (values.type as AssignmentType) ?? "assignment",
          },
        });
        setModal(null);
        return;
      }

      createAssignmentMutation.mutate({
        course: values.course ?? "",
        title: values.title ?? "מטלה",
        dueDate: values.dueDate ?? new Date().toISOString(),
        status: "not started",
        type: (values.type as AssignmentType) ?? "assignment",
      });
    }

    setModal(null);
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", p: 0 }}>
      <ChatBotBubble
        exampleQuestions={["What should I do for the upcoming exams?"]}
      />

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
        <Typography fontWeight={500}>בית </Typography>
      </Box>

      <Box sx={{ p: 3, maxWidth: 1100, mx: "auto" }}>
        {selectedCourseTitle && (
          <Box display="flex" justifyContent="flex-end" mb={1.5}>
            <Chip
              label={`מסונן לפי: ${selectedCourseTitle}`}
              onDelete={() => setSelectedCourseTitle(null)}
              color="primary"
              variant="outlined"
            />
          </Box>
        )}

        <HomeAiFeatures />

        {/* ── Two-column grid ────────────────────────────────────── */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "minmax(0, 1.45fr) minmax(0, 0.85fr)",
            },
            gap: 2,
          }}
        >
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
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto auto auto auto",
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
                <Typography
                  fontSize={12}
                  color="text.secondary"
                  textAlign="center"
                >
                  פעולות
                </Typography>
              </Box>

              {todoRows.map((row) => (
                <Box
                  key={row.id}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto auto auto auto",
                    gap: 1,
                    alignItems: "center",
                    py: 0.8,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    cursor: "pointer",
                    transition: "background-color 0.18s ease",
                    ...(selectedTodoId === row.id && {
                      bgcolor: "action.selected",
                    }),
                    ...(hoveredTodoId === row.id && {
                      bgcolor: "action.hover",
                    }),
                    "&:last-of-type": { borderBottom: "none" },
                  }}
                  onMouseEnter={() => setHoveredTodoId(row.id)}
                  onMouseLeave={() =>
                    setHoveredTodoId((prev) => (prev === row.id ? null : prev))
                  }
                  onClick={() => setSelectedTodoId(row.id)}
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
                  <Box display="flex" justifyContent="center" gap={0.3}>
                    {(selectedTodoId === row.id ||
                      hoveredTodoId === row.id) && (
                      <>
                        <IconButton
                          size="small"
                          aria-label="ערוך משימה"
                          onClick={(event) => {
                            event.stopPropagation();
                            openTaskEditModal(row);
                          }}
                          sx={{ p: 0.4 }}
                        >
                          <EditOutlinedIcon sx={{ fontSize: 17 }} />
                        </IconButton>
                        <IconButton
                          size="small"
                          aria-label="מחק משימה"
                          onClick={(event) => {
                            event.stopPropagation();
                            deleteTaskMutation.mutate(row.id);
                          }}
                          disabled={deleteTaskMutation.isPending}
                          sx={{ p: 0.4 }}
                        >
                          <DeleteOutlineIcon sx={{ fontSize: 17 }} />
                        </IconButton>
                      </>
                    )}
                  </Box>
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
                  gridTemplateColumns: "auto auto 1fr auto auto auto auto auto",
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
                <Typography
                  fontSize={12}
                  color="text.secondary"
                  textAlign="center"
                >
                  לטודו
                </Typography>
                <Typography
                  fontSize={12}
                  color="text.secondary"
                  textAlign="center"
                >
                  פעולות
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

              {filteredAssignmentRows.map((row) => {
                const relativeDueDate = getRelativeDueDate(
                  row.dueDate,
                  row.status
                );
                return (
                  <Box
                    key={row.id}
                    sx={{
                      display: "grid",
                      gridTemplateColumns:
                        "auto auto 1fr auto auto auto auto auto",
                      gap: 1,
                      alignItems: "center",
                      py: 0.8,
                      borderBottom: "1px solid",
                      borderColor: "divider",
                      cursor: "pointer",
                      transition: "background-color 0.18s ease",
                      ...(selectedAssignmentId === row.id && {
                        bgcolor: "action.selected",
                      }),
                      ...(hoveredAssignmentId === row.id && {
                        bgcolor: "action.hover",
                      }),
                      "&:last-of-type": { borderBottom: "none" },
                      ...(isOverdue(relativeDueDate) && {
                        bgcolor: "var(--sb-home-overdue-row-bg)",
                        borderColor: "var(--sb-home-overdue-row-border)",
                      }),
                    }}
                    onMouseEnter={() => setHoveredAssignmentId(row.id)}
                    onMouseLeave={() =>
                      setHoveredAssignmentId((prev) =>
                        prev === row.id ? null : prev
                      )
                    }
                    onClick={() => setSelectedAssignmentId(row.id)}
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
                    <Box display="flex" justifyContent="center">
                      <IconButton
                        size="small"
                        onClick={() => handleAddTodoFromAssignment(row)}
                        disabled={createTaskMutation.isPending}
                        aria-label="הוסף לטודו"
                        sx={{ p: 0.4 }}
                      >
                        <AddTaskIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Box>
                    <Box display="flex" justifyContent="center" gap={0.3}>
                      {(selectedAssignmentId === row.id ||
                        hoveredAssignmentId === row.id) && (
                        <>
                          <IconButton
                            size="small"
                            aria-label="ערוך מטלה"
                            onClick={(event) => {
                              event.stopPropagation();
                              openAssignmentEditModal(row);
                            }}
                            sx={{ p: 0.4 }}
                          >
                            <EditOutlinedIcon sx={{ fontSize: 17 }} />
                          </IconButton>
                          <IconButton
                            size="small"
                            aria-label="מחק מטלה"
                            onClick={(event) => {
                              event.stopPropagation();
                              deleteAssignmentMutation.mutate(row.id);
                            }}
                            disabled={deleteAssignmentMutation.isPending}
                            sx={{ p: 0.4 }}
                          >
                            <DeleteOutlineIcon sx={{ fontSize: 17 }} />
                          </IconButton>
                        </>
                      )}
                    </Box>
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
            <UpcomingEvents selectedCourseTitle={selectedCourseTitle} />
            <CoursesSummary
              selectedCourseTitle={selectedCourseTitle}
              onCourseSelect={handleCourseSelect}
              onCourseOpen={handleCourseOpen}
            />
          </Box>
        </Box>
      </Box>

      {/* ── Generic Modal ────────────────────────────────────────── */}
      {modal && (
        <GenericFormModal
          open
          onClose={() => setModal(null)}
          title={getHomeModalTitle(modal)}
          fields={
            modal.type === "task"
              ? TASK_FIELDS
              : modal.editId
                ? assignmentEditFields
                : assignmentFormFields
          }
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

      <CourseDetailsModal
        open={courseDetailsOpen}
        studentSemesterCourseId={
          courseDetailsStudentSemesterCourseId
        }
        courseTitle={courseDetailsCourseTitle}
        onClose={handleCourseDetailsClose}
      />
    </Box>
  );
};