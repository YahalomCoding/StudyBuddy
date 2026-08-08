import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  Paper,
  Snackbar,
  Typography,
} from "@mui/material";
import { type AssignmentItem, type TodoItem } from "@studybuddy/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useRef, useState } from "react";
import { importAssignmentsFromIcs } from "../../api/assignments";
import { getHomeDashboard, homeDashboardQueryKey } from "../../api/home";
import { CalendarDayPanel, type CalendarEvent } from "./CalendarDayPanel";
import { CalendarGrid } from "./CalendarGrid";
import { useStyles } from "./style";

const isSameDay = (dateA: Date, dateB: Date) =>
  dateA.getFullYear() === dateB.getFullYear() &&
  dateA.getMonth() === dateB.getMonth() &&
  dateA.getDate() === dateB.getDate();

const getMonthLabel = (date: Date) =>
  date.toLocaleDateString("he-IL", { month: "long", year: "numeric" });

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

  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: homeDashboardQueryKey,
    queryFn: getHomeDashboard,
  });

  const importIcsMutation = useMutation({
    mutationFn: importAssignmentsFromIcs,
    onSuccess: (result) => {
      setSuccessMessage(`יובאו ${result.createdCount} מטלות בהצלחה`);
      setErrorMessage(null);
      queryClient.invalidateQueries({ queryKey: homeDashboardQueryKey });
    },
    onError: () => {
      setErrorMessage("לא הצלחנו לייבא את קובץ לוח השנה");
      setSuccessMessage(null);
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

  const calendarEvents: CalendarEvent[] = useMemo(() => {
    const todoEvents: CalendarEvent[] = todoRows.map((todo) => ({
      id: `todo-${todo.id}`,
      title: todo.title,
      date: todo.dueDate,
      eventType: "todo",
      done: todo.done,
    }));
    const assignmentEvents: CalendarEvent[] = assignmentRows.map(
      (assignment) => ({
        id: `assignment-${assignment.id}`,
        title: assignment.title,
        date: assignment.dueDate,
        eventType: "assignment",
        course: assignment.course,
        status: assignment.status,
        type: assignment.type,
      })
    );
    return [...todoEvents, ...assignmentEvents].sort(
      (a, b) => a.date.getTime() - b.date.getTime()
    );
  }, [todoRows, assignmentRows]);

  const calendarDays = useMemo(
    () => getCalendarDays(currentMonth),
    [currentMonth]
  );

  const selectedDateEvents = useMemo(
    () => calendarEvents.filter((event) => isSameDay(event.date, selectedDate)),
    [calendarEvents, selectedDate]
  );

  const goToPreviousMonth = () =>
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
    );

  const goToNextMonth = () =>
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
    );

  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    setSelectedDate(today);
  };

  const handleIcsFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const isIcsFile =
      file.name.toLowerCase().endsWith(".ics") || file.type === "text/calendar";
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
        <Typography className={classes.topBarTitle}>לוח שנה</Typography>
      </Box>

      <Box className={classes.content}>
        <Box className={classes.header}>
          <Box className={classes.headerTitleArea}>
            <Box className={classes.headerIcon}>
              <CalendarMonthOutlinedIcon />
            </Box>
            <Box minWidth={0}>
              <Typography className={classes.title}>לוח שנה</Typography>
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
              {importIcsMutation.isPending ? "מייבא..." : "ייבוא קובץ לוח שנה"}
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
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") goToToday();
              }}
            >
              היום
            </Box>
          </Box>
        </Box>

        {isLoading && (
          <Paper elevation={0} className={classes.loadingCard}>
            <CircularProgress size={28} />
            <Typography color="text.secondary">טוען לוח שנה...</Typography>
          </Paper>
        )}

        {isError && (
          <Paper elevation={0} className={classes.loadingCard}>
            <Typography color="error">
              לא הצלחנו לטעון את לוח השנה כרגע
            </Typography>
          </Paper>
        )}

        {!isLoading && !isError && (
          <Box className={classes.calendarLayout}>
            <CalendarGrid
              calendarDays={calendarDays}
              calendarEvents={calendarEvents}
              currentMonth={currentMonth}
              selectedDate={selectedDate}
              onDaySelect={setSelectedDate}
              classes={classes}
            />
            <CalendarDayPanel
              selectedDate={selectedDate}
              selectedDateEvents={selectedDateEvents}
              classes={classes}
            />
          </Box>
        )}
      </Box>

      <Snackbar
        open={Boolean(successMessage)}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage(null)}
      >
        <Alert severity="success" onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      </Snackbar>

      <Snackbar
        open={Boolean(errorMessage)}
        autoHideDuration={4000}
        onClose={() => setErrorMessage(null)}
      >
        <Alert severity="error" onClose={() => setErrorMessage(null)}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};
