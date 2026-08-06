import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import {
  Box,
  Chip,
  FormControl,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import type {
  AssessmentKind,
  SyllabusAssessment,
  SyllabusPreview,
} from "../../../api/syllabi";
import {
  assessmentTypeChipClass,
  useStyles,
} from "../style";

type UpdateDraft = (
  updater: (current: SyllabusPreview) => SyllabusPreview,
) => void;

type SyllabusAssessmentsSectionProps = {
  draft: SyllabusPreview;
  updateDraft: UpdateDraft;
};

const ASSESSMENT_LABELS: Record<AssessmentKind, string> = {
  assignment: "מטלה",
  exam: "מבחן",
  project: "פרויקט",
  presentation: "מצגת",
  participation: "השתתפות",
  lab: "מעבדה",
  other: "אחר",
};

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

const newId = (prefix: string): string =>
  `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;

export const SyllabusAssessmentsSection = ({
  draft,
  updateDraft,
}: SyllabusAssessmentsSectionProps) => {
  const styles = useStyles();

  const updateAssessment = (
    id: string,
    patch: Partial<SyllabusAssessment>,
  ) => {
    updateDraft((current) => ({
      ...current,
      syllabus: {
        ...current.syllabus,
        assessments: current.syllabus.assessments.map(
          (assessment) =>
            assessment.id === id
              ? { ...assessment, ...patch }
              : assessment,
        ),
      },
    }));
  };

  return (
    <Paper elevation={0} className={styles.card}>
      <Box className={styles.sectionHeader}>
        <Typography className={styles.sectionTitle}>
          מטלות ומבחנים
        </Typography>
        <Typography className={styles.sectionSubtitle}>
          חובה להזין תאריך לכל מטלה ומבחן. לא ניתן לאשר את
          הסילבוס כל עוד חסר תאריך.
        </Typography>
      </Box>

      <Box className={styles.cardContent}>
        <TableContainer
          component={Paper}
          className={styles.tablePaper}
        >
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
              {draft.syllabus.assessments.map(
                (assessment) => (
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
                          !assessment.title.trim()
                            ? "שדה חובה"
                            : undefined
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
                              kind: event.target
                                .value as AssessmentKind,
                            })
                          }
                        >
                          {Object.entries(
                            ASSESSMENT_LABELS,
                          ).map(([value, label]) => (
                            <MenuItem
                              key={value}
                              value={value}
                            >
                              <Chip
                                size="small"
                                label={label}
                                className={assessmentTypeChipClass(
                                  value as AssessmentKind,
                                )}
                                sx={{
                                  height: 22,
                                  fontSize: 11,
                                }}
                              />
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </TableCell>

                    <TableCell>
                      <TextField
                        size="small"
                        type="number"
                        value={
                          assessment.weightPercent ?? ""
                        }
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
                            dueDate:
                              event.target.value || null,
                          })
                        }
                        error={
                          !assessment.dueDate ||
                          !isValidDateOnly(
                            assessment.dueDate,
                          )
                        }
                        helperText={
                          !assessment.dueDate
                            ? "שדה חובה"
                            : !isValidDateOnly(
                                  assessment.dueDate,
                                )
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
                            groupSize: nullableInteger(
                              event.target.value,
                            ),
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
                                  (item) =>
                                    item.id !== assessment.id,
                                ),
                            },
                          }))
                        }
                      >
                        <DeleteOutlineRoundedIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ),
              )}
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
          <Typography fontSize={13}>
            הוסף מטלה או מבחן
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};
