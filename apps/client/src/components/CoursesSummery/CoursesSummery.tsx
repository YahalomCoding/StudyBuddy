import AddIcon from "@mui/icons-material/Add";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import { Box, IconButton, Paper, Tooltip, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { getHomeDashboard, homeDashboardQueryKey } from "../../api/home";

const PAGE_SIZE = 3;

type CoursesSummaryProps = {
  selectedCourseTitle: string | null;
  onCourseSelect: (courseTitle: string | null) => void;
  onCourseOpen: (courseTitle: string, studentSemesterCourseId: string) => void;
  onAddCourse: () => void;
  onDeleteCourse: (studentSemesterCourseId: string) => void;
};

export const CoursesSummary = ({
  selectedCourseTitle,
  onCourseSelect,
  onCourseOpen,
  onAddCourse,
  onDeleteCourse,
}: CoursesSummaryProps) => {
  const [page, setPage] = useState(1);
  const [hoveredCourseId, setHoveredCourseId] = useState<string | null>(null);

  const { data } = useQuery({
    queryKey: homeDashboardQueryKey,
    queryFn: getHomeDashboard,
  });

  const allItems = useMemo(
    () => data?.coursesSummary ?? [],
    [data?.coursesSummary]
  );

  const totalPages = Math.max(1, Math.ceil(allItems.length / PAGE_SIZE));

  useEffect(() => {
    setPage((previousPage) => Math.min(previousPage, totalPages));
  }, [totalPages]);

  const currentItems = useMemo(() => {
    const startIndex = (page - 1) * PAGE_SIZE;
    return allItems.slice(startIndex, startIndex + PAGE_SIZE);
  }, [allItems, page]);

  const paddedItems = useMemo(() => {
    const items: Array<(typeof currentItems)[number] | null> = [
      ...currentItems,
    ];

    while (items.length < PAGE_SIZE) {
      items.push(null);
    }

    return items;
  }, [currentItems]);

  const handlePrevPage = () =>
    setPage((previousPage) => Math.max(1, previousPage - 1));

  const handleNextPage = () =>
    setPage((previousPage) => Math.min(totalPages, previousPage + 1));

  const handleCourseRowClick = (courseTitle: string) => {
    onCourseSelect(selectedCourseTitle === courseTitle ? null : courseTitle);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        p: 2,
        bgcolor: "background.paper",
      }}
    >
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={1.5}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <Box
            sx={{
              width: 22,
              height: 22,
              borderRadius: 1,
              bgcolor: "#22c55e",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MenuBookOutlinedIcon sx={{ fontSize: 14, color: "white" }} />
          </Box>

          <Typography fontWeight={600} fontSize={15}>
            הקורסים שלי
          </Typography>
        </Box>

        <Box display="flex" alignItems="center" gap={0.5}>
          <Typography fontSize={12} color="text.secondary">
            עמוד {page} מתוך {totalPages}
          </Typography>

          <IconButton
            size="small"
            onClick={handlePrevPage}
            disabled={page === 1}
            sx={{ p: 0.3 }}
          >
            <ChevronRightRoundedIcon fontSize="small" />
          </IconButton>

          <IconButton
            size="small"
            onClick={handleNextPage}
            disabled={page === totalPages}
            sx={{ p: 0.3 }}
          >
            <ChevronLeftRoundedIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      <Box>
        {paddedItems.map((item, index) => {
          if (!item) {
            return (
              <Box
                key={`empty-${index}`}
                sx={{
                  height: 44,
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  "&:last-of-type": {
                    borderBottom: "none",
                  },
                }}
              />
            );
          }

          const isSelected = selectedCourseTitle === item.courseTitle;
          const isHovered = hoveredCourseId === item.id;

          return (
            <Box
              key={item.id}
              onMouseEnter={() => setHoveredCourseId(item.id)}
              onMouseLeave={() =>
                setHoveredCourseId((currentId) =>
                  currentId === item.id ? null : currentId
                )
              }
              onClick={() => handleCourseRowClick(item.courseTitle)}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 1,
                py: 0.8,
                px: 0.6,
                minHeight: 44,
                borderBottom: "1px solid",
                borderColor: "divider",
                borderRadius: 1.5,
                cursor: "pointer",
                transition: "background-color 0.18s ease",
                bgcolor: isSelected ? "action.selected" : "transparent",
                "&:hover": {
                  bgcolor: isSelected ? "action.selected" : "action.hover",
                },
                "&:last-of-type": {
                  borderBottom: "none",
                },
              }}
            >
              <Box display="flex" alignItems="center" gap={1.5} minWidth={0}>
                <Box
                  sx={{
                    width: 30,
                    height: 30,
                    borderRadius: 1.5,
                    bgcolor: "#eff6ff",
                    color: "#3b82f6",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <MenuBookOutlinedIcon sx={{ fontSize: 16 }} />
                </Box>

                <Box minWidth={0}>
                  <Typography
                    fontSize={13}
                    fontWeight={600}
                    lineHeight={1.3}
                    noWrap
                  >
                    {item.courseTitle}
                  </Typography>

                  <Typography
                    fontSize={11}
                    color="text.secondary"
                    lineHeight={1.3}
                    noWrap
                  >
                    {item.semesterLabel}
                  </Typography>
                </Box>
              </Box>

              <Box display="flex" alignItems="center" gap={0.5} flexShrink={0}>
                {isHovered && (
                  <Tooltip title="מחק קורס">
                    <IconButton
                      size="small"
                      aria-label={`מחק קורס ${item.courseTitle}`}
                      onMouseDown={(event) => event.stopPropagation()}
                      onClick={(event) => {
                        event.stopPropagation();
                        onDeleteCourse(item.studentSemesterCourseId);
                      }}
                      sx={{
                        p: 0.45,
                        color: "error.main",
                        opacity: isHovered ? 1 : 0,
                        transition:
                          "opacity 0.16s ease, background-color 0.16s ease",
                        "&:hover": { bgcolor: "rgba(239,68,68,0.08)" },
                      }}
                    >
                      <DeleteOutlineIcon sx={{ fontSize: 17 }} />
                    </IconButton>
                  </Tooltip>
                )}

                <Box
                  sx={{
                    width: 30,
                    height: 30,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Tooltip title="פתיחת פרטי הקורס">
                    <IconButton
                      size="small"
                      aria-label={`פתיחת פרטי הקורס ${item.courseTitle}`}
                      onMouseDown={(event) => {
                        event.stopPropagation();
                      }}
                      onClick={(event) => {
                        event.stopPropagation();
                        onCourseOpen(
                          item.courseTitle,
                          item.studentSemesterCourseId
                        );
                      }}
                      sx={{
                        p: 0.45,
                        color: "#16a34a",
                        opacity: isHovered ? 1 : 0,
                        pointerEvents: isHovered ? "auto" : "none",
                        transform: isHovered
                          ? "translateX(0)"
                          : "translateX(-4px)",
                        transition:
                          "opacity 0.16s ease, transform 0.16s ease, background-color 0.16s ease",
                        "&:hover": {
                          bgcolor: "rgba(34, 197, 94, 0.10)",
                        },
                        "@media (hover: none)": {
                          opacity: 1,
                          pointerEvents: "auto",
                          transform: "translateX(0)",
                        },
                      }}
                    >
                      <OpenInNewRoundedIcon sx={{ fontSize: 17 }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            </Box>
          );
        })}

        <Box
          display="flex"
          alignItems="center"
          gap={0.5}
          sx={{
            cursor: "pointer",
            color: "text.secondary",
            mt: 1,
            justifyContent: "flex-start",
          }}
          onClick={onAddCourse}
        >
          <Typography fontSize={13}>הוסף קורס</Typography>
          <AddIcon fontSize="small" />
        </Box>
      </Box>
    </Paper>
  );
};
