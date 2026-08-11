import AddIcon from "@mui/icons-material/Add";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import {
  Box,
  Button,
  IconButton,
  MenuItem,
  Paper,
  Select,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  createUpcomingEvent,
  deleteUpcomingEvent,
  getHomeDashboard,
  homeDashboardQueryKey,
  updateExam,
} from "../../api/home";
import {
  GenericFormModal,
  type FormField,
  type FormValues,
} from "../GenericFormModal/GenericFormModal";
const PAGE_SIZE = 4;

const EVENT_FIELDS: FormField[] = [
  {
    type: "text",
    name: "description",
    label: "תיאור המבחן",
    placeholder: "מבחן סופי",
  },
  {
    type: "date",
    name: "eventDate",
    label: "תאריך המבחן",
  },
];

const formatEventDate = (value: string) => {
  const date = new Date(value);

  return new Intl.DateTimeFormat("he-IL", {
    day: "numeric",
    month: "long",
  }).format(date);
};

type UpcomingEventsProps = {
  selectedCourseTitle?: string | null;
};

export const UpcomingEvents = ({
  selectedCourseTitle = null,
}: UpcomingEventsProps) => {
  const currentYear = new Date().getFullYear();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);
  const [editingEvent, setEditingEvent] = useState<{
    id: string;
    date: string;
    typeLabel: string;
  } | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalValues, setModalValues] = useState<FormValues>({});

  const { data } = useQuery({
    queryKey: homeDashboardQueryKey,
    queryFn: getHomeDashboard,
  });

  const serverItems = useMemo(
    () =>
      (data?.upcomingEvents ?? []).filter(
        (item) =>
          item.kind === "exam" &&
          (!selectedCourseTitle || item.courseTitle === selectedCourseTitle)
      ),
    [data?.upcomingEvents, selectedCourseTitle]
  );

  const allItems = useMemo(() => serverItems, [serverItems]);

  const courseOptions = useMemo(() => {
    const uniqueCourseTitles = Array.from(
      new Set((data?.coursesSummary ?? []).map((course) => course.courseTitle))
    ).filter(Boolean);

    return uniqueCourseTitles.map((courseTitle) => ({
      label: courseTitle,
      value: courseTitle,
    }));
  }, [data?.coursesSummary]);

  const eventFields = useMemo<FormField[]>(
    () => [
      {
        type: "select",
        name: "courseTitle",
        label: "שם הקורס",
        options: courseOptions,
      },
      {
        type: "select",
        name: "semesterLabel",
        label: "סמסטר",
        options: [
          { label: "א", value: "1" },
          { label: "ב", value: "2" },
          { label: "קיץ", value: "3" },
        ],
      },
      ...EVENT_FIELDS,
    ],
    [courseOptions, currentYear]
  );
  const canCreateEvent = courseOptions.length > 0;

  const createEventMutation = useMutation({
    mutationFn: createUpcomingEvent,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: homeDashboardQueryKey });
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: deleteUpcomingEvent,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: homeDashboardQueryKey });
    },
  });

  const updateExamMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: { date?: string; type?: number };
    }) => updateExam(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: homeDashboardQueryKey });
      setEditingEvent(null);
    },
  });

  const totalPages = Math.max(1, Math.ceil(allItems.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return allItems.slice(startIndex, startIndex + PAGE_SIZE);
  }, [allItems, currentPage]);

  const paddedItems = useMemo(() => {
    const items: ((typeof currentItems)[number] | null)[] = [...currentItems];

    while (items.length < PAGE_SIZE) {
      items.push(null);
    }

    return items;
  }, [currentItems]);

  const handlePrevPage = () => {
    setPage((prev) => Math.max(1, Math.min(prev, totalPages) - 1));
  };

  const handleNextPage = () => {
    setPage((prev) => Math.min(totalPages, Math.min(prev, totalPages) + 1));
  };

  const handleOpenModal = () => {
    if (!canCreateEvent) {
      return;
    }

    setModalValues({
      semesterLabel: "1",
    });
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setModalValues({});
  };

  const handleSaveEvent = (values: FormValues) => {
    createEventMutation.mutate({
      courseTitle: values.courseTitle ?? "",
      description: values.description ?? "",
      eventDate: values.eventDate ?? "",
      kind: "exam",
      semesterNumber: parseInt(values.semesterLabel ?? "1", 10),
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
            <CheckCircleIcon sx={{ color: "#22c55e", fontSize: 20 }} />

            <Typography fontWeight={600} fontSize={15}>
              אירועים קרובים
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" gap={0.5}>
            <Typography fontSize={12} color="text.secondary">
              עמוד {currentPage} מתוך {totalPages}
            </Typography>

            <IconButton
              size="small"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              sx={{ p: 0.3 }}
            >
              <ChevronRightRoundedIcon fontSize="small" />
            </IconButton>

            <IconButton
              size="small"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
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
                  cursor: "pointer",
                  transition: "background-color 0.18s ease",
                  ...(hoveredItemId === item.id && { bgcolor: "action.hover" }),
                  "&:last-of-type": { borderBottom: "none" },
                }}
                onMouseEnter={() => setHoveredItemId(item.id)}
                onMouseLeave={() =>
                  setHoveredItemId((prev) => (prev === item.id ? null : prev))
                }
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

                {/* Right: date + semester + delete */}
                <Box
                  display="flex"
                  alignItems="center"
                  gap={0.5}
                  flexShrink={0}
                >
                  <Box textAlign="left">
                    <Typography fontSize={12} fontWeight={500}>
                      {formatEventDate(item.eventDate)}
                    </Typography>

                    <Typography fontSize={11} color="text.secondary">
                      {item.semesterLabel}
                    </Typography>
                  </Box>

                  {hoveredItemId === item.id && (
                    <>
                      <Tooltip title="ערוך אירוע">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingEvent({
                              id: item.id,
                              date: item.eventDate.slice(0, 10),
                              typeLabel: item.description,
                            });
                          }}
                          sx={{
                            p: 0.45,
                            color: "text.secondary",
                            "&:hover": { bgcolor: "action.hover" },
                          }}
                        >
                          <EditOutlinedIcon sx={{ fontSize: 17 }} />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="מחק אירוע">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteEventMutation.mutate(item.id);
                          }}
                          sx={{
                            p: 0.45,
                            color: "text.secondary",
                            "&:hover": { bgcolor: "action.hover" },
                          }}
                        >
                          <DeleteOutlineIcon sx={{ fontSize: 17 }} />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>
        {editingEvent && (
          <Box
            sx={{
              mt: 2,
              p: 2,
              borderRadius: 2,
              border: "1px solid",
              borderColor: "primary.main",
              bgcolor: "background.paper",
            }}
          >
            <Typography fontWeight={600} fontSize={13} mb={1.5}>
              עריכת אירוע
            </Typography>

            <Box display="flex" gap={1.5} mb={1.5}>
              <Box flex={1}>
                <Typography fontSize={12} color="text.secondary" mb={0.5}>
                  תאריך
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  type="date"
                  value={editingEvent.date}
                  onChange={(e) =>
                    setEditingEvent((v) =>
                      v ? { ...v, date: e.target.value } : v
                    )
                  }
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
                />
              </Box>
              <Box flex={1}>
                <Typography fontSize={12} color="text.secondary" mb={0.5}>
                  סוג
                </Typography>
                <Select
                  fullWidth
                  size="small"
                  value={editingEvent.typeLabel}
                  onChange={(e) =>
                    setEditingEvent((v) =>
                      v ? { ...v, typeLabel: e.target.value } : v
                    )
                  }
                  sx={{ borderRadius: 1.5 }}
                >
                  <MenuItem value="מועד א׳">מועד א׳</MenuItem>
                  <MenuItem value="מועד ב׳">מועד ב׳</MenuItem>
                </Select>
              </Box>
            </Box>

            <Box display="flex" gap={1} justifyContent="flex-end">
              <Button size="small" onClick={() => setEditingEvent(null)}>
                ביטול
              </Button>
              <Button
                size="small"
                variant="contained"
                disabled={updateExamMutation.isPending}
                onClick={() =>
                  updateExamMutation.mutate({
                    id: editingEvent.id,
                    payload: {
                      date: editingEvent.date || undefined,
                      type: editingEvent.typeLabel === "מועד ב׳" ? 2 : 1,
                    },
                  })
                }
                sx={{ bgcolor: "#22c55e", "&:hover": { bgcolor: "#16a34a" } }}
              >
                שמור
              </Button>
            </Box>
          </Box>
        )}

        <Box
          display="flex"
          alignItems="center"
          gap={0.5}
          sx={{
            cursor: canCreateEvent ? "pointer" : "not-allowed",
            color: "text.secondary",
            opacity: canCreateEvent ? 1 : 0.5,
            mt: 1,
            justifyContent: "flex-start",
          }}
          onClick={handleOpenModal}
        >
          <Typography fontSize={13}>הוסף אירוע</Typography>
          <AddIcon fontSize="small" />
        </Box>
        {!canCreateEvent && (
          <Typography color="text.secondary" fontSize={12} mt={0.5}>
            כדי להוסיף אירוע צריך קודם קורס אחד לפחות.
          </Typography>
        )}
      </Paper>

      <GenericFormModal
        open={modalOpen}
        onClose={handleCloseModal}
        title="הוסף אירוע"
        fields={eventFields}
        values={modalValues}
        onChange={(name, value) =>
          setModalValues((prev) => ({
            ...prev,
            [name]: value,
          }))
        }
        onSave={handleSaveEvent}
        saveLabel="שמור"
        cancelLabel="ביטול"
      />
    </>
  );
};
