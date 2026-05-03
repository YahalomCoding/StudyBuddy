import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import { Box, IconButton, Paper, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { getHomeDashboard, homeDashboardQueryKey } from "../../api/home";
import { useStyles } from "./style";

const PAGE_SIZE = 6;

export const CoursesSummary = () => {
  const classes = useStyles();
  const [page, setPage] = useState(1);
  const { data } = useQuery({
    queryKey: homeDashboardQueryKey,
    queryFn: getHomeDashboard,
  });

  const allItems = useMemo(() => data?.coursesSummary ?? [], [data?.coursesSummary]);
  const totalPages = Math.max(1, Math.ceil(allItems.length / PAGE_SIZE));

  useEffect(() => {
    setPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

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
       My Courses
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
                    <Box className={classes.iconWrap}>
                      <MenuBookOutlinedIcon fontSize="small" />
                    </Box>

                    <Box className={classes.textWrap}>
                      <Typography className={classes.courseTitle}>
                        {item.courseTitle}
                      </Typography>

                      <Typography className={classes.metaText}>
                        {item.semesterLabel}
                      </Typography>
                    </Box>
                  </Box>

                  <Typography className={classes.secondaryText}>
                    {item.courseId}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};