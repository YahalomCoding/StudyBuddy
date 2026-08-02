import {
  alpha,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import type {
  HomeDashboardAssignment,
  HomeDashboardResponse,
} from "../../api/home";
import {
  getHomeDashboard,
  homeDashboardQueryKey,
  updateAssignment,
} from "../../api/home";
import { formatDueDate, getRelativeDueDate } from "../Home/utils";
import { useStyles } from "./style";

const COLUMN_CONFIG = [
  {
    id: "not started" as const,
    title: "לא התחיל",
    color: "#f59e0b",
  },
  {
    id: "active" as const,
    title: "בתהליך",
    color: "#3b82f6",
  },
  {
    id: "done" as const,
    title: "הושלם",
    color: "#10b981",
  },
];

const statusToDisplayName = (status: HomeDashboardAssignment["status"]) => {
  switch (status) {
    case "active":
      return "בתהליך";
    case "done":
      return "הושלם";
    default:
      return "לא התחיל";
  }
};

const typeToDisplayName = (type: HomeDashboardAssignment["type"]) => {
  switch (type) {
    case "homework":
      return "שיעורי בית";
    case "practice":
      return "תרגול";
    case "project":
      return "פרויקט";
    case "report":
      return 'דו"ח';
    case "lab":
      return "מעבדה";
    default:
      return "מטלה";
  }
};

const getDaysLeftLabel = (
  dueDate: string,
  status: HomeDashboardAssignment["status"]
) => {
  const relativeDueDate = getRelativeDueDate(new Date(dueDate), status);

  if (status === "done") {
    return "הושלם";
  }

  if (relativeDueDate.kind === "today") {
    return "היום";
  }

  if (relativeDueDate.kind === "due_in") {
    return relativeDueDate.days === 1
      ? "נותר יום אחד"
      : `נותרו ${relativeDueDate.days} ימים`;
  }

  if (relativeDueDate.kind === "overdue") {
    return relativeDueDate.days === 1
      ? "יום אחד באיחור"
      : `${relativeDueDate.days} ימים באיחור`;
  }

  return "";
};

export const AssignmentsPage = () => {
  const classes = useStyles();
  const queryClient = useQueryClient();
  const [draggedAssignmentId, setDraggedAssignmentId] = useState<string | null>(
    null
  );

  const { data, isLoading } = useQuery({
    queryKey: homeDashboardQueryKey,
    queryFn: getHomeDashboard,
  });

  const assignmentMutation = useMutation({
    mutationFn: ({
      assignmentId,
      status,
    }: {
      assignmentId: string;
      status: HomeDashboardAssignment["status"];
    }) => updateAssignment(assignmentId, { status }),
    onMutate: async ({ assignmentId, status }) => {
      await queryClient.cancelQueries({ queryKey: homeDashboardQueryKey });

      const previousData = queryClient.getQueryData<HomeDashboardResponse>(
        homeDashboardQueryKey
      );

      queryClient.setQueryData<HomeDashboardResponse>(
        homeDashboardQueryKey,
        (current) => {
          if (!current) {
            return current;
          }

          return {
            ...current,
            assignments: current.assignments.map((assignment) =>
              assignment.id === assignmentId
                ? { ...assignment, status }
                : assignment
            ),
          };
        }
      );

      return { previousData };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(homeDashboardQueryKey, context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: homeDashboardQueryKey });
    },
  });

  const assignments = useMemo(
    () => data?.assignments ?? [],
    [data?.assignments]
  );

  const groupedAssignments = useMemo(() => {
    return COLUMN_CONFIG.reduce(
      (acc, column) => {
        acc[column.id] = assignments.filter(
          (assignment) => assignment.status === column.id
        );
        return acc;
      },
      {} as Record<
        (typeof COLUMN_CONFIG)[number]["id"],
        HomeDashboardAssignment[]
      >
    );
  }, [assignments]);

  const handleDrop = (status: HomeDashboardAssignment["status"]) => {
    if (!draggedAssignmentId) {
      return;
    }

    const assignment = assignments.find(
      (item) => item.id === draggedAssignmentId
    );
    if (!assignment || assignment.status === status) {
      setDraggedAssignmentId(null);
      return;
    }

    assignmentMutation.mutate({ assignmentId: draggedAssignmentId, status });
    setDraggedAssignmentId(null);
  };

  return (
    <Box className={classes.page}>
      <Box className={classes.topBar}>
        <Typography className={classes.topBarTitle}>מטלות</Typography>
      </Box>

      <Stack spacing={3} className={classes.pageContent}>
        <Box className={classes.header}>
          <Typography variant="h4" className={classes.title}>
            לוח מטלות
          </Typography>
          <Typography variant="body1" className={classes.subtitle}>
            גרור כרטיסים בין העמודות כדי לעדכן את הסטטוס באופן מיידי.
          </Typography>
        </Box>

        {isLoading ? (
          <Box className={classes.loaderBox}>
            <CircularProgress />
          </Box>
        ) : (
          <Box className={classes.boardGrid}>
            {COLUMN_CONFIG.map((column) => (
              <Box
                key={column.id}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => handleDrop(column.id)}
                className={classes.column}
                style={{
                  backgroundColor: alpha(column.color, 0.08),
                  borderColor: alpha(column.color, 0.28),
                }}
              >
                <Stack spacing={1.5}>
                  <Box className={classes.columnHeader}>
                    <Typography variant="h6" className={classes.columnTitle}>
                      {column.title}
                    </Typography>
                  </Box>
                  <Divider />
                  <Stack spacing={1.5} className={classes.columnBody}>
                    {groupedAssignments[column.id].length === 0 ? (
                      <Box className={classes.emptyState}>אין מטלות עדיין.</Box>
                    ) : (
                      groupedAssignments[column.id].map((assignment) => (
                        <Card
                          key={assignment.id}
                          draggable
                          onDragStart={() =>
                            setDraggedAssignmentId(assignment.id)
                          }
                          onDragEnd={() => setDraggedAssignmentId(null)}
                          className={classes.assignmentCard}
                        >
                          <CardContent className={classes.cardContent}>
                            <Stack spacing={1.2} className={classes.cardInner}>
                              <Typography
                                variant="subtitle1"
                                className={classes.assignmentTitle}
                              >
                                {assignment.title}
                              </Typography>
                              <Typography
                                variant="body2"
                                className={classes.assignmentCourse}
                              >
                                {assignment.course}
                              </Typography>
                              <Stack className={classes.chipRow}>
                                <Chip
                                  className={classes.typeChip}
                                  label={typeToDisplayName(assignment.type)}
                                  size="small"
                                  variant="filled"
                                />
                                <Chip
                                  className={classes.statusChip}
                                  label={statusToDisplayName(assignment.status)}
                                  size="small"
                                  color={
                                    assignment.status === "done"
                                      ? "success"
                                      : assignment.status === "active"
                                        ? "primary"
                                        : "default"
                                  }
                                />
                              </Stack>
                              <Stack className={classes.metaRow}>
                                <Typography
                                  variant="caption"
                                  className={classes.dueDateText}
                                >
                                  תאריך יעד: {formatDueDate(assignment.dueDate)}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  className={classes.daysLabel}
                                  color={
                                    assignment.status === "done"
                                      ? "success.main"
                                      : getDaysLeftLabel(
                                            assignment.dueDate,
                                            assignment.status
                                          ).includes("באיחור")
                                        ? "error.main"
                                        : "primary.main"
                                  }
                                  fontWeight={700}
                                >
                                  {getDaysLeftLabel(
                                    assignment.dueDate,
                                    assignment.status
                                  )}
                                </Typography>
                              </Stack>
                            </Stack>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </Stack>
                </Stack>
              </Box>
            ))}
          </Box>
        )}
      </Stack>
    </Box>
  );
};
