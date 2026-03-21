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
import { statusChipClass, typeChipClass, useStyles } from "./style";

//TODO Tali - replace with real data from backend
const todoRows = [
  {
    task: "חזרה על סיכומי אלגברה לינארית",
    dueDate: "23 במרץ",
    done: false,
    estimatedTime: "45 דק'",
  },
  {
    task: "סיכום הרצאה במערכות הפעלה",
    dueDate: "24 במרץ",
    done: true,
    estimatedTime: "30 דק'",
  },
  {
    task: "תרגול SQL joins",
    dueDate: "25 במרץ",
    done: false,
    estimatedTime: "60 דק'",
  },
  {
    task: "כתיבת נקודות מפתח מקריאה בכלכלה",
    dueDate: "26 במרץ",
    done: false,
    estimatedTime: "40 דק'",
  },
];

const assignmentRows = [
  {
    status: "פעיל",
    course: "מבני נתונים",
    assignment: "דף תרגול סיבוכיות",
    dueDate: "24 במרץ",
    type: "שיעורי בית",
    daysLeft: "3 ימים",
    isOverdue: false,
  },
  {
    status: "הושלם",
    course: "אלגברה לינארית",
    assignment: "הכנה לבוחן מטריצות",
    dueDate: "20 במרץ",
    type: "תרגול",
    daysLeft: "בוצע",
    isOverdue: false,
  },
  {
    status: "פעיל",
    course: "מסדי נתונים",
    assignment: "טיוטת תכנון סכימה",
    dueDate: "22 במרץ",
    type: "פרויקט",
    daysLeft: "יום אחד",
    isOverdue: false,
  },
  {
    status: "דחוף",
    course: "סטטיסטיקה",
    assignment: "סט תרגילים במבחני השערות",
    dueDate: "21 במרץ",
    type: "שיעורי בית",
    daysLeft: "היום",
    isOverdue: false,
  },
  {
    status: "באיחור",
    course: "כלכלה",
    assignment: "דוח ניתוח שוק",
    dueDate: "18 במרץ",
    type: "דוח",
    daysLeft: "איחור של 3 ימים",
    isOverdue: true,
  },
  {
    status: "פעיל",
    course: "תכן תוכנה",
    assignment: "תרשים מחלקות UML",
    dueDate: "27 במרץ",
    type: "פרויקט",
    daysLeft: "6 ימים",
    isOverdue: false,
  },
  {
    status: "באיחור",
    course: "פיזיקה",
    assignment: "רפלקציה על מעבדה",
    dueDate: "19 במרץ",
    type: "מעבדה",
    daysLeft: "איחור של יומיים",
    isOverdue: true,
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
                    <TableRow key={row.task} hover>
                      <TableCell align="right" className={classes.taskNameCell}>
                        {row.task}
                      </TableCell>
                      <TableCell align="right">{row.dueDate}</TableCell>
                      <TableCell align="right">
                        <Checkbox checked={row.done} size="small" disabled />
                      </TableCell>
                      <TableCell align="right">{row.estimatedTime}</TableCell>
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
                  {assignmentRows.map((row) => (
                    <TableRow
                      key={`${row.course}-${row.assignment}`}
                      hover
                      className={row.isOverdue ? classes.overdueRow : undefined}
                    >
                      <TableCell align="right">
                        <Chip
                          label={row.status}
                          size="small"
                          className={statusChipClass(row.status)}
                        />
                      </TableCell>
                      <TableCell align="right">{row.course}</TableCell>
                      <TableCell
                        align="right"
                        className={classes.assignmentNameCell}
                      >
                        {row.assignment}
                      </TableCell>
                      <TableCell align="right">{row.dueDate}</TableCell>
                      <TableCell align="right">
                        <Chip
                          label={row.type}
                          size="small"
                          className={typeChipClass(row.type)}
                        />
                      </TableCell>
                      <TableCell
                        align="right"
                        className={
                          row.isOverdue
                            ? classes.overdueDaysCell
                            : classes.regularDaysCell
                        }
                      >
                        {row.daysLeft}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Stack>
      </Stack>
    </Box>
  );
};
