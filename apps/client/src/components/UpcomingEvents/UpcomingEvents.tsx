import AddIcon from "@mui/icons-material/Add";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import { Box, IconButton, Paper, Typography } from "@mui/material";
import type { UpcomingEventViewItem } from "./types";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { getHomeDashboard, homeDashboardQueryKey } from "../../api/home";
import {
  GenericFormModal,
  type FormField,
  type FormValues,
} from "../GenericFormModal/GenericFormModal";

const PAGE_SIZE = 4;

const EVENT_FIELDS: FormField[] = [
  {
    type: "text",
    name: "courseTitle",
    label: "שם הקורס",
    placeholder: "Web Development",
  },
  {
    type: "text",
    name: "description",
    label: "תיאור האירוע",
    placeholder: "Final exam / Assignment deadline",
  },
  {
    type: "date",
    name: "eventDate",
    label: "תאריך האירוע",
  },
  {
    type: "select",
    name: "kind",
    label: "סוג אירוע",
    options: [
      { label: "Exam", value: "exam" },
      { label: "Assignment", value: "assignment" },
    ],
  },
  {
    type: "text",
    name: "semesterLabel",
    label: "סמסטר",
    placeholder: "Semester A",
  },
];

const formatEventDate = (value: string) => {
  const date = new Date(value);

  return new Intl.DateTimeFormat("he-IL", {
    day: "numeric",
    month: "long",
  }).format(date);
};

export const UpcomingEvents = () => {
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalValues, setModalValues] = useState<FormValues>({});
  const [localEvents, setLocalEvents] = useState<UpcomingEventViewItem[]>([]);

  const { data } = useQuery({
    queryKey: homeDashboardQueryKey,
    queryFn: getHomeDashboard,
  });

  const serverItems = useMemo(
    () => data?.upcomingEvents ?? [],
    [data?.upcomingEvents]
  );

  const allItems = useMemo(
    () => [...serverItems, ...localEvents],
    [serverItems, localEvents]
  );

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

  const handleSaveEvent = (values: FormValues) => {
    const newEvent: UpcomingEventViewItem = {
      id: `local-event-${Date.now()}`,
      courseTitle: values.courseTitle ?? "",
      description: values.description ?? "",
      eventDate: values.eventDate ?? "",
      kind: values.kind as "assignment" | "exam",
      semesterLabel: values.semesterLabel ?? "",
    };

    setLocalEvents((prev) => [...prev, newEvent]);
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
            <CheckCircleIcon sx={{ color: "#22c55e", fontSize: 20 }} />

            <Typography fontWeight={600} fontSize={15}>
              Upcoming Events
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
                    height: 52,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    "&:last-of-type": {
                      borderBottom: "none",
                    },
                  }}
                />
              );
            }

            const isExam = item.kind === "exam";

            return (
              <Box
                key={item.id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  py: 1,
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
                      width: 32,
                      height: 32,
                      borderRadius: 1.5,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: isExam ? "#fef9c3" : "#eff6ff",
                      color: isExam ? "#ca8a04" : "#3b82f6",
                      flexShrink: 0,
                    }}
                  >
                    {isExam ? (
                      <SchoolOutlinedIcon sx={{ fontSize: 17 }} />
                    ) : (
                      <DescriptionOutlinedIcon sx={{ fontSize: 17 }} />
                    )}
                  </Box>

                  <Box>
                    <Typography fontSize={13} fontWeight={600} lineHeight={1.3}>
                      {item.courseTitle}
                    </Typography>

                    <Typography
                      fontSize={12}
                      color="text.secondary"
                      lineHeight={1.3}
                    >
                      {item.description}
                    </Typography>
                  </Box>
                </Box>

                {/* Right: date + semester */}
                <Box textAlign="left" flexShrink={0}>
                  <Typography fontSize={12} fontWeight={500}>
                    {formatEventDate(item.eventDate)}
                  </Typography>

                  <Typography fontSize={11} color="text.secondary">
                    {item.semesterLabel}
                  </Typography>
                </Box>
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
          <Typography fontSize={13}>הוסף אירוע</Typography>
          <AddIcon fontSize="small" />
        </Box>
      </Paper>

      <GenericFormModal
        open={modalOpen}
        onClose={handleCloseModal}
        title="Add Event"
        fields={EVENT_FIELDS}
        values={modalValues}
        onChange={(name, value) =>
          setModalValues((prev) => ({
            ...prev,
            [name]: value,
          }))
        }
        onSave={handleSaveEvent}
        saveLabel="Save"
        cancelLabel="Cancel"
      />
    </>
  );
};
