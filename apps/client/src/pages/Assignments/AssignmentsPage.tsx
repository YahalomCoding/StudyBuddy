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
import { formatDueDate } from "../Home/utils";

const COLUMN_CONFIG = [
  {
    id: "not started" as const,
    title: "לא התחיל",
    subtitle: "מתוכנן וממתין",
    color: "#f59e0b",
  },
  {
    id: "active" as const,
    title: "בתהליך",
    subtitle: "כרגע נמצא בעבודה",
    color: "#3b82f6",
  },
  {
    id: "done" as const,
    title: "הושלם",
    subtitle: "משימות שהסתיימו",
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

export const AssignmentsPage = () => {
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

  const assignments = data?.assignments ?? [];

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
    <Box
      sx={{
        p: { xs: 2, md: 4 },
        bgcolor: "background.default",
        minHeight: "100vh",
      }}
    >
      <Stack spacing={3}>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            לוח מטלות
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
            גרור כרטיסים בין העמודות כדי לעדכן את הסטטוס באופן מיידי.
          </Typography>
        </Box>

        {isLoading ? (
          <Box display="flex" justifyContent="center" sx={{ py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(3, minmax(0, 1fr))",
              },
              gap: 2.5,
            }}
          >
            {COLUMN_CONFIG.map((column) => (
              <Box
                key={column.id}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => handleDrop(column.id)}
                sx={{
                  minHeight: 420,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 3,
                  bgcolor: alpha(column.color, 0.08),
                  p: 2,
                }}
              >
                <Stack spacing={1.5}>
                  <Box>
                    <Typography variant="h6" fontWeight={700}>
                      {column.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {column.subtitle}
                    </Typography>
                  </Box>
                  <Divider />
                  <Stack spacing={1.5}>
                    {groupedAssignments[column.id].length === 0 ? (
                      <Box
                        sx={{
                          border: "1px dashed",
                          borderColor: "divider",
                          borderRadius: 2,
                          py: 4,
                          textAlign: "center",
                          color: "text.secondary",
                        }}
                      >
                        אין מטלות כאן עדיין.
                      </Box>
                    ) : (
                      groupedAssignments[column.id].map((assignment) => (
                        <Card
                          key={assignment.id}
                          draggable
                          onDragStart={() =>
                            setDraggedAssignmentId(assignment.id)
                          }
                          onDragEnd={() => setDraggedAssignmentId(null)}
                          sx={{
                            cursor: "grab",
                            border: "1px solid",
                            borderColor: "divider",
                            boxShadow: "none",
                            bgcolor: "background.paper",
                            transition: "transform 0.2s ease",
                            "&:hover": {
                              transform: "translateY(-2px)",
                            },
                          }}
                        >
                          <CardContent sx={{ p: 2, pb: "16px !important" }}>
                            <Stack spacing={1.2}>
                              <Typography variant="subtitle1" fontWeight={700}>
                                {assignment.title}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {assignment.course}
                              </Typography>
                              <Stack
                                direction="row"
                                spacing={1}
                                flexWrap="wrap"
                              >
                                <Chip
                                  label={assignment.type}
                                  size="small"
                                  sx={{ textTransform: "capitalize" }}
                                />
                                <Chip
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
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                תאריך יעד: {formatDueDate(assignment.dueDate)}
                              </Typography>
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
