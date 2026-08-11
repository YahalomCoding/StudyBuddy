import { Box, Paper, Typography } from "@mui/material";
import type { CalendarEvent } from "./CalendarDayPanel";

type Classes = Record<string, string>;

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const WEEK_DAYS = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];

type Props = {
  calendarDays: Date[];
  calendarEvents: CalendarEvent[];
  currentMonth: Date;
  selectedDate: Date;
  onDaySelect: (day: Date) => void;
  classes: Classes;
};

export const CalendarGrid = ({
  calendarDays,
  calendarEvents,
  currentMonth,
  selectedDate,
  onDaySelect,
  classes,
}: Props) => (
  <Paper elevation={0} className={classes.calendarCard}>
    <Box className={classes.weekHeader}>
      {WEEK_DAYS.map((day) => (
        <Typography key={day} className={classes.weekDay}>
          {day}
        </Typography>
      ))}
    </Box>

    <Box className={classes.daysGrid}>
      {calendarDays.map((day) => {
        const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
        const isToday = isSameDay(day, new Date());
        const isSelected = isSameDay(day, selectedDate);
        const dayEvents = calendarEvents.filter((event) =>
          isSameDay(event.date, day)
        );

        return (
          <Box
            key={day.toISOString()}
            className={classes.dayCell}
            data-current-month={isCurrentMonth}
            data-today={isToday}
            data-selected={isSelected}
            onClick={() => onDaySelect(day)}
          >
            <Box className={classes.dayNumberRow}>
              <Typography
                className={`${classes.dayNumber} ${isToday ? classes.todayNumber : ""}`}
              >
                {day.getDate()}
              </Typography>
              {dayEvents.length > 0 && (
                <Typography className={classes.eventCount}>
                  {dayEvents.length}
                </Typography>
              )}
            </Box>

            <Box className={classes.dayEvents}>
              {dayEvents.slice(0, 3).map((event) => (
                <Box
                  key={event.id}
                  className={
                    event.eventType === "assignment"
                      ? classes.assignmentEvent
                      : classes.todoEvent
                  }
                >
                  <Typography className={classes.eventText} noWrap>
                    {event.title}
                  </Typography>
                </Box>
              ))}
              {dayEvents.length > 3 && (
                <Typography className={classes.moreEvents}>
                  +{dayEvents.length - 3} נוספים
                </Typography>
              )}
            </Box>
          </Box>
        );
      })}
    </Box>
  </Paper>
);
