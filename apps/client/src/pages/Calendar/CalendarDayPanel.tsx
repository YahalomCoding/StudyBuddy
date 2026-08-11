import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { Box, Chip, Paper, Typography } from "@mui/material";
import { statusChipClass, typeChipClass } from "../Home/style";
import {
  assignmentTypeToDisplayName,
  formatDueDate,
  statusToDisplayName,
} from "../Home/utils";

type Classes = Record<string, string>;

type ItemStatus = "not started" | "active" | "done";
type AssignmentType =
  "assignment" | "homework" | "practice" | "project" | "report" | "lab";

export type CalendarEvent = {
  id: string;
  title: string;
  date: Date;
  eventType: "todo" | "assignment";
  course?: string;
  done?: boolean;
  status?: ItemStatus;
  type?: AssignmentType;
};

type Props = {
  selectedDate: Date;
  selectedDateEvents: CalendarEvent[];
  classes: Classes;
};

export const CalendarDayPanel = ({
  selectedDate,
  selectedDateEvents,
  classes,
}: Props) => (
  <Paper elevation={0} className={classes.sideCard}>
    <Box className={classes.sideHeader}>
      <Box className={classes.sideHeaderIcon}>
        <CalendarMonthOutlinedIcon fontSize="small" />
      </Box>
      <Box>
        <Typography fontWeight={600}>{formatDueDate(selectedDate)}</Typography>
        <Typography variant="body2" color="text.secondary">
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
          <Typography fontSize={13} color="text.secondary">
            אין אירועים בתאריך שנבחר
          </Typography>
        </Box>
      ) : (
        selectedDateEvents.map((event) => (
          <Box key={event.id} className={classes.eventCard}>
            <Box className={classes.eventCardHeader}>
              <Box
                className={`${classes.eventIconBox} ${
                  event.eventType === "assignment"
                    ? classes.assignmentIconBox
                    : classes.todoIconBox
                }`}
              >
                {event.eventType === "assignment" ? (
                  <AssignmentOutlinedIcon fontSize="small" />
                ) : (
                  <CheckCircleOutlineIcon fontSize="small" />
                )}
              </Box>
              <Box minWidth={0}>
                <Typography className={classes.eventCardTitle} noWrap>
                  {event.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {event.eventType === "assignment"
                    ? event.course
                    : event.done
                      ? "משימה בוצעה"
                      : "משימת To Do"}
                </Typography>
              </Box>
            </Box>

            <Box className={classes.eventChips}>
              {event.eventType === "assignment" &&
                event.status &&
                event.type && (
                  <>
                    <Chip
                      size="small"
                      label={statusToDisplayName(event.status)}
                      className={statusChipClass(event.status)}
                    />
                    <Chip
                      size="small"
                      label={assignmentTypeToDisplayName(event.type)}
                      className={typeChipClass(event.type)}
                    />
                  </>
                )}
              {event.eventType === "todo" && (
                <Chip
                  size="small"
                  label={event.done ? "בוצע" : "פתוח"}
                  color={event.done ? "success" : "default"}
                  variant="outlined"
                />
              )}
            </Box>
          </Box>
        ))
      )}
    </Box>
  </Paper>
);
