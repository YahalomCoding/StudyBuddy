import { useMemo, useState } from "react";
import { Box, IconButton, Paper, Typography } from "@mui/material";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import { useStyles } from "./style";
import { getUpcomingEventItems } from "./selectors";

const PAGE_SIZE = 4;

const formatEventDate = (value: string) => {
  const date = new Date(value);

  return new Intl.DateTimeFormat("he-IL", {
    day: "numeric",
    month: "long",
  }).format(date);
};

export const UpcomingEvents = () => {
  const classes = useStyles();
  const [page, setPage] = useState(1);

  const allItems = useMemo(() => getUpcomingEventItems(), []);
  const totalPages = Math.max(1, Math.ceil(allItems.length / PAGE_SIZE));

  const currentItems = useMemo(() => {
    const startIndex = (page - 1) * PAGE_SIZE;
    return allItems.slice(startIndex, startIndex + PAGE_SIZE);
  }, [allItems, page]);

  const paddedItems = useMemo(() => {
    const items: (typeof currentItems[number] | null)[] = [...currentItems];

    while (items.length < PAGE_SIZE) {
      items.push(null);
    }

    return items;
  }, [currentItems]);

  const handlePrevPage = () => {
    setPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setPage((prev) => Math.min(totalPages, prev + 1));
  };

  return (
    <Box className={classes.section}>
      <Typography variant="h6" className={classes.sectionTitle}>
       Upcoming Events
      </Typography>

      <Paper elevation={0} className={classes.paper}>
        <Box className={classes.content}>
          <Box className={classes.headerRow}>
            <Typography className={classes.pageIndicator}>
              עמוד {page} מתוך {totalPages}
            </Typography>

            <Box className={classes.navActions}>
              <IconButton
                size="small"
                className={classes.navButton}
                onClick={handlePrevPage}
                disabled={page === 1}
              >
                <ChevronRightRoundedIcon fontSize="small" />
              </IconButton>

              <IconButton
                size="small"
                className={classes.navButton}
                onClick={handleNextPage}
                disabled={page === totalPages}
              >
                <ChevronLeftRoundedIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>

          <Box className={classes.rows}>
            {paddedItems.map((item, index) => {
              if (!item) {
                return <Box key={`empty-${index}`} className={classes.rowEmpty} />;
              }

              return (
                <Box key={item.id} className={classes.row}>
                  <Box className={classes.rowMain}>
                    <Box
                      className={`${classes.iconWrap} ${
                        item.kind === "exam"
                          ? classes.examIcon
                          : classes.assignmentIcon
                      }`}
                    >
                      {item.kind === "exam" ? (
                        <SchoolOutlinedIcon fontSize="small" />
                      ) : (
                        <DescriptionOutlinedIcon fontSize="small" />
                      )}
                    </Box>

                    <Box className={classes.textWrap}>
                      <Typography className={classes.courseTitle}>
                        {item.courseTitle}
                      </Typography>

                      <Typography className={classes.description}>
                        {item.description}
                      </Typography>
                    </Box>
                  </Box>

                  <Box className={classes.metaWrap}>
                    <Typography className={classes.dateText}>
                      {formatEventDate(item.eventDate)}
                    </Typography>

                    <Typography className={classes.semesterText}>
                      {item.semesterLabel}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};