import {
  Box,
  Checkbox,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import {
  type AssignmentItem,
  type AssignmentType,
  type ItemStatus,
  type TodoItem,
} from "@studybuddy/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import {
  getHomeDashboard,
  homeDashboardQueryKey,
  updateAssignment,
  updateGeneralTask,
} from "../../api/home";
import { ChatBotBubble } from "../../components/Chatbot";
import { CoursesSummary } from "../../components/CoursesSummery/CoursesSummery";
import { UpcomingEvents } from "../../components/UpcomingEvents";
import {
  applyOptimisticAssignmentUpdate,
  applyOptimisticTodoDoneUpdate,
  applyOptimisticTodoEstimatedTimeUpdate,
  rollbackOptimisticDashboardUpdate,
  rollbackOptimisticTodoDoneUpdate,
} from "./functions";
import { statusChipClass, typeChipClass, useStyles } from "./style";
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

export const Home = () => {
  const classes = useStyles();
  const queryClient = useQueryClient();
  const { data, isLoading, isError, isFetched } = useQuery({
    queryKey: homeDashboardQueryKey,
    queryFn: getHomeDashboard,
  });
  const isInitialLoading = isLoading && !isFetched;

  const {mutate: updateTask} = useMutation({
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
        status?: ItemStatus;
        type?: AssignmentType;
      };
    }) => updateAssignment(id, payload),
    onMutate: ({ id, payload }) =>
      applyOptimisticAssignmentUpdate(queryClient, id, payload),
    onError: (_error, _variables, context) => {
      rollbackOptimisticDashboardUpdate(queryClient, context?.previousDashboard);
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
      rollbackOptimisticDashboardUpdate(queryClient, context?.previousDashboard);
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

  const handleTodoToggle = (id: string, currentDone: boolean) => {
    updateTask({ id, done: !currentDone });
  };

  const handleTodoEstimatedTimeCycle = (row: TodoItem) => {
    const nextEstimatedTimeValue =
      row.estimatedTime.value >= 120 ? 15 : row.estimatedTime.value + 15;

    updateTodoEstimatedTimeMutation.mutate({
      id: row.id,
      estimatedTimeValue: nextEstimatedTimeValue,
      estimatedTimeUnit: row.estimatedTime.unit,
    });
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

  return (
    <Box className={classes.page}>
      <ChatBotBubble exampleQuestions={["What exams do I have this week?"]} />

      <Box className={classes.content}>
        <Box className={classes.header}>
          <Typography variant="h4" component="h1" className={classes.title}>
            לוח לימודים
          </Typography>
        </Box>

        <Box className={classes.dashboardGrid}>
          <Box className={classes.todoArea}>
            <Box className={classes.section}>
              <Typography variant="h6" className={classes.sectionTitle}>
                To Do
              </Typography>

              <Paper elevation={0} className={classes.tablePaper}>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow className={classes.tableHeadRow}>
                        <TableCell align="right">שם משימה</TableCell>
                        <TableCell align="right">תאריך יעד</TableCell>
                        <TableCell align="right">בוצע</TableCell>
                        <TableCell align="right">זמן משוער</TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {isInitialLoading ? (
                        <TableRow>
                          <TableCell colSpan={4} align="center">
                            טוען...
                          </TableCell>
                        </TableRow>
                      ) : null}
                      {isError ? (
                        <TableRow>
                          <TableCell colSpan={4} align="center">
                            לא הצלחנו לטעון משימות כרגע
                          </TableCell>
                        </TableRow>
                      ) : null}
                      {todoRows.map((row) => (
                        <TableRow key={row.id} hover>
                          <TableCell
                            align="right"
                            className={classes.taskNameCell}
                          >
                            {row.title}
                          </TableCell>
                          <TableCell align="right">
                            {formatDueDate(row.dueDate)}
                          </TableCell>
                          <TableCell align="right">
                            <Checkbox
                              checked={row.done}
                              size="small"
                              disableRipple
                              onChange={() => handleTodoToggle(row.id, row.done)}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Typography
                              component="span"
                              onClick={() => handleTodoEstimatedTimeCycle(row)}
                              sx={{ cursor: "pointer" }}
                            >
                              {formatDuration(row.estimatedTime)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Box>
          </Box>

          <Box className={classes.upcomingArea}>
            <Box className={classes.section}>
              <UpcomingEvents />
            </Box>
          </Box>

          <Box className={classes.assignmentsArea}>
            <Box className={classes.section}>
              <Typography variant="h6" className={classes.sectionTitle}>
                Assignments
              </Typography>

              <Paper elevation={0} className={classes.tablePaper}>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow className={classes.tableHeadRow}>
                        <TableCell align="right">סטטוס</TableCell>
                        <TableCell align="right">קורס</TableCell>
                        <TableCell align="right">שם מטלה</TableCell>
                        <TableCell align="right">תאריך יעד</TableCell>
                        <TableCell align="right">סוג</TableCell>
                        <TableCell align="right">ימים שנותרו</TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {isInitialLoading ? (
                        <TableRow>
                          <TableCell colSpan={6} align="center">
                            טוען...
                          </TableCell>
                        </TableRow>
                      ) : null}
                      {isError ? (
                        <TableRow>
                          <TableCell colSpan={6} align="center">
                            לא הצלחנו לטעון מטלות כרגע
                          </TableCell>
                        </TableRow>
                      ) : null}
                      {assignmentRows.map((row) => {
                        const relativeDueDate = getRelativeDueDate(
                          row.dueDate,
                          row.status
                        );

                        return (
                          <TableRow
                            key={row.id}
                            hover
                            className={
                              isOverdue(relativeDueDate)
                                ? classes.overdueRow
                                : undefined
                            }
                          >
                            <TableCell align="right">
                              <Chip
                                label={statusToDisplayName(row.status)}
                                size="small"
                                className={statusChipClass(row.status)}
                                onClick={() => handleAssignmentStatusCycle(row)}
                              />
                            </TableCell>

                            <TableCell align="right">{row.course}</TableCell>

                            <TableCell
                              align="right"
                              className={classes.assignmentNameCell}
                            >
                              {row.title}
                            </TableCell>

                            <TableCell align="right">
                              {formatDueDate(row.dueDate)}
                            </TableCell>

                            <TableCell align="right">
                              <Chip
                                label={assignmentTypeToDisplayName(row.type)}
                                size="small"
                                className={typeChipClass(row.type)}
                                onClick={() => handleAssignmentTypeCycle(row)}
                              />
                            </TableCell>

                            <TableCell
                              align="right"
                              className={
                                isOverdue(relativeDueDate)
                                  ? classes.overdueDaysCell
                                  : classes.regularDaysCell
                              }
                            >
                              {relativeDueDateToDisplayName(relativeDueDate)}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Box>
          </Box>

          <Box className={classes.coursesArea}>
            <Box className={classes.section}>
              <CoursesSummary />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};