import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  Snackbar,
  Typography,
} from "@mui/material";
import {
  type AssignmentItem,
  type AssignmentType,
  type ItemStatus,
  type TodoItem,
} from "@studybuddy/types";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useMemo, useRef, useState } from "react";
import { importAssignmentsFromIcs } from "../../api/assignments";
import {
  getHomeDashboard,
  homeDashboardQueryKey,
} from "../../api/home";
import {
  statusChipClass,
  typeChipClass,
} from "../Home/style";
import {
  assignmentTypeToDisplayName,
  formatDueDate,
  statusToDisplayName,
} from "../Home/utils";
import { useStyles } from "./style";

type CalendarEventType = "todo" | "assignment";

type CalendarEvent = {
  id: string;
  title: string;
  date: Date;
  eventType: CalendarEventType;
  course?: string;
  done?: boolean;
  status?: ItemStatus;
  type?: AssignmentType;
};

const WEEK_DAYS = [
  "ראשון",
  "שני",
  "שלישי",
  "רביעי",
  "חמישי",
  "שישי",
  "שבת",
];

const isSameDay = (dateA: Date, dateB: Date) =>
  dateA.getFullYear() === dateB.getFullYear() &&
  dateA.getMonth() === dateB.getMonth() &&
  dateA.getDate() === dateB.getDate();

const getMonthLabel = (date: Date) =>
  date.toLocaleDateString("he-IL", {
    month: "long",
    year: "numeric",
  });

const getCalendarDays = (currentMonth: Date) => {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const startDay = firstDayOfMonth.getDay();
  const calendarStart = new Date(year, month, 1 - startDay);

  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(calendarStart);
    day.setDate(calendarStart.getDate() + index);
    return day;
  });
};

