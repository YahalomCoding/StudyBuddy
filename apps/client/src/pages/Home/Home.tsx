import {
  Box,
  Checkbox,
  Chip,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { type AssignmentItem, type TodoItem } from "@studybuddy/types";
import { statusChipClass, typeChipClass, useStyles } from "./style";
import {
  assignmentTypeToDisplayName,
  formatDueDate,
  formatDuration,
  getRelativeDueDate,
  isOverdue,
  relativeDueDateToDisplayName,
  statusToDisplayName,
} from "./utils";

//TODO Tali - replace with real data from backend
const todoRows: TodoItem[] = [
  {
    id: "todo-1",
    title: "חזרה על סיכומי אלגברה לינארית",
    dueDate: new Date(2026, 2, 23),
    done: false,
    estimatedTime: { value: 45, unit: "minutes" },
  },
  {
    id: "todo-2",
    title: "סיכום הרצאה במערכות הפעלה",
    dueDate: new Date(2026, 2, 24),
    done: true,
    estimatedTime: { value: 30, unit: "minutes" },
  },
  {
    id: "todo-3",
    title: "תרגול SQL joins",
    dueDate: new Date(2026, 2, 25),
    done: false,
    estimatedTime: { value: 60, unit: "minutes" },
  },
  {
    id: "todo-4",
    title: "כתיבת נקודות מפתח מקריאה בכלכלה",
    dueDate: new Date(2026, 2, 26),
    done: false,
    estimatedTime: { value: 40, unit: "minutes" },
  },
];

const assignmentRows: AssignmentItem[] = [
  {
    id: "assignment-1",
    status: "not started",
    course: "מבני נתונים",
    title: "דף תרגול סיבוכיות",
    dueDate: new Date(2026, 2, 24),
    type: "homework",
  },
  {
    id: "assignment-2",
    status: "done",
    course: "אלגברה לינארית",
    title: "הכנה לבוחן מטריצות",
    dueDate: new Date(2026, 2, 20),
    type: "practice",
  },
  {
    id: "assignment-3",
    status: "active",
    course: "מסדי נתונים",
    title: "טיוטת תכנון סכימה",
    dueDate: new Date(2026, 2, 22),
    type: "project",
  },
  {
    id: "assignment-4",
    status: "active",
    course: "סטטיסטיקה",
    title: "סט תרגילים במבחני השערות",
    dueDate: new Date(2026, 2, 21),
    type: "homework",
  },
  {
    id: "assignment-5",
    status: "active",
    course: "כלכלה",
    title: "דוח ניתוח שוק",
    dueDate: new Date(2026, 2, 18),
    type: "report",
  },
  {
    id: "assignment-6",
    status: "active",
    course: "תכן תוכנה",
    title: "תרשים מחלקות UML",
    dueDate: new Date(2026, 2, 27),
    type: "project",
  },
  {
    id: "assignment-7",
    status: "active",
    course: "פיזיקה",
    title: "רפלקציה על מעבדה",
    dueDate: new Date(2026, 2, 19),
    type: "lab",
  },
];

export const Home = () => {
  const classes = useStyles();

  return (
    <Box className={classes.page}>
      <Stack className={classes.content}>
        <Box>
          <Typography variant="h4" component="h1" className={classes.title}>
            לוח לימודים
          </Typography>
        </Box>

        <Stack className={classes.section}>
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
                  {todoRows.map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell align="right" className={classes.taskNameCell}>
                        {row.title}
                      </TableCell>
                      <TableCell align="right">
                        {formatDueDate(row.dueDate)}
                      </TableCell>
                      <TableCell align="right">
                        <Checkbox checked={row.done} size="small" disabled />
                      </TableCell>
                      <TableCell align="right">
                        {formatDuration(row.estimatedTime)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Stack>

        <Stack className={classes.section}>
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
        </Stack>
      </Stack>
    </Box>
  );
};
