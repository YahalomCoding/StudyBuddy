import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import BookOutlinedIcon from "@mui/icons-material/BookOutlined";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
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
  Divider,
  IconButton,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  courseDetailsQueryKey,
  getCourseDetails,
  type CourseDetailsAssessment,
} from "../../api/courses";

type CourseDetailsModalProps = {
  open: boolean;
  onClose: () => void;
  studentSemesterCourseId: string | null;
  courseTitle?: string | null;
};

type TabPanelProps = {
  activeTab: number;
  index: number;
  children: React.ReactNode;
};

const TabPanel = ({ activeTab, index, children }: TabPanelProps) => {
  if (activeTab !== index) {
    return null;
  }

  return <Box sx={{ pt: 2.5 }}>{children}</Box>;
};

const InfoField = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <Box>
    <Typography fontSize={12} color="text.secondary" sx={{ mb: 0.35 }}>
      {label}
    </Typography>
    <Typography fontSize={14} fontWeight={500}>
      {value}
    </Typography>
  </Box>
);

const ContentSection = ({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) => (
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
    <Box display="flex" alignItems="center" gap={1} mb={1.5}>
      {icon}
      <Typography fontSize={15} fontWeight={600}>
        {title}
      </Typography>
    </Box>
    {children}
  </Paper>
);

const valueOrDash = (
  value: string | number | null | undefined,
): string | number => {
  if (value === null || value === undefined || value === "") {
    return "לא צוין";
  }

  return value;
};

const formatDate = (value: string | null): string => {
  if (!value) {
    return "לא צוין";
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("he-IL");
};

const statusLabel = (
  status: CourseDetailsAssessment["status"],
): string => {
  switch (status) {
    case "done":
      return "בוצע";
    case "active":
      return "בתהליך";
    case "not started":
      return "לא התחיל";
    default:
      return "לא צוין";
  }
};

const submissionModeLabel = (
  assessment: CourseDetailsAssessment,
): string => {
  if (assessment.submissionMode === "individual") {
    return "אישי";
  }

  if (assessment.submissionMode === "group") {
    return assessment.groupSize
      ? `${assessment.groupSize} סטודנטים`
      : "קבוצתי";
  }

  return "לא צוין";
};

const statusChipSx = (
  status: CourseDetailsAssessment["status"],
) => {
  if (status === "done") {
    return {
      bgcolor: "var(--sb-chip-status-done-bg)",
      color: "var(--sb-chip-status-done-text)",
    };
  }

  if (status === "active") {
    return {
      bgcolor: "var(--sb-chip-status-active-bg)",
      color: "var(--sb-chip-status-active-text)",
    };
  }

  return {
    bgcolor: "var(--sb-chip-status-default-bg)",
    color: "var(--sb-chip-status-default-text)",
  };
};

export const CourseDetailsModal = ({
  open,
  onClose,
  studentSemesterCourseId,
  courseTitle,
}: CourseDetailsModalProps) => {
  const [activeTab, setActiveTab] = useState(0);

  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: courseDetailsQueryKey(studentSemesterCourseId),
    queryFn: () => getCourseDetails(studentSemesterCourseId!),
    enabled: open && Boolean(studentSemesterCourseId),
    staleTime: 5 * 60 * 1000,
  });

  const handleClose = () => {
    setActiveTab(0);
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
        sx={{
          p: 0,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
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
                    label={
                      data.syllabus.exists
                        ? "מידע מסילבוס"
                        : "ללא סילבוס"
                    }
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
                {data?.englishTitle ||
                  data?.degreeTitle ||
                  "טוען פרטי קורס..."}
              </Typography>
            </Box>
          </Box>

          <IconButton
            size="small"
            aria-label="סגור"
            onClick={handleClose}
            sx={{ mt: -0.5 }}
          >
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        </Box>

        <Tabs
          value={activeTab}
          onChange={(_event, value: number) => setActiveTab(value)}
          variant="fullWidth"
          sx={{
            minHeight: 44,
            "& .MuiTab-root": {
              minHeight: 44,
              fontSize: 13,
              fontWeight: 500,
            },
            "& .MuiTabs-indicator": {
              bgcolor: "#22c55e",
            },
            "& .Mui-selected": {
              color: "#16a34a !important",
            },
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
            לא נמצא מזהה הקורס של הסטודנט. יש לפתוח את החלון מתוך רשימת
            הקורסים.
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
              <Stack spacing={2}>
                <ContentSection
                  title="מידע כללי"
                  icon={
                    <InfoOutlinedIcon
                      sx={{ fontSize: 19, color: "#22c55e" }}
                    />
                  }
                >
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: {
                        xs: "1fr 1fr",
                        md: "repeat(4, minmax(0, 1fr))",
                      },
                      gap: 2,
                    }}
                  >
                    <InfoField
                      label="קוד קורס"
                      value={valueOrDash(data.code)}
                    />
                    <InfoField
                      label="נקודות זכות"
                      value={
                        data.credits === null
                          ? "לא צוין"
                          : `${data.credits} נ״ז`
                      }
                    />
                    <InfoField
                      label="שעות שבועיות"
                      value={
                        data.weeklyHours === null
                          ? "לא צוין"
                          : `${data.weeklyHours} ש״ס`
                      }
                    />
                    <InfoField
                      label="שנה וסמסטר"
                      value={`${data.academicYearLabel} · סמסטר ${data.semesterLabel}`}
                    />
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                      gap: 2,
                    }}
                  >
                    <InfoField
                      label="מוסד"
                      value={valueOrDash(data.institution)}
                    />
                    <InfoField
                      label="פקולטה / מסלול"
                      value={
                        data.faculty ||
                        data.degreeTitle ||
                        "לא צוין"
                      }
                    />
                  </Box>
                </ContentSection>

                <ContentSection
                  title="מרצים"
                  icon={
                    <PersonOutlineRoundedIcon
                      sx={{ fontSize: 19, color: "#22c55e" }}
                    />
                  }
                >
                  {data.lecturers.length === 0 ? (
                    <Typography color="text.secondary" fontSize={13}>
                      לא נמצאו פרטי מרצה בסילבוס.
                    </Typography>
                  ) : (
                    <Stack spacing={1.25}>
                      {data.lecturers.map((lecturer, index) => (
                        <Box
                          key={`${lecturer.email ?? "lecturer"}-${index}`}
                          sx={{
                            display: "flex",
                            alignItems: { xs: "flex-start", sm: "center" },
                            flexDirection: { xs: "column", sm: "row" },
                            justifyContent: "space-between",
                            gap: 1.5,
                            pb:
                              index === data.lecturers.length - 1
                                ? 0
                                : 1.25,
                            borderBottom:
                              index === data.lecturers.length - 1
                                ? "none"
                                : "1px solid",
                            borderColor: "divider",
                          }}
                        >
                          <Box>
                            <Typography fontWeight={500} fontSize={14}>
                              {lecturer.name || "שם המרצה לא צוין"}
                            </Typography>

                            {lecturer.email ? (
                              <Box
                                display="flex"
                                alignItems="center"
                                gap={0.6}
                                mt={0.5}
                              >
                                <EmailOutlinedIcon
                                  sx={{
                                    fontSize: 16,
                                    color: "text.secondary",
                                  }}
                                />
                                <Typography
                                  color="text.secondary"
                                  fontSize={13}
                                >
                                  {lecturer.email}
                                </Typography>
                              </Box>
                            ) : null}
                          </Box>

                          <Stack
                            direction="row"
                            spacing={0.75}
                            flexWrap="wrap"
                          >
                            {lecturer.officeHours ? (
                              <Chip
                                size="small"
                                label={lecturer.officeHours}
                                variant="outlined"
                              />
                            ) : null}
                            {lecturer.location ? (
                              <Chip
                                size="small"
                                label={lecturer.location}
                                variant="outlined"
                              />
                            ) : null}
                          </Stack>
                        </Box>
                      ))}
                    </Stack>
                  )}
                </ContentSection>

                <ContentSection title="תיאור הקורס">
                  <Typography
                    fontSize={14}
                    lineHeight={1.8}
                    color="text.secondary"
                  >
                    {data.description || "לא נמצא תיאור קורס בסילבוס."}
                  </Typography>
                </ContentSection>

                <ContentSection title="שיטת הוראה ודרישות קדם">
                  <Stack spacing={1.25}>
                    <InfoField
                      label="שיטת הוראה"
                      value={valueOrDash(data.teachingMethod)}
                    />
                    <InfoField
                      label="דרישות קדם"
                      value={
                        data.prerequisites.length > 0
                          ? data.prerequisites.join(" · ")
                          : "לא צוינו"
                      }
                    />
                  </Stack>
                </ContentSection>
              </Stack>
            </TabPanel>

            <TabPanel activeTab={activeTab} index={1}>
              {data.assessments.length === 0 ? (
                <Alert severity="info">
                  לא נמצאו מטלות או מבחנים עבור הקורס.
                </Alert>
              ) : (
                <Paper
                  elevation={0}
                  sx={{
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: "divider",
                    overflow: "hidden",
                    bgcolor: "background.paper",
                  }}
                >
                  <Box sx={{ overflowX: "auto" }}>
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns:
                          "minmax(190px, 1fr) 90px 70px 105px 105px 110px",
                        gap: 1,
                        px: 2,
                        py: 1.2,
                        bgcolor: "action.hover",
                        borderBottom: "1px solid",
                        borderColor: "divider",
                        minWidth: 730,
                      }}
                    >
                      {[
                        "שם",
                        "סוג",
                        "משקל",
                        "תאריך",
                        "הגשה",
                        "סטטוס",
                      ].map((label) => (
                        <Typography
                          key={label}
                          fontSize={12}
                          color="text.secondary"
                          fontWeight={500}
                        >
                          {label}
                        </Typography>
                      ))}
                    </Box>

                    {data.assessments.map((assessment) => (
                      <Box
                        key={assessment.id}
                        sx={{
                          display: "grid",
                          gridTemplateColumns:
                            "minmax(190px, 1fr) 90px 70px 105px 105px 110px",
                          gap: 1,
                          alignItems: "center",
                          px: 2,
                          py: 1.35,
                          minWidth: 730,
                          borderBottom: "1px solid",
                          borderColor: "divider",
                          "&:last-of-type": {
                            borderBottom: "none",
                          },
                          "&:hover": {
                            bgcolor: "action.hover",
                          },
                        }}
                      >
                        <Box minWidth={0}>
                          <Typography
                            fontSize={13}
                            fontWeight={500}
                            noWrap
                          >
                            {assessment.title}
                          </Typography>
                          {assessment.notes ? (
                            <Typography
                              fontSize={11}
                              color="text.secondary"
                              noWrap
                            >
                              {assessment.notes}
                            </Typography>
                          ) : null}
                        </Box>

                        <Chip
                          size="small"
                          label={assessment.typeLabel}
                          sx={{
                            width: "fit-content",
                            bgcolor:
                              "var(--sb-chip-type-default-bg)",
                            color:
                              "var(--sb-chip-type-default-text)",
                            fontWeight: 500,
                            fontSize: 11,
                            height: 22,
                          }}
                        />

                        <Typography fontSize={13}>
                          {assessment.weightPercent === null
                            ? "—"
                            : `${assessment.weightPercent}%`}
                        </Typography>

                        <Typography
                          fontSize={12}
                          color="text.secondary"
                        >
                          {formatDate(assessment.dueDate)}
                        </Typography>

                        <Typography
                          fontSize={12}
                          color="text.secondary"
                        >
                          {submissionModeLabel(assessment)}
                        </Typography>

                        <Chip
                          size="small"
                          label={statusLabel(assessment.status)}
                          sx={{
                            width: "fit-content",
                            ...statusChipSx(assessment.status),
                            fontWeight: 500,
                            fontSize: 11,
                            height: 22,
                          }}
                        />
                      </Box>
                    ))}
                  </Box>
                </Paper>
              )}
            </TabPanel>

            <TabPanel activeTab={activeTab} index={2}>
              {!data.syllabus.exists ? (
                <Alert severity="info">
                  עדיין לא הועלה סילבוס לקורס הזה. פרטי הקורס והמטלות
                  נשאבו מהמידע הקיים במערכת.
                </Alert>
              ) : (
                <Stack spacing={2}>
                  <ContentSection title="תוצרי למידה">
                    {data.learningOutcomes.length === 0 ? (
                      <Typography
                        fontSize={13}
                        color="text.secondary"
                      >
                        לא נמצאו תוצרי למידה.
                      </Typography>
                    ) : (
                      <Stack
                        component="ol"
                        spacing={1}
                        sx={{ m: 0, pr: 2.5 }}
                      >
                        {data.learningOutcomes.map((outcome) => (
                          <Typography
                            key={outcome}
                            component="li"
                            fontSize={14}
                            color="text.secondary"
                            lineHeight={1.7}
                          >
                            {outcome}
                          </Typography>
                        ))}
                      </Stack>
                    )}
                  </ContentSection>

                  <ContentSection title="נושאי הקורס">
                    {data.topics.length === 0 ? (
                      <Typography
                        fontSize={13}
                        color="text.secondary"
                      >
                        לא נמצאו נושאי קורס.
                      </Typography>
                    ) : (
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: {
                            xs: "1fr",
                            md: "1fr 1fr",
                          },
                          gap: 1,
                        }}
                      >
                        {data.topics.map((topic) => (
                          <Box
                            key={topic.id}
                            display="flex"
                            alignItems="center"
                            gap={1}
                            sx={{
                              py: 0.75,
                              px: 1,
                              borderRadius: 2,
                              "&:hover": {
                                bgcolor: "action.hover",
                              },
                            }}
                          >
                            <Box
                              sx={{
                                width: 24,
                                height: 24,
                                borderRadius: "50%",
                                bgcolor: "action.hover",
                                color: "text.secondary",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 11,
                                fontWeight: 600,
                                flexShrink: 0,
                              }}
                            >
                              {topic.order}
                            </Box>
                            <Typography fontSize={13}>
                              {topic.title}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    )}
                  </ContentSection>

                  <ContentSection title="מדיניות הקורס">
                    {data.policies.length === 0 ? (
                      <Typography
                        fontSize={13}
                        color="text.secondary"
                      >
                        לא נמצאה מדיניות קורס.
                      </Typography>
                    ) : (
                      <Stack spacing={1}>
                        {data.policies.map((policy) => (
                          <Typography
                            key={policy}
                            fontSize={14}
                            color="text.secondary"
                            lineHeight={1.7}
                          >
                            • {policy}
                          </Typography>
                        ))}
                      </Stack>
                    )}
                  </ContentSection>

                  <ContentSection title="מדיניות שימוש בבינה מלאכותית">
                    <Typography
                      fontSize={14}
                      color="text.secondary"
                      lineHeight={1.7}
                    >
                      {data.aiPolicy || "לא צוינה מדיניות שימוש ב־AI."}
                    </Typography>
                  </ContentSection>

                  <ContentSection title="ביבליוגרפיה">
                    {data.bibliography.length === 0 ? (
                      <Typography
                        fontSize={13}
                        color="text.secondary"
                      >
                        לא נמצאה ביבליוגרפיה.
                      </Typography>
                    ) : (
                      <Stack spacing={0.8}>
                        {data.bibliography.map((item) => (
                          <Typography
                            key={item}
                            fontSize={13}
                            color="text.secondary"
                          >
                            • {item}
                          </Typography>
                        ))}
                      </Stack>
                    )}
                  </ContentSection>
                </Stack>
              )}
            </TabPanel>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};