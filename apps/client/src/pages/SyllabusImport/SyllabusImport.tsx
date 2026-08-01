import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import axios from "axios";
import { useQueryClient } from "@tanstack/react-query";
import {
  useMemo,
  useRef,
  useState,
  type DragEvent,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import { homeDashboardQueryKey } from "../../api/home";
import {
  confirmSyllabus,
  previewSyllabus,
  type AssessmentKind,
  type ConfirmSyllabusResponse,
  type Lecturer,
  type SyllabusAssessment,
  type SyllabusPreview,
} from "../../api/syllabi";
import {
  activeStatusChipClass,
  assessmentTypeChipClass,
  defaultStatusChipClass,
  doneStatusChipClass,
  useStyles,
} from "./style";

const STEPS = ["העלאת קובץ", "בדיקה ועריכה", "נוסף ל־StudyBuddy"];

const ASSESSMENT_LABELS: Record<AssessmentKind, string> = {
  assignment: "מטלה",
  exam: "מבחן",
  project: "פרויקט",
  presentation: "מצגת",
  participation: "השתתפות",
  lab: "מעבדה",
  other: "אחר",
};

const multilineValue = (items: string[]): string => items.join("\n");
const multilineItems = (value: string): string[] =>
  value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

const nullableNumber = (value: string): number | null => {
  if (value.trim() === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const nullableInteger = (value: string): number | null => {
  const number = nullableNumber(value);
  return number === null ? null : Math.trunc(number);
};

const isValidDateOnly = (value: string | null): boolean => {
  if (!value) return false;

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
};

const errorMessage = (error: unknown): string => {
  if (axios.isAxiosError<{ message?: string | string[] }>(error)) {
    const responseMessage = error.response?.data?.message;
    if (Array.isArray(responseMessage)) return responseMessage.join(", ");
    if (typeof responseMessage === "string") return responseMessage;
  }

  return error instanceof Error ? error.message : "אירעה שגיאה לא צפויה";
};

const newId = (prefix: string): string =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

type CourseDetails = SyllabusPreview["syllabus"]["course"];
type SyllabusStyles = ReturnType<typeof useStyles>;

const SectionCard = ({
  title,
  subtitle,
  children,
  styles,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  styles: SyllabusStyles;
}) => (
  <Paper elevation={0} className={styles.card}>
    <Box className={styles.sectionHeader}>
      <Typography className={styles.sectionTitle}>{title}</Typography>
      {subtitle ? (
        <Typography className={styles.sectionSubtitle}>{subtitle}</Typography>
      ) : null}
    </Box>
    <Box className={styles.cardContent}>{children}</Box>
  </Paper>
);

export const SyllabusImport = () => {
  const styles = useStyles();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [draft, setDraft] = useState<SyllabusPreview | null>(null);
  const [result, setResult] = useState<ConfirmSyllabusResponse | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const activeStep = result ? 2 : draft ? 1 : 0;

  const validationErrors = useMemo(() => {
    if (!draft) return [];

    const errors: string[] = [];

    if (!draft.syllabus.course.title?.trim()) {
      errors.push("חובה למלא את שם הקורס.");
    }

    if (!draft.destination.degreeId && !draft.destination.degreeTitle?.trim()) {
      errors.push("יש לבחור מסלול לימודים או להזין שם למסלול חדש.");
    }

    if (
      !Number.isInteger(draft.destination.yearNumber) ||
      draft.destination.yearNumber < 2000
    ) {
      errors.push("יש להזין שנת לימודים תקינה.");
    }

    if (
      !Number.isInteger(draft.destination.semesterNumber) ||
      draft.destination.semesterNumber < 1 ||
      draft.destination.semesterNumber > 3
    ) {
      errors.push("הסמסטר חייב להיות 1, 2 או 3.");
    }

    const assessmentsWithoutTitles = draft.syllabus.assessments.filter(
      (assessment) => !assessment.title.trim(),
    );

    if (assessmentsWithoutTitles.length > 0) {
      errors.push(
        `${assessmentsWithoutTitles.length} מטלות או מבחנים חסרים שם.`,
      );
    }

    const assessmentsWithoutDates = draft.syllabus.assessments.filter(
      (assessment) => !assessment.dueDate?.trim(),
    );

    if (assessmentsWithoutDates.length > 0) {
      errors.push(
        `${assessmentsWithoutDates.length} מטלות או מבחנים חסרים תאריך.`,
      );
    }

    const assessmentsWithInvalidDates = draft.syllabus.assessments.filter(
      (assessment) =>
        Boolean(assessment.dueDate?.trim()) &&
        !isValidDateOnly(assessment.dueDate),
    );

    if (assessmentsWithInvalidDates.length > 0) {
      errors.push(
        `${assessmentsWithInvalidDates.length} פריטים מכילים תאריך לא תקין.`,
      );
    }

    return errors;
  }, [draft]);

  const datedCalendarItems =
    draft?.syllabus.assessments.filter(
      (assessment) => Boolean(assessment.dueDate),
    ).length ?? 0;

  const chooseFile = (selectedFile: File | null) => {
    setError(null);
    setDraft(null);
    setResult(null);

    if (!selectedFile) {
      setFile(null);
      return;
    }

    const isPdf =
      selectedFile.type === "application/pdf" ||
      selectedFile.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      setFile(null);
      setError("יש לבחור קובץ PDF בלבד.");
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setFile(null);
      setError("גודל קובץ ה־PDF חייב להיות קטן מ־10MB.");
      return;
    }

    setFile(selectedFile);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    chooseFile(event.dataTransfer.files.item(0));
  };

  const handlePreview = async () => {
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      const response = await previewSyllabus(file);

      setDraft({
        ...response,
        syllabus: {
          ...response.syllabus,
          assessments: response.syllabus.assessments.map((assessment) => ({
            ...assessment,
          })),
        },
      });
    } catch (previewError) {
      setError(errorMessage(previewError));
    } finally {
      setIsUploading(false);
    }
  };

  const handleConfirm = async () => {
    if (!draft || validationErrors.length > 0) return;

    setIsSaving(true);
    setError(null);

    try {
      const response = await confirmSyllabus(draft);

      /*
       * The confirmation creates/updates courses, assignments and exams.
       * Refresh every cached Home dashboard query immediately, including an
       * inactive Home page, so navigating back never shows stale information.
       */
      await queryClient.invalidateQueries({
        queryKey: homeDashboardQueryKey,
        refetchType: "all",
      });

      setResult(response);
    } catch (confirmError) {
      setError(errorMessage(confirmError));
    } finally {
      setIsSaving(false);
    }
  };

  const updateDraft = (
    updater: (current: SyllabusPreview) => SyllabusPreview,
  ) => {
    setDraft((current) => (current ? updater(current) : current));
  };

  const updateCourse = <Field extends keyof CourseDetails>(
    field: Field,
    value: CourseDetails[Field],
  ) => {
    updateDraft((current) => ({
      ...current,
      syllabus: {
        ...current.syllabus,
        course: { ...current.syllabus.course, [field]: value },
      },
    }));
  };

  const updateLecturer = (
    index: number,
    field: keyof Lecturer,
    value: string,
  ) => {
    updateDraft((current) => ({
      ...current,
      syllabus: {
        ...current.syllabus,
        lecturers: current.syllabus.lecturers.map((lecturer, lecturerIndex) =>
          lecturerIndex === index
            ? { ...lecturer, [field]: value.trim() ? value : null }
            : lecturer,
        ),
      },
    }));
  };

  const updateAssessment = (id: string, patch: Partial<SyllabusAssessment>) => {
    updateDraft((current) => ({
      ...current,
      syllabus: {
        ...current.syllabus,
        assessments: current.syllabus.assessments.map((assessment) =>
          assessment.id === id ? { ...assessment, ...patch } : assessment,
        ),
      },
    }));
  };

  return (
    <main className={styles.page}>
      <Box className={styles.topBar}>
        <Typography fontWeight={500}>ייבוא סילבוס</Typography>
      </Box>

      <Box className={styles.content}>
        <Paper elevation={0} className={styles.pageIntro}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            alignItems={{ xs: "stretch", sm: "center" }}
            justifyContent="space-between"
            spacing={2}
          >
            <Box display="flex" alignItems="center" gap={2}>
              <Box className={styles.introIcon}>
                <CloudUploadOutlinedIcon sx={{ color: "white", fontSize: 24 }} />
              </Box>
              <Box>
                <Typography fontWeight={600} fontSize={15}>
                  ייבוא סילבוס למערכת
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  העלו PDF, בדקו את המידע שזוהה ואשרו רק לאחר השלמת הפרטים החסרים.
                </Typography>
              </Box>
            </Box>

            {!draft && !result ? (
              <Button
                className={styles.greenButton}
                variant="contained"
                onClick={() => inputRef.current?.click()}
              >
                בחירת קובץ
              </Button>
            ) : null}
          </Stack>
        </Paper>

        <Paper elevation={0} className={styles.stepperCard}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {STEPS.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>

        {error ? (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        ) : null}

        {!draft && !result ? (
          <Stack spacing={3}>
            <Paper
              elevation={0}
              className={`${styles.uploadCard} ${
                isDragging ? styles.uploadCardDragging : ""
              }`}
              onDragOver={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              <Stack alignItems="center" spacing={2}>
                <Box className={styles.uploadIcon}>
                  <CloudUploadOutlinedIcon
                    sx={{ color: "white", fontSize: 28 }}
                  />
                </Box>

                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    גררו לכאן קובץ סילבוס
                  </Typography>
                  <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                    קובץ PDF בגודל של עד 10MB
                  </Typography>
                </Box>

                <input
                  ref={inputRef}
                  hidden
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={(event) =>
                    chooseFile(event.target.files?.[0] ?? null)
                  }
                />

                <Button
                  variant="outlined"
                  startIcon={<CloudUploadOutlinedIcon />}
                  onClick={() => inputRef.current?.click()}
                >
                  בחירת קובץ PDF
                </Button>

                {file ? (
                  <Chip
                    label={`${file.name} · ${(file.size / 1024 / 1024).toFixed(2)}MB`}
                    onDelete={() => chooseFile(null)}
                    className={activeStatusChipClass}
                  />
                ) : null}
              </Stack>
            </Paper>

            <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
              <Button
                size="large"
                variant="contained"
                className={styles.greenButton}
                disabled={!file || isUploading}
                onClick={handlePreview}
                startIcon={
                  isUploading ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : null
                }
              >
                {isUploading ? "הסילבוס נקרא..." : "ניתוח והצגת המידע"}
              </Button>
            </Box>
          </Stack>
        ) : null}

        {draft && !result ? (
          <Stack spacing={3}>
            <Paper elevation={0} className={styles.infoCard}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                spacing={2}
              >
                <Box>
                  <Typography fontWeight={600}>{draft.sourceFileName}</Typography>
                  <Typography color="text.secondary" fontSize={13}>
                    {draft.pageCount} עמודים · נותח באמצעות {" "}
                    {draft.parser === "ai" ? "בינה מלאכותית" : "מנתח בסיסי"}
                  </Typography>
                </Box>

                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                  <Chip
                    size="small"
                    label={`${draft.syllabus.assessments.length} מטלות ומבחנים`}
                    className={assessmentTypeChipClass("assignment")}
                  />
                  <Chip
                    size="small"
                    label={`${draft.syllabus.topics.length} נושאי לימוד`}
                    className={defaultStatusChipClass}
                  />
                  <Chip
                    size="small"
                    label={`${datedCalendarItems}/${draft?.syllabus.assessments.length ?? 0} פריטים עם תאריך`}
                    className={activeStatusChipClass}
                  />
                </Stack>
              </Stack>
            </Paper>

            {draft.warnings.map((warning) => (
              <Alert key={warning} severity="warning">
                {warning}
              </Alert>
            ))}

            {draft.missingFields.length > 0 ? (
              <Alert severity="info">
                <Typography fontWeight={600} sx={{ mb: 0.5 }}>
                  מומלץ לבדוק ולהשלים את הפרטים הבאים:
                </Typography>
                {draft.missingFields.join(" · ")}
              </Alert>
            ) : null}

            <SectionCard
              styles={styles}
              title="שיוך הקורס"
              subtitle="הסילבוס אינו יודע לאיזה מסלול ולסמסטר של המשתמש יש לשייך את הקורס, לכן יש לאשר את הפרטים האלה ידנית."
            >
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "2fr 1fr 1fr" },
                  gap: 2,
                }}
              >
                <FormControl fullWidth>
                  <InputLabel>מסלול לימודים</InputLabel>
                  <Select
                    label="מסלול לימודים"
                    value={draft.destination.degreeId ?? "__new__"}
                    onChange={(event) => {
                      const value = event.target.value;

                      updateDraft((current) => ({
                        ...current,
                        destination: {
                          ...current.destination,
                          degreeId: value === "__new__" ? null : value,
                          degreeTitle:
                            value === "__new__"
                              ? (current.destination.degreeTitle ??
                                current.syllabus.faculty)
                              : null,
                        },
                      }));
                    }}
                  >
                    {draft.availableDegrees.map((degree) => (
                      <MenuItem key={degree.id} value={degree.id}>
                        {degree.title}
                      </MenuItem>
                    ))}
                    <MenuItem value="__new__">מסלול אחר / מסלול חדש</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  label="שנת לימודים"
                  type="number"
                  value={draft.destination.yearNumber}
                  onChange={(event) =>
                    updateDraft((current) => ({
                      ...current,
                      destination: {
                        ...current.destination,
                        yearNumber: Number(event.target.value),
                      },
                    }))
                  }
                />

                <FormControl fullWidth>
                  <InputLabel>סמסטר</InputLabel>
                  <Select
                    label="סמסטר"
                    value={draft.destination.semesterNumber}
                    onChange={(event) =>
                      updateDraft((current) => ({
                        ...current,
                        destination: {
                          ...current.destination,
                          semesterNumber: Number(event.target.value),
                        },
                      }))
                    }
                  >
                    <MenuItem value={1}>סמסטר א׳</MenuItem>
                    <MenuItem value={2}>סמסטר ב׳</MenuItem>
                    <MenuItem value={3}>סמסטר קיץ</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {!draft.destination.degreeId ? (
                <TextField
                  fullWidth
                  required
                  label="שם המסלול החדש"
                  value={draft.destination.degreeTitle ?? ""}
                  onChange={(event) =>
                    updateDraft((current) => ({
                      ...current,
                      destination: {
                        ...current.destination,
                        degreeTitle: event.target.value,
                      },
                    }))
                  }
                  sx={{ mt: 2 }}
                  inputProps={{ dir: "auto" }}
                />
              ) : null}
            </SectionCard>

            <SectionCard styles={styles} title="פרטי הקורס">
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "2fr 2fr 1fr" },
                  gap: 2,
                }}
              >
                <TextField
                  required
                  label="שם הקורס"
                  value={draft.syllabus.course.title ?? ""}
                  onChange={(event) =>
                    updateCourse("title", event.target.value)
                  }
                  inputProps={{ dir: "auto" }}
                />

                <TextField
                  label="שם הקורס באנגלית"
                  value={draft.syllabus.course.englishTitle ?? ""}
                  onChange={(event) =>
                    updateCourse("englishTitle", event.target.value || null)
                  }
                  inputProps={{ dir: "auto" }}
                />

                <TextField
                  label="קוד קורס"
                  value={draft.syllabus.course.code ?? ""}
                  onChange={(event) =>
                    updateCourse("code", event.target.value || null)
                  }
                />

                <TextField
                  label="מוסד לימודים"
                  value={draft.syllabus.institution ?? ""}
                  onChange={(event) =>
                    updateDraft((current) => ({
                      ...current,
                      syllabus: {
                        ...current.syllabus,
                        institution: event.target.value || null,
                      },
                    }))
                  }
                  inputProps={{ dir: "auto" }}
                />

                <TextField
                  label="פקולטה / בית ספר"
                  value={draft.syllabus.faculty ?? ""}
                  onChange={(event) =>
                    updateDraft((current) => ({
                      ...current,
                      syllabus: {
                        ...current.syllabus,
                        faculty: event.target.value || null,
                      },
                    }))
                  }
                  inputProps={{ dir: "auto" }}
                />

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 2,
                  }}
                >
                  <TextField
                    label="נקודות זכות"
                    type="number"
                    value={draft.syllabus.course.credits ?? ""}
                    onChange={(event) =>
                      updateCourse("credits", nullableNumber(event.target.value))
                    }
                  />

                  <TextField
                    label="שעות שבועיות"
                    type="number"
                    value={draft.syllabus.course.weeklyHours ?? ""}
                    onChange={(event) =>
                      updateCourse(
                        "weeklyHours",
                        nullableNumber(event.target.value),
                      )
                    }
                  />
                </Box>
              </Box>

              <TextField
                fullWidth
                multiline
                minRows={4}
                label="תיאור הקורס"
                value={draft.syllabus.description ?? ""}
                onChange={(event) =>
                  updateDraft((current) => ({
                    ...current,
                    syllabus: {
                      ...current.syllabus,
                      description: event.target.value || null,
                    },
                  }))
                }
                sx={{ mt: 2 }}
                inputProps={{ dir: "auto" }}
              />
            </SectionCard>

            <SectionCard
              styles={styles}
              title="מרצים"
              subtitle="אפשר למחוק שורה שזוהתה באופן שגוי או להשלים פרטים שלא הופיעו בצורה ברורה בקובץ."
            >
              <Stack spacing={2}>
                {draft.syllabus.lecturers.map((lecturer, index) => (
                  <Paper
                    key={`${lecturer.email}-${index}`}
                    elevation={0}
                    sx={{
                      p: 2,
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 3,
                      bgcolor: "background.paper",
                    }}
                  >
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: {
                          xs: "1fr",
                          md: "2fr 2fr 1fr 2fr auto",
                        },
                        gap: 1.5,
                        alignItems: "center",
                      }}
                    >
                      <TextField
                        label="שם"
                        value={lecturer.name ?? ""}
                        onChange={(event) =>
                          updateLecturer(index, "name", event.target.value)
                        }
                        inputProps={{ dir: "auto" }}
                      />

                      <TextField
                        label="דוא״ל"
                        value={lecturer.email ?? ""}
                        onChange={(event) =>
                          updateLecturer(index, "email", event.target.value)
                        }
                      />

                      <TextField
                        label="טלפון"
                        value={lecturer.phone ?? ""}
                        onChange={(event) =>
                          updateLecturer(index, "phone", event.target.value)
                        }
                      />

                      <TextField
                        label="שעות קבלה / מיקום"
                        value={[lecturer.officeHours, lecturer.location]
                          .filter(Boolean)
                          .join(" · ")}
                        onChange={(event) =>
                          updateLecturer(
                            index,
                            "officeHours",
                            event.target.value,
                          )
                        }
                        inputProps={{ dir: "auto" }}
                      />

                      <IconButton
                        aria-label="מחיקת מרצה"
                        onClick={() =>
                          updateDraft((current) => ({
                            ...current,
                            syllabus: {
                              ...current.syllabus,
                              lecturers: current.syllabus.lecturers.filter(
                                (_, lecturerIndex) => lecturerIndex !== index,
                              ),
                            },
                          }))
                        }
                      >
                        <DeleteOutlineRoundedIcon />
                      </IconButton>
                    </Box>
                  </Paper>
                ))}

                <Box
                  className={styles.addRow}
                  onClick={() =>
                    updateDraft((current) => ({
                      ...current,
                      syllabus: {
                        ...current.syllabus,
                        lecturers: [
                          ...current.syllabus.lecturers,
                          {
                            name: null,
                            email: null,
                            phone: null,
                            officeHours: null,
                            location: null,
                          },
                        ],
                      },
                    }))
                  }
                >
                  <AddRoundedIcon fontSize="small" />
                  <Typography fontSize={13}>הוסף מרצה</Typography>
                </Box>
              </Stack>
            </SectionCard>

            <SectionCard
              styles={styles}
              title="מטלות ומבחנים"
              subtitle="חובה להזין תאריך לכל מטלה ומבחן. לא ניתן יהיה לאשר את הסילבוס כל עוד חסר תאריך באחד הפריטים."
            >
              <TableContainer component={Paper} className={styles.tablePaper}>
                <Table sx={{ minWidth: 920 }}>
                  <TableHead>
                    <TableRow className={styles.tableHeadRow}>
                      <TableCell>שם</TableCell>
                      <TableCell width={150}>סוג</TableCell>
                      <TableCell width={110}>משקל</TableCell>
                      <TableCell width={155}>תאריך</TableCell>
                      <TableCell width={100}>גודל קבוצה</TableCell>
                      <TableCell width={60} />
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {draft.syllabus.assessments.map((assessment) => (
                      <TableRow
                        key={assessment.id}
                        className={styles.tableRow}
                      >
                        <TableCell>
                          <TextField
                            fullWidth
                            required
                            size="small"
                            value={assessment.title}
                            onChange={(event) =>
                              updateAssessment(assessment.id, {
                                title: event.target.value,
                              })
                            }
                            error={!assessment.title.trim()}
                            helperText={
                              !assessment.title.trim() ? "שדה חובה" : undefined
                            }
                            inputProps={{ dir: "auto" }}
                          />
                        </TableCell>

                        <TableCell>
                          <FormControl fullWidth size="small">
                            <Select
                              value={assessment.kind}
                              onChange={(event) =>
                                updateAssessment(assessment.id, {
                                  kind: event.target.value as AssessmentKind,
                                })
                              }
                            >
                              {Object.entries(ASSESSMENT_LABELS).map(
                                ([value, label]) => (
                                  <MenuItem key={value} value={value}>
                                    <Chip
                                      size="small"
                                      label={label}
                                      className={assessmentTypeChipClass(
                                        value as AssessmentKind,
                                      )}
                                      sx={{ height: 22, fontSize: 11 }}
                                    />
                                  </MenuItem>
                                ),
                              )}
                            </Select>
                          </FormControl>
                        </TableCell>

                        <TableCell>
                          <TextField
                            size="small"
                            type="number"
                            value={assessment.weightPercent ?? ""}
                            onChange={(event) =>
                              updateAssessment(assessment.id, {
                                weightPercent: nullableNumber(
                                  event.target.value,
                                ),
                              })
                            }
                            inputProps={{ min: 0, max: 100 }}
                          />
                        </TableCell>

                        <TableCell>
                          <TextField
                            required
                            size="small"
                            type="date"
                            value={assessment.dueDate ?? ""}
                            onChange={(event) =>
                              updateAssessment(assessment.id, {
                                dueDate: event.target.value || null,
                              })
                            }
                            error={
                              !assessment.dueDate ||
                              !isValidDateOnly(assessment.dueDate)
                            }
                            helperText={
                              !assessment.dueDate
                                ? "שדה חובה"
                                : !isValidDateOnly(assessment.dueDate)
                                  ? "תאריך לא תקין"
                                  : undefined
                            }
                            inputProps={{
                              min: "2000-01-01",
                              max: "2100-12-31",
                            }}
                          />
                        </TableCell>

                        <TableCell>
                          <TextField
                            size="small"
                            type="number"
                            value={assessment.groupSize ?? ""}
                            onChange={(event) =>
                              updateAssessment(assessment.id, {
                                groupSize: nullableInteger(event.target.value),
                              })
                            }
                            inputProps={{ min: 1 }}
                          />
                        </TableCell>

                        <TableCell>
                          <IconButton
                            aria-label="מחיקת פריט"
                            onClick={() =>
                              updateDraft((current) => ({
                                ...current,
                                syllabus: {
                                  ...current.syllabus,
                                  assessments:
                                    current.syllabus.assessments.filter(
                                      (item) => item.id !== assessment.id,
                                    ),
                                },
                              }))
                            }
                          >
                            <DeleteOutlineRoundedIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Box
                className={styles.addRow}
                onClick={() =>
                  updateDraft((current) => ({
                    ...current,
                    syllabus: {
                      ...current.syllabus,
                      assessments: [
                        ...current.syllabus.assessments,
                        {
                          id: newId("assessment"),
                          title: "מטלה חדשה",
                          kind: "assignment",
                          weightPercent: null,
                          submissionMode: "unknown",
                          groupSize: null,
                          requiredPages: null,
                          dueDate: null,
                          createCalendarItem: true,
                          notes: null,
                        },
                      ],
                    },
                  }))
                }
              >
                <AddRoundedIcon fontSize="small" />
                <Typography fontSize={13}>הוסף מטלה או מבחן</Typography>
              </Box>
            </SectionCard>

            <SectionCard styles={styles} title="תוכן הקורס ומדיניות">
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                  gap: 2,
                }}
              >
                <TextField
                  multiline
                  minRows={6}
                  label="תוצרי למידה — שורה לכל תוצר"
                  value={multilineValue(draft.syllabus.learningOutcomes)}
                  onChange={(event) =>
                    updateDraft((current) => ({
                      ...current,
                      syllabus: {
                        ...current.syllabus,
                        learningOutcomes: multilineItems(event.target.value),
                      },
                    }))
                  }
                  inputProps={{ dir: "auto" }}
                />

                <TextField
                  multiline
                  minRows={6}
                  label="נושאי הקורס — שורה לכל נושא"
                  value={draft.syllabus.topics
                    .map((topic) => topic.title)
                    .join("\n")}
                  onChange={(event) =>
                    updateDraft((current) => ({
                      ...current,
                      syllabus: {
                        ...current.syllabus,
                        topics: multilineItems(event.target.value).map(
                          (title, index) => ({
                            id:
                              current.syllabus.topics[index]?.id ??
                              newId("topic"),
                            order: index + 1,
                            title,
                          }),
                        ),
                      },
                    }))
                  }
                  inputProps={{ dir: "auto" }}
                />

                <TextField
                  multiline
                  minRows={5}
                  label="דרישות קדם — שורה לכל דרישה"
                  value={multilineValue(draft.syllabus.prerequisites)}
                  onChange={(event) =>
                    updateDraft((current) => ({
                      ...current,
                      syllabus: {
                        ...current.syllabus,
                        prerequisites: multilineItems(event.target.value),
                      },
                    }))
                  }
                  inputProps={{ dir: "auto" }}
                />

                <TextField
                  multiline
                  minRows={5}
                  label="מדיניות הקורס — שורה לכל כלל"
                  value={multilineValue(draft.syllabus.policies)}
                  onChange={(event) =>
                    updateDraft((current) => ({
                      ...current,
                      syllabus: {
                        ...current.syllabus,
                        policies: multilineItems(event.target.value),
                      },
                    }))
                  }
                  inputProps={{ dir: "auto" }}
                />

                <TextField
                  multiline
                  minRows={4}
                  label="שיטת הוראה"
                  value={draft.syllabus.teachingMethod ?? ""}
                  onChange={(event) =>
                    updateDraft((current) => ({
                      ...current,
                      syllabus: {
                        ...current.syllabus,
                        teachingMethod: event.target.value || null,
                      },
                    }))
                  }
                  inputProps={{ dir: "auto" }}
                />

                <TextField
                  multiline
                  minRows={4}
                  label="מדיניות שימוש בבינה מלאכותית"
                  value={draft.syllabus.aiPolicy ?? ""}
                  onChange={(event) =>
                    updateDraft((current) => ({
                      ...current,
                      syllabus: {
                        ...current.syllabus,
                        aiPolicy: event.target.value || null,
                      },
                    }))
                  }
                  inputProps={{ dir: "auto" }}
                />
              </Box>

              <TextField
                fullWidth
                multiline
                minRows={6}
                label="ביבליוגרפיה — שורה לכל מקור"
                value={multilineValue(draft.syllabus.bibliography)}
                onChange={(event) =>
                  updateDraft((current) => ({
                    ...current,
                    syllabus: {
                      ...current.syllabus,
                      bibliography: multilineItems(event.target.value),
                    },
                  }))
                }
                sx={{ mt: 2 }}
                inputProps={{ dir: "auto" }}
              />
            </SectionCard>

            <Paper elevation={0} className={styles.stickyActions}>
              {validationErrors.length > 0 ? (
                <Alert severity="error" sx={{ mb: 2 }}>
                  <Stack spacing={0.5}>
                    {validationErrors.map((validationError) => (
                      <Typography key={validationError} fontSize={13}>
                        {validationError}
                      </Typography>
                    ))}
                  </Stack>
                </Alert>
              ) : null}

              <Stack
                direction={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                alignItems={{ sm: "center" }}
                spacing={2}
              >
                <Box>
                  <Typography fontWeight={600}>עדיין לא נשמר דבר.</Typography>
                  <Typography color="text.secondary" fontSize={13}>
                    האישור ייצור את הקורס, ישמור את הסילבוס ויוסיף את כל
                    המטלות והמבחנים לטבלאות המתאימות. תאריכים שהוזנו יישמרו.
                  </Typography>
                </Box>

                <Stack direction="row" spacing={1.5}>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setDraft(null);
                      setFile(null);
                    }}
                  >
                    התחלה מחדש
                  </Button>

                  <Button
                    variant="contained"
                    className={styles.greenButton}
                    disabled={validationErrors.length > 0 || isSaving}
                    onClick={handleConfirm}
                    startIcon={
                      isSaving ? (
                        <CircularProgress size={18} color="inherit" />
                      ) : null
                    }
                  >
                    {isSaving ? "המידע נשמר..." : "אישור והוספה"}
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          </Stack>
        ) : null}

        {result ? (
          <Paper elevation={0} className={styles.successCard}>
            <CheckCircleOutlineRoundedIcon
              color="success"
              sx={{ fontSize: 72 }}
            />

            <Typography variant="h5" fontWeight={600} sx={{ mt: 2 }}>
              הסילבוס נוסף בהצלחה
            </Typography>

            <Typography color="text.secondary" sx={{ mt: 1 }}>
              פרטי הקורס שאישרת נשמרו ב־StudyBuddy.
            </Typography>

            <Divider sx={{ my: 4 }} />

            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="center"
              spacing={2}
            >
              <Chip
                label={`${result.createdAssignments} מטלות נוספו`}
                className={doneStatusChipClass}
              />
              <Chip
                label={`${result.createdExams} מבחנים נוספו`}
                className={activeStatusChipClass}
              />
              {result.skippedCalendarItems > 0 ? (
                <Chip
                  label="כל המטלות והמבחנים נשמרו עם תאריך"
                  className={defaultStatusChipClass}
                />
              ) : null}
            </Stack>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="center"
              spacing={2}
              sx={{ mt: 4 }}
            >
              <Button variant="outlined" onClick={() => navigate("/home")}>
                חזרה לדף הבית
              </Button>

              <Button
                variant="contained"
                className={styles.greenButton}
                onClick={() => {
                  setFile(null);
                  setDraft(null);
                  setResult(null);
                }}
              >
                ייבוא סילבוס נוסף
              </Button>
            </Stack>
          </Paper>
        ) : null}
      </Box>
    </main>
  );
};