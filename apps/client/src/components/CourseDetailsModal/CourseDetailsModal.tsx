import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import BookOutlinedIcon from "@mui/icons-material/BookOutlined";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  courseDetailsQueryKey,
  getCourseDetails,
  updateCourseDetails,
} from "../../api/courses";
import {
  createHomeAssignment,
  homeDashboardQueryKey,
  updateAssignment,
  updateExam,
} from "../../api/home";
import { CourseAssessmentsTab } from "./CourseAssessmentsTab";
import { CourseInfoTab } from "./CourseInfoTab";
import { CourseSyllabusTab } from "./CourseSyllabusTab";
import { TabPanel } from "./courseDetailsUtils";

type CourseDetailsModalProps = {
  open: boolean;
  onClose: () => void;
  studentSemesterCourseId: string | null;
  courseTitle?: string | null;
};

type NewAssignment = {
  title: string;
  dueDate: string;
  type: "assignment" | "homework" | "project" | "lab" | "report" | "practice";
};

type EditingAssessment = {
  id: string;
  title: string;
  dueDate: string;
  status: "not started" | "active" | "done";
  type: "assignment" | "homework" | "project" | "lab" | "report" | "practice";
  kind: string;
} | null;

export const CourseDetailsModal = ({
  open,
  onClose,
  studentSemesterCourseId,
  courseTitle,
}: CourseDetailsModalProps) => {
  const [activeTab, setActiveTab] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingAssignment, setIsAddingAssignment] = useState(false);
  const [editingAssessment, setEditingAssessment] =
    useState<EditingAssessment>(null);
  const [newAssignment, setNewAssignment] = useState<NewAssignment>({
    title: "",
    dueDate: "",
    type: "assignment",
  });
  const [editValues, setEditValues] = useState({
    title: "",
    credits: "",
    semesterNumber: "1",
  });

  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: courseDetailsQueryKey(studentSemesterCourseId),
    queryFn: () => getCourseDetails(studentSemesterCourseId!),
    enabled: open && Boolean(studentSemesterCourseId),
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (data && !isEditing) {
      setEditValues({
        title: data.title,
        credits: data.credits != null ? String(data.credits) : "",
        semesterNumber: String(data.semesterNumber),
      });
    }
  }, [data, isEditing]);

  const updateMutation = useMutation({
    mutationFn: (payload: {
      title?: string;
      credits?: number;
      semesterNumber?: number;
    }) => updateCourseDetails(studentSemesterCourseId!, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: courseDetailsQueryKey(studentSemesterCourseId),
      });
      await queryClient.invalidateQueries({ queryKey: homeDashboardQueryKey });
      setIsEditing(false);
    },
  });

  const addAssignmentMutation = useMutation({
    mutationFn: createHomeAssignment,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: courseDetailsQueryKey(studentSemesterCourseId),
      });
      await queryClient.invalidateQueries({ queryKey: homeDashboardQueryKey });
      setIsAddingAssignment(false);
      setNewAssignment({ title: "", dueDate: "", type: "assignment" });
    },
  });

  const updateAssignmentMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: {
        title?: string;
        dueDate?: string;
        status?: "not started" | "active" | "done";
        type?:
          "assignment" | "homework" | "practice" | "project" | "report" | "lab";
      };
    }) => updateAssignment(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: courseDetailsQueryKey(studentSemesterCourseId),
      });
      await queryClient.invalidateQueries({ queryKey: homeDashboardQueryKey });
      setEditingAssessment(null);
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
      await queryClient.invalidateQueries({
        queryKey: courseDetailsQueryKey(studentSemesterCourseId),
      });
      await queryClient.invalidateQueries({ queryKey: homeDashboardQueryKey });
      setEditingAssessment(null);
    },
  });

  const handleSaveEdit = () => {
    const credits = parseFloat(editValues.credits);
    updateMutation.mutate({
      title: editValues.title.trim() || undefined,
      credits: isNaN(credits) ? undefined : credits,
      semesterNumber: parseInt(editValues.semesterNumber, 10),
    });
  };

  const handleSaveAssignment = () => {
    if (!data || !newAssignment.title.trim() || !newAssignment.dueDate) return;
    addAssignmentMutation.mutate({
      course: data.title,
      title: newAssignment.title.trim(),
      dueDate: newAssignment.dueDate,
      status: "not started",
      type: newAssignment.type,
    });
  };

  const handleClose = () => {
    setActiveTab(0);
    setIsEditing(false);
    setIsAddingAssignment(false);
    setEditingAssessment(null);
    setNewAssignment({ title: "", dueDate: "", type: "assignment" });
    onClose();
  };

  const displayedTitle = data?.title || courseTitle || "פרטי הקורס";

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="md"
      dir="rtl"
      PaperProps={{
        sx: {
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          backgroundImage: "none",
          overflow: "hidden",
        },
      }}
    >
      <DialogTitle
        component="div"
        sx={{ p: 0, borderBottom: "1px solid", borderColor: "divider" }}
      >
        <Box
          sx={{
            px: 2.5,
            py: 2,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Box display="flex" alignItems="center" gap={1.5} minWidth={0}>
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: 2.5,
                bgcolor: "action.hover",
                color: "#22c55e",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <BookOutlinedIcon />
            </Box>

            <Box minWidth={0}>
              <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                <Typography fontWeight={600} fontSize={17} noWrap>
                  {displayedTitle}
                </Typography>
                {data ? (
                  <Chip
                    size="small"
                    label={data.syllabus.exists ? "מידע מסילבוס" : "ללא סילבוס"}
                    sx={{
                      height: 21,
                      fontSize: 10,
                      fontWeight: 500,
                      bgcolor: data.syllabus.exists
                        ? "var(--sb-chip-status-done-bg)"
                        : "var(--sb-chip-status-default-bg)",
                      color: data.syllabus.exists
                        ? "var(--sb-chip-status-done-text)"
                        : "var(--sb-chip-status-default-text)",
                    }}
                  />
                ) : null}
              </Box>
              <Typography color="text.secondary" fontSize={13} noWrap>
                {data?.englishTitle || data?.degreeTitle || "טוען פרטי קורס..."}
              </Typography>
            </Box>
          </Box>

          <Box display="flex" alignItems="center" gap={0.5}>
            <IconButton
              size="small"
              aria-label="סגור"
              onClick={handleClose}
              sx={{ mt: -0.5 }}
            >
              <CloseRoundedIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        <Tabs
          value={activeTab}
          onChange={(_e, v: number) => setActiveTab(v)}
          variant="fullWidth"
          sx={{
            minHeight: 44,
            "& .MuiTab-root": { minHeight: 44, fontSize: 13, fontWeight: 500 },
            "& .MuiTabs-indicator": { bgcolor: "#22c55e" },
            "& .Mui-selected": { color: "#16a34a !important" },
          }}
        >
          <Tab
            icon={<InfoOutlinedIcon fontSize="small" />}
            iconPosition="start"
            label="פרטי הקורס"
          />
          <Tab
            icon={<AssignmentOutlinedIcon fontSize="small" />}
            iconPosition="start"
            label="מטלות ומבחנים"
          />
          <Tab
            icon={<SchoolOutlinedIcon fontSize="small" />}
            iconPosition="start"
            label="תוכן הסילבוס"
          />
        </Tabs>
      </DialogTitle>

      <DialogContent
        sx={{
          p: 2.5,
          bgcolor: "background.default",
          minHeight: { xs: 520, md: 560 },
        }}
      >
        {!studentSemesterCourseId ? (
          <Alert severity="error">
            לא נמצא מזהה הקורס של הסטודנט. יש לפתוח את החלון מתוך רשימת הקורסים.
          </Alert>
        ) : isLoading ? (
          <Box
            minHeight={420}
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            gap={1.5}
          >
            <CircularProgress size={32} />
            <Typography color="text.secondary" fontSize={13}>
              טוען את פרטי הקורס...
            </Typography>
          </Box>
        ) : isError || !data ? (
          <Box
            minHeight={420}
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            gap={2}
          >
            <Alert severity="error" sx={{ width: "100%" }}>
              לא הצלחנו לטעון את פרטי הקורס.
            </Alert>
            <Button variant="outlined" onClick={() => refetch()}>
              נסה שוב
            </Button>
          </Box>
        ) : (
          <>
            <TabPanel activeTab={activeTab} index={0}>
              <CourseInfoTab
                data={data}
                isEditing={isEditing}
                setIsEditing={setIsEditing}
                editValues={editValues}
                setEditValues={setEditValues}
                updateMutation={updateMutation}
                handleSaveEdit={handleSaveEdit}
              />
            </TabPanel>

            <TabPanel activeTab={activeTab} index={1}>
              <CourseAssessmentsTab
                assessments={data.assessments}
                isAddingAssignment={isAddingAssignment}
                setIsAddingAssignment={setIsAddingAssignment}
                newAssignment={newAssignment}
                setNewAssignment={setNewAssignment}
                addAssignmentMutation={addAssignmentMutation}
                handleSaveAssignment={handleSaveAssignment}
                editingAssessment={editingAssessment}
                setEditingAssessment={setEditingAssessment}
                updateAssignmentMutation={updateAssignmentMutation}
                updateExamMutation={updateExamMutation}
              />
            </TabPanel>

            <TabPanel activeTab={activeTab} index={2}>
              <CourseSyllabusTab data={data} />
            </TabPanel>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