export const CalendarPage = () => {
  const classes = useStyles();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [currentMonth, setCurrentMonth] = useState(
    () => new Date(),
  );
  const [selectedDate, setSelectedDate] = useState(
    () => new Date(),
  );
  const [successMessage, setSuccessMessage] = useState<
    string | null
  >(null);
  const [errorMessage, setErrorMessage] = useState<
    string | null
  >(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: homeDashboardQueryKey,
    queryFn: getHomeDashboard,
  });

  const importIcsMutation = useMutation({
    mutationFn: importAssignmentsFromIcs,
    onSuccess: (result) => {
      setSuccessMessage(
        `יובאו ${result.createdCount} מטלות בהצלחה`,
      );
      setErrorMessage(null);

      queryClient.invalidateQueries({
        queryKey: homeDashboardQueryKey,
      });
    },
    onError: () => {
      setErrorMessage(
        "לא הצלחנו לייבא את קובץ לוח השנה",
      );
      setSuccessMessage(null);
    },
  });

  const todoRows: TodoItem[] = useMemo(
    () =>
      (data?.todos ?? []).map((item) => ({
        ...item,
        dueDate: new Date(item.dueDate),
      })),
    [data?.todos],
  );

  const assignmentRows: AssignmentItem[] = useMemo(
    () =>
      (data?.assignments ?? []).map((item) => ({
        ...item,
        dueDate: new Date(item.dueDate),
      })),
    [data?.assignments],
  );

  const calendarEvents: CalendarEvent[] = useMemo(() => {
    const todoEvents: CalendarEvent[] = todoRows.map(
      (todo) => ({
        id: `todo-${todo.id}`,
        title: todo.title,
        date: todo.dueDate,
        eventType: "todo",
        done: todo.done,
      }),
    );

    const assignmentEvents: CalendarEvent[] =
      assignmentRows.map((assignment) => ({
        id: `assignment-${assignment.id}`,
        title: assignment.title,
        date: assignment.dueDate,
        eventType: "assignment",
        course: assignment.course,
        status: assignment.status,
        type: assignment.type,
      }));

    return [...todoEvents, ...assignmentEvents].sort(
      (a, b) => a.date.getTime() - b.date.getTime(),
    );
  }, [todoRows, assignmentRows]);

  const calendarDays = useMemo(
    () => getCalendarDays(currentMonth),
    [currentMonth],
  );

  const selectedDateEvents = useMemo(
    () =>
      calendarEvents.filter((event) =>
        isSameDay(event.date, selectedDate),
      ),
    [calendarEvents, selectedDate],
  );

  const goToPreviousMonth = () => {
    setCurrentMonth(
      (previous) =>
        new Date(
          previous.getFullYear(),
          previous.getMonth() - 1,
          1,
        ),
    );
  };

  const goToNextMonth = () => {
    setCurrentMonth(
      (previous) =>
        new Date(
          previous.getFullYear(),
          previous.getMonth() + 1,
          1,
        ),
    );
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    setSelectedDate(today);
  };

  const handleIcsFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const isIcsFile =
      file.name.toLowerCase().endsWith(".ics") ||
      file.type === "text/calendar";

    if (!isIcsFile) {
      setErrorMessage("יש להעלות קובץ ICS בלבד");
      event.target.value = "";
      return;
    }

    importIcsMutation.mutate(file);
    event.target.value = "";
  };

  return (
    <Box className={classes.page}>
      <Box className={classes.topBar}>
        <Typography className={classes.topBarTitle}>
          לוח שנה
        </Typography>
      </Box>

      <Box className={classes.content}>
        <Box className={classes.header}>
          <Box className={classes.headerTitleArea}>
            <Box className={classes.headerIcon}>
              <CalendarMonthOutlinedIcon />
            </Box>

            <Box minWidth={0}>
              <Typography className={classes.title}>
                לוח שנה
              </Typography>
              <Typography className={classes.subtitle}>
                כל המשימות והמטלות שלך מסודרות לפי תאריכי יעד
              </Typography>
            </Box>
          </Box>

          <Box className={classes.monthActions}>
            <input
              ref={fileInputRef}
              type="file"
              accept=".ics,text/calendar"
              hidden
              onChange={handleIcsFileChange}
            />

            <Button
              variant="contained"
              disableElevation
              startIcon={<UploadFileOutlinedIcon />}
              className={classes.importButton}
              onClick={() => fileInputRef.current?.click()}
              disabled={importIcsMutation.isPending}
            >
              {importIcsMutation.isPending
                ? "מייבא..."
                : "ייבוא קובץ לוח שנה"}
            </Button>

            <IconButton
              className={classes.monthNavigationButton}
              onClick={goToPreviousMonth}
              aria-label="החודש הקודם"
            >
              <ChevronRightIcon fontSize="small" />
            </IconButton>

            <Typography className={classes.monthTitle}>
              {getMonthLabel(currentMonth)}
            </Typography>

            <IconButton
              className={classes.monthNavigationButton}
              onClick={goToNextMonth}
              aria-label="החודש הבא"
            >
              <ChevronLeftIcon fontSize="small" />
            </IconButton>

            <Box
              className={classes.todayButton}
              onClick={goToToday}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" ||
                  event.key === " "
                ) {
                  goToToday();
                }
              }}
            >
              היום
            </Box>
          </Box>
        </Box>

        {isLoading && (
          <Paper
            elevation={0}
            className={classes.loadingCard}
          >
            <CircularProgress size={28} />
            <Typography color="text.secondary">
              טוען לוח שנה...
            </Typography>
          </Paper>
        )}

        {isError && (
          <Paper
            elevation={0}
            className={classes.loadingCard}
          >
            <Typography color="error">
              לא הצלחנו לטעון את לוח השנה כרגע
            </Typography>
          </Paper>
        )}

        {!isLoading && !isError && (
          <Box className={classes.calendarLayout}>
            <Paper
              elevation={0}
              className={classes.calendarCard}
            >
              <Box className={classes.weekHeader}>
                {WEEK_DAYS.map((day) => (
                  <Typography
                    key={day}
                    className={classes.weekDay}
                  >
                    {day}
                  </Typography>
                ))}
              </Box>

              <Box className={classes.daysGrid}>
                {calendarDays.map((day) => {
                  const isCurrentMonth =
                    day.getMonth() ===
                    currentMonth.getMonth();
                  const isToday = isSameDay(
                    day,
                    new Date(),
                  );
                  const isSelected = isSameDay(
                    day,
                    selectedDate,
                  );

                  const dayEvents = calendarEvents.filter(
                    (event) =>
                      isSameDay(event.date, day),
                  );

                  return (
                    <Box
                      key={day.toISOString()}
                      className={classes.dayCell}
                      data-current-month={isCurrentMonth}
                      data-today={isToday}
                      data-selected={isSelected}
                      onClick={() => setSelectedDate(day)}
                    >
                      <Box
                        className={classes.dayNumberRow}
                      >
                        <Typography
                          className={`${classes.dayNumber} ${
                            isToday
                              ? classes.todayNumber
                              : ""
                          }`}
                        >
                          {day.getDate()}
                        </Typography>

                        {dayEvents.length > 0 && (
                          <Typography
                            className={classes.eventCount}
                          >
                            {dayEvents.length}
                          </Typography>
                        )}
                      </Box>

                      <Box className={classes.dayEvents}>
                        {dayEvents
                          .slice(0, 3)
                          .map((event) => (
                            <Box
                              key={event.id}
                              className={
                                event.eventType ===
                                "assignment"
                                  ? classes.assignmentEvent
                                  : classes.todoEvent
                              }
                            >
                              <Typography
                                className={
                                  classes.eventText
                                }
                                noWrap
                              >
                                {event.title}
                              </Typography>
                            </Box>
                          ))}

                        {dayEvents.length > 3 && (
                          <Typography
                            className={classes.moreEvents}
                          >
                            +{dayEvents.length - 3} נוספים
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Paper>

            <Paper
              elevation={0}
              className={classes.sideCard}
            >
              <Box className={classes.sideHeader}>
                <Box className={classes.sideHeaderIcon}>
                  <CalendarMonthOutlinedIcon fontSize="small" />
                </Box>

                <Box>
                  <Typography fontWeight={600}>
                    {formatDueDate(selectedDate)}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    {selectedDateEvents.length === 0
                      ? "אין משימות או מטלות ליום הזה"
                      : `${selectedDateEvents.length} פריטים ביום הזה`}
                  </Typography>
                </Box>
              </Box>

              <Box className={classes.eventsList}>
                {selectedDateEvents.length === 0 ? (
                  <Box className={classes.emptyState}>
                    <Box className={classes.emptyStateIcon}>
                      <CalendarMonthOutlinedIcon />
                    </Box>
                    <Typography
                      fontSize={13}
                      color="text.secondary"
                    >
                      אין אירועים בתאריך שנבחר
                    </Typography>
                  </Box>
                ) : (
                  selectedDateEvents.map((event) => (
                    <Box
                      key={event.id}
                      className={classes.eventCard}
                    >
                      <Box
                        className={classes.eventCardHeader}
                      >
                        <Box
                          className={`${classes.eventIconBox} ${
                            event.eventType ===
                            "assignment"
                              ? classes.assignmentIconBox
                              : classes.todoIconBox
                          }`}
                        >
                          {event.eventType ===
                          "assignment" ? (
                            <AssignmentOutlinedIcon fontSize="small" />
                          ) : (
                            <CheckCircleOutlineIcon fontSize="small" />
                          )}
                        </Box>

                        <Box minWidth={0}>
                          <Typography
                            className={
                              classes.eventCardTitle
                            }
                            noWrap
                          >
                            {event.title}
                          </Typography>

                          <Typography
                            variant="body2"
                            color="text.secondary"
                          >
                            {event.eventType ===
                            "assignment"
                              ? event.course
                              : event.done
                                ? "משימה בוצעה"
                                : "משימת To Do"}
                          </Typography>
                        </Box>
                      </Box>

                      <Box className={classes.eventChips}>
                        {event.eventType ===
                          "assignment" &&
                          event.status &&
                          event.type && (
                            <>
                              <Chip
                                size="small"
                                label={statusToDisplayName(
                                  event.status,
                                )}
                                className={statusChipClass(
                                  event.status,
                                )}
                              />

                              <Chip
                                size="small"
                                label={assignmentTypeToDisplayName(
                                  event.type,
                                )}
                                className={typeChipClass(
                                  event.type,
                                )}
                              />
                            </>
                          )}

                        {event.eventType === "todo" && (
                          <Chip
                            size="small"
                            label={
                              event.done
                                ? "בוצע"
                                : "פתוח"
                            }
                            color={
                              event.done
                                ? "success"
                                : "default"
                            }
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </Box>
                  ))
                )}
              </Box>
            </Paper>
          </Box>
        )}
      </Box>

      <Snackbar
        open={Boolean(successMessage)}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage(null)}
      >
        <Alert
          severity="success"
          onClose={() => setSuccessMessage(null)}
        >
          {successMessage}
        </Alert>
      </Snackbar>

      <Snackbar
        open={Boolean(errorMessage)}
        autoHideDuration={4000}
        onClose={() => setErrorMessage(null)}
      >
        <Alert
          severity="error"
          onClose={() => setErrorMessage(null)}
        >
          {errorMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};