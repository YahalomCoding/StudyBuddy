import AddIcon from "@mui/icons-material/Add";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import { Box, IconButton, Paper, Typography } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import {
  createCourseSummary,
  getHomeDashboard,
  homeDashboardQueryKey,
} from "../../api/home";
import {
  GenericFormModal,
  type FormField,
  type FormValues,
} from "../GenericFormModal/GenericFormModal";
const PAGE_SIZE = 3;

const COURSE_FIELDS: FormField[] = [
  {
    type: "text",
    name: "courseTitle",
    label: "שם הקורס",
    placeholder: "פיתוח ווב",
  },
  {
    type: "text",
    name: "courseId",
    label: "מספר קורס",
    placeholder: "WD-101",
  },
  {
    type: "text",
    name: "semesterLabel",
    label: "סמסטר",
    placeholder: "סמסטר א'",
  },
];

export const CoursesSummary = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalValues, setModalValues] = useState<FormValues>({});

  const { data } = useQuery({
    queryKey: homeDashboardQueryKey,
    queryFn: getHomeDashboard,
  });

  const serverItems = useMemo(
    () => data?.coursesSummary ?? [],
    [data?.coursesSummary]
  );

  const allItems = useMemo(() => serverItems, [serverItems]);

  const createCourseMutation = useMutation({
    mutationFn: createCourseSummary,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: homeDashboardQueryKey });
    },
  });

  const totalPages = Math.max(1, Math.ceil(allItems.length / PAGE_SIZE));

  useEffect(() => {
    setPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  const currentItems = useMemo(() => {
    const startIndex = (page - 1) * PAGE_SIZE;
    return allItems.slice(startIndex, startIndex + PAGE_SIZE);
  }, [allItems, page]);

  const paddedItems = useMemo(() => {
    const items: ((typeof currentItems)[number] | null)[] = [...currentItems];

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

  const handleOpenModal = () => {
    setModalValues({});
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setModalValues({});
  };

  const handleSaveCourse = (values: FormValues) => {
    createCourseMutation.mutate({
      courseTitle: values.courseTitle ?? "",
      semesterLabel: values.semesterLabel ?? "",
    });
    handleCloseModal();
  };

  return (
    <>
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
        {/* Card header */}
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

        {/* Rows */}

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

            return (
              <Box
                key={item.id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  py: 0.8,
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  "&:last-of-type": {
                    borderBottom: "none",
                  },
                }}
              >
                {/* Left: icon + text */}
                <Box display="flex" alignItems="center" gap={1.5}>
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

                  <Box>
                    <Typography fontSize={13} fontWeight={600} lineHeight={1.3}>
                      {item.courseTitle}
                    </Typography>

                    <Typography
                      fontSize={11}
                      color="text.secondary"
                      lineHeight={1.3}
                    >
                      {item.semesterLabel}
                    </Typography>
                  </Box>
                </Box>

                {/* Right: course ID */}
                <Typography fontSize={12} color="text.secondary" flexShrink={0}>
                  {item.courseId}
                </Typography>
              </Box>
            );
          })}
        </Box>
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
          onClick={handleOpenModal}
        >
          <Typography fontSize={13}>הוסף קורס</Typography>
          <AddIcon fontSize="small" />
        </Box>
      </Paper>

      <GenericFormModal
        open={modalOpen}
        onClose={handleCloseModal}
        title="הוסף קורס"
        fields={COURSE_FIELDS}
        values={modalValues}
        onChange={(name, value) =>
          setModalValues((prev) => ({
            ...prev,
            [name]: value,
          }))
        }
        onSave={handleSaveCourse}
        saveLabel="שמור"
        cancelLabel="ביטול"
      />
    </>
  );
};
