import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
  useMemo,
  useRef,
  useState,
  type DragEvent,
} from "react";
import { useNavigate } from "react-router-dom";
import { homeDashboardQueryKey } from "../../api/home";
import {
  confirmSyllabus,
  previewSyllabus,
  type ConfirmSyllabusResponse,
  type SyllabusPreview,
} from "../../api/syllabi";
import { SyllabusAssessmentsSection } from "./components/SyllabusAssessmentsSection";
import { SyllabusContentSection } from "./components/SyllabusContentSection";
import { SyllabusCourseSection } from "./components/SyllabusCourseSection";
import { SyllabusUploadSection } from "./components/SyllabusUploadSection";
import {
  activeStatusChipClass,
  assessmentTypeChipClass,
  defaultStatusChipClass,
  doneStatusChipClass,
  useStyles,
} from "./style";

const STEPS = [
  "העלאת קובץ",
  "בדיקה ועריכה",
  "נוסף ל־StudyBuddy",
];

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

const getErrorMessage = (error: unknown): string => {
  if (
    axios.isAxiosError<{
      message?: string | string[];
    }>(error)
  ) {
    const responseMessage = error.response?.data?.message;

    if (Array.isArray(responseMessage)) {
      return responseMessage.join(", ");
    }

    if (typeof responseMessage === "string") {
      return responseMessage;
    }
  }

  return error instanceof Error
    ? error.message
    : "אירעה שגיאה לא צפויה";
};

