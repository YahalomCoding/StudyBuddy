import {
  type AssignmentItem,
  type AssignmentType,
  type ItemStatus,
  type TodoItem,
} from "@studybuddy/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  createCourseSummary,
  createGeneralTask,
  createHomeAssignment,
  deleteCourseSummaryItem,
  deleteGeneralTask,
  deleteHomeAssignment,
  getHomeDashboard,
  homeDashboardQueryKey,
  updateAssignment,
  updateGeneralTask,
} from "../../api/home";
import type { FormValues } from "../../components/GenericFormModal/GenericFormModal";
import { buildAssignmentFields, type HomeModalType } from "./formConfig";
import {
  applyOptimisticAssignmentUpdate,
  applyOptimisticTodoDoneUpdate,
  applyOptimisticTodoEstimatedTimeUpdate,
  rollbackOptimisticDashboardUpdate,
  rollbackOptimisticTodoDoneUpdate,
} from "./functions";
import { ASSIGNMENT_STATUSES, ASSIGNMENT_TYPES, getNextValue } from "./utils";

type ModalState = { type: HomeModalType; values: FormValues; editId?: string };

export const useHomeState = () => {
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
  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [courseModalValues, setCourseModalValues] = useState<FormValues>({
    courseTitle: "",
    semesterLabel: "1",
  });
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
    onError: (_e, _v, context) => {
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
    onError: (_e, _v, context) => {
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
    onError: (_e, _v, context) => {
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

  const createCourseMutation = useMutation({
    mutationFn: createCourseSummary,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: homeDashboardQueryKey });
      setCourseModalOpen(false);
      setCourseModalValues({ courseTitle: "", semesterLabel: "1" });
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

  const deleteCourseMutation = useMutation({
    mutationFn: deleteCourseSummaryItem,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: homeDashboardQueryKey });
      setSelectedCourseTitle(null);
    },
  });

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

  const filteredAssignmentRows = useMemo(
    () =>
      selectedCourseTitle
        ? assignmentRows.filter((r) => r.course === selectedCourseTitle)
        : assignmentRows,
    [assignmentRows, selectedCourseTitle]
  );

  const assignmentCourseOptions = useMemo(() => {
    const uniqueTitles = Array.from(
      new Set((data?.coursesSummary ?? []).map((c) => c.courseTitle))
    ).filter(Boolean);
    return uniqueTitles.map((t) => ({ label: t, value: t }));
  }, [data?.coursesSummary]);

  const assignmentFormFields = useMemo(
    () => buildAssignmentFields(assignmentCourseOptions),
    [assignmentCourseOptions]
  );
  const canCreateAssignment = assignmentCourseOptions.length > 0;
  const assignmentEditFields = useMemo(
    () => assignmentFormFields.filter((f) => f.name !== "course"),
    [assignmentFormFields]
  );

  const handleTodoToggle = (id: string, currentDone: boolean) =>
    updateTask({ id, done: !currentDone });

  const handleAssignmentStatusCycle = (row: AssignmentItem) =>
    updateAssignmentMutation.mutate({
      id: row.id,
      payload: { status: getNextValue(ASSIGNMENT_STATUSES, row.status) },
    });

  const handleAssignmentTypeCycle = (row: AssignmentItem) =>
    updateAssignmentMutation.mutate({
      id: row.id,
      payload: { type: getNextValue(ASSIGNMENT_TYPES, row.type) },
    });

  const handleAddTodoFromAssignment = (row: AssignmentItem) =>
    createTaskMutation.mutate({
      title: `מטלה: ${row.title}`,
      dueDate: row.dueDate.toISOString(),
      estimatedTimeValue: 30,
      estimatedTimeUnit: "minutes",
    });

  const openAssignmentModal = () => {
    if (canCreateAssignment) setModal({ type: "assignment", values: {} });
  };

  const openTaskEditModal = (row: TodoItem) =>
    setModal({
      type: "task",
      editId: row.id,
      values: {
        title: row.title,
        dueDate: row.dueDate.toISOString().slice(0, 10),
        estimatedTime: String(row.estimatedTime.value),
      },
    });

  const openAssignmentEditModal = (row: AssignmentItem) =>
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

  const openCourseModal = () => {
    setCourseModalValues({ courseTitle: "", semesterLabel: "1" });
    setCourseModalOpen(true);
  };

  const handleCourseModalSave = (values: FormValues) => {
    const credits = parseFloat(values.credits ?? "");
    createCourseMutation.mutate({
      courseTitle: values.courseTitle?.trim() ?? "",
      semesterNumber: parseInt(values.semesterLabel ?? "1", 10),
      credits: isNaN(credits) ? undefined : credits,
    });
  };

  const handleCourseOpen = (
    courseTitle: string,
    studentSemesterCourseId: string
  ) => {
    setCourseDetailsCourseTitle(courseTitle);
    setCourseDetailsStudentSemesterCourseId(studentSemesterCourseId);
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

  return {
    data,
    isInitialLoading,
    isError,
    modal,
    setModal,
    selectedTodoId,
    setSelectedTodoId,
    selectedAssignmentId,
    setSelectedAssignmentId,
    hoveredTodoId,
    setHoveredTodoId,
    hoveredAssignmentId,
    setHoveredAssignmentId,
    selectedCourseTitle,
    setSelectedCourseTitle,
    courseModalOpen,
    courseModalValues,
    setCourseModalValues,
    courseDetailsOpen,
    courseDetailsCourseTitle,
    courseDetailsStudentSemesterCourseId,
    todoRows,
    filteredAssignmentRows,
    assignmentFormFields,
    assignmentEditFields,
    canCreateAssignment,
    createTaskMutation,
    deleteTaskMutation,
    deleteAssignmentMutation,
    updateTodoEstimatedTimeMutation,
    handleTodoToggle,
    handleAssignmentStatusCycle,
    handleAssignmentTypeCycle,
    handleAddTodoFromAssignment,
    openAssignmentModal,
    openTaskEditModal,
    openAssignmentEditModal,
    openCourseModal,
    handleCourseModalSave,
    handleCourseOpen,
    handleCourseDetailsClose,
    handleModalSave,
    deleteCourse: (id: string) => deleteCourseMutation.mutate(id),
    onCloseCourseModal: () => {
      setCourseModalOpen(false);
      setCourseModalValues({ courseTitle: "", semesterLabel: "1" });
    },
    onChangeCourseModal: (name: string, value: string) =>
      setCourseModalValues((prev) => ({ ...prev, [name]: value })),
    onChangeModal: (name: string, value: string) =>
      setModal((prev) =>
        prev ? { ...prev, values: { ...prev.values, [name]: value } } : null
      ),
  };
};