export const SyllabusImport = () => {
  const styles = useStyles();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [draft, setDraft] =
    useState<SyllabusPreview | null>(null);
  const [result, setResult] =
    useState<ConfirmSyllabusResponse | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const activeStep = result ? 2 : draft ? 1 : 0;

  const updateDraft = (
    updater: (current: SyllabusPreview) => SyllabusPreview,
  ) => {
    setDraft((current) =>
      current ? updater(current) : current,
    );
  };

  const validationErrors = useMemo(() => {
    if (!draft) return [];

    const errors: string[] = [];

    if (!draft.syllabus.course.title?.trim()) {
      errors.push("חובה למלא את שם הקורס.");
    }

    if (
      !draft.destination.degreeId &&
      !draft.destination.degreeTitle?.trim()
    ) {
      errors.push(
        "יש לבחור מסלול לימודים או להזין שם למסלול חדש.",
      );
    }

    if (
      !Number.isInteger(draft.destination.yearNumber) ||
      draft.destination.yearNumber < 2000
    ) {
      errors.push("יש להזין שנת לימודים תקינה.");
    }

    if (
      !Number.isInteger(
        draft.destination.semesterNumber,
      ) ||
      draft.destination.semesterNumber < 1 ||
      draft.destination.semesterNumber > 3
    ) {
      errors.push("הסמסטר חייב להיות 1, 2 או 3.");
    }

    const assessmentsWithoutTitles =
      draft.syllabus.assessments.filter(
        (assessment) => !assessment.title.trim(),
      );

    if (assessmentsWithoutTitles.length > 0) {
      errors.push(
        `${assessmentsWithoutTitles.length} מטלות או מבחנים חסרים שם.`,
      );
    }

    const assessmentsWithoutDates =
      draft.syllabus.assessments.filter(
        (assessment) => !assessment.dueDate?.trim(),
      );

    if (assessmentsWithoutDates.length > 0) {
      errors.push(
        `${assessmentsWithoutDates.length} מטלות או מבחנים חסרים תאריך.`,
      );
    }

    const assessmentsWithInvalidDates =
      draft.syllabus.assessments.filter(
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

  const datedItems =
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
      setError(
        "גודל קובץ ה־PDF חייב להיות קטן מ־10MB.",
      );
      return;
    }

    setFile(selectedFile);
  };

  const handleDrop = (
    event: DragEvent<HTMLDivElement>,
  ) => {
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
      setDraft(response);
    } catch (previewError) {
      setError(getErrorMessage(previewError));
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

      await queryClient.invalidateQueries({
        queryKey: homeDashboardQueryKey,
        refetchType: "all",
      });

      setResult(response);
    } catch (confirmError) {
      setError(getErrorMessage(confirmError));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className={styles.page}>
      <Box className={styles.topBar}>
        <Typography fontWeight={500}>
          ייבוא סילבוס
        </Typography>
      </Box>

      <Box className={styles.content}>
        <Paper elevation={0} className={styles.pageIntro}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            alignItems={{
              xs: "stretch",
              sm: "center",
            }}
            justifyContent="space-between"
            spacing={2}
          >
            <Box display="flex" alignItems="center" gap={2}>
              <Box className={styles.introIcon}>
                <CloudUploadOutlinedIcon
                  sx={{
                    color: "white",
                    fontSize: 24,
                  }}
                />
              </Box>

              <Box>
                <Typography fontWeight={600} fontSize={15}>
                  ייבוא סילבוס למערכת
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  העלו PDF, בדקו את המידע שזוהה ואשרו לאחר
                  השלמת הפרטים החסרים.
                </Typography>
              </Box>
            </Box>

            {!draft && !result ? (
              <Button
                className={styles.greenButton}
                variant="contained"
                onClick={() =>
                  inputRef.current?.click()
                }
              >
                בחירת קובץ
              </Button>
            ) : null}
          </Stack>
        </Paper>

        <Paper
          elevation={0}
          className={styles.stepperCard}
        >
          <Stepper
            activeStep={activeStep}
            alternativeLabel
          >
            {STEPS.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>

        {error ? (
          <Alert
            severity="error"
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        ) : null}

        {!draft && !result ? (
          <SyllabusUploadSection
            file={file}
            inputRef={inputRef}
            isUploading={isUploading}
            isDragging={isDragging}
            setIsDragging={setIsDragging}
            chooseFile={chooseFile}
            handleDrop={handleDrop}
            handlePreview={handlePreview}
          />
        ) : null}

        {draft && !result ? (
          <Stack spacing={3}>
            <Paper
              elevation={0}
              className={styles.infoCard}
            >
              <Stack
                direction={{
                  xs: "column",
                  sm: "row",
                }}
                justifyContent="space-between"
                spacing={2}
              >
                <Box>
                  <Typography fontWeight={600}>
                    {draft.sourceFileName}
                  </Typography>
                  <Typography
                    color="text.secondary"
                    fontSize={13}
                  >
                    {draft.pageCount} עמודים · נותח באמצעות{" "}
                    {draft.parser === "ai"
                      ? "בינה מלאכותית"
                      : "מנתח בסיסי"}
                  </Typography>
                </Box>

                <Stack
                  direction="row"
                  spacing={1}
                  useFlexGap
                  flexWrap="wrap"
                >
                  <Chip
                    size="small"
                    label={`${draft.syllabus.assessments.length} מטלות ומבחנים`}
                    className={assessmentTypeChipClass(
                      "assignment",
                    )}
                  />
                  <Chip
                    size="small"
                    label={`${draft.syllabus.topics.length} נושאי לימוד`}
                    className={defaultStatusChipClass}
                  />
                  <Chip
                    size="small"
                    label={`${datedItems}/${draft.syllabus.assessments.length} פריטים עם תאריך`}
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
                <Typography
                  fontWeight={600}
                  sx={{ mb: 0.5 }}
                >
                  מומלץ לבדוק ולהשלים:
                </Typography>
                {draft.missingFields.join(" · ")}
              </Alert>
            ) : null}

            <SyllabusCourseSection
              draft={draft}
              updateDraft={updateDraft}
            />

            <SyllabusAssessmentsSection
              draft={draft}
              updateDraft={updateDraft}
            />

            <SyllabusContentSection
              draft={draft}
              updateDraft={updateDraft}
            />

            <Paper
              elevation={0}
              className={styles.stickyActions}
            >
              {validationErrors.length > 0 ? (
                <Alert severity="error" sx={{ mb: 2 }}>
                  <Stack spacing={0.5}>
                    {validationErrors.map(
                      (validationError) => (
                        <Typography
                          key={validationError}
                          fontSize={13}
                        >
                          {validationError}
                        </Typography>
                      ),
                    )}
                  </Stack>
                </Alert>
              ) : null}

              <Stack
                direction={{
                  xs: "column",
                  sm: "row",
                }}
                justifyContent="space-between"
                alignItems={{ sm: "center" }}
                spacing={2}
              >
                <Box>
                  <Typography fontWeight={600}>
                    עדיין לא נשמר דבר.
                  </Typography>
                  <Typography
                    color="text.secondary"
                    fontSize={13}
                  >
                    האישור ייצור את הקורס וישמור את כל
                    המטלות והמבחנים.
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
                    disabled={
                      validationErrors.length > 0 ||
                      isSaving
                    }
                    onClick={handleConfirm}
                    startIcon={
                      isSaving ? (
                        <CircularProgress
                          size={18}
                          color="inherit"
                        />
                      ) : null
                    }
                  >
                    {isSaving
                      ? "המידע נשמר..."
                      : "אישור והוספה"}
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          </Stack>
        ) : null}

        {result ? (
          <Paper
            elevation={0}
            className={styles.successCard}
          >
            <CheckCircleOutlineRoundedIcon
              color="success"
              sx={{ fontSize: 72 }}
            />

            <Typography
              variant="h5"
              fontWeight={600}
              sx={{ mt: 2 }}
            >
              הסילבוס נוסף בהצלחה
            </Typography>

            <Typography
              color="text.secondary"
              sx={{ mt: 1 }}
            >
              פרטי הקורס שאישרת נשמרו ב־StudyBuddy.
            </Typography>

            <Divider sx={{ my: 4 }} />

            <Stack
              direction={{
                xs: "column",
                sm: "row",
              }}
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
            </Stack>

            <Stack
              direction={{
                xs: "column",
                sm: "row",
              }}
              justifyContent="center"
              spacing={2}
              sx={{ mt: 4 }}
            >
              <Button
                variant="outlined"
                onClick={() => navigate("/home")}
              >
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
