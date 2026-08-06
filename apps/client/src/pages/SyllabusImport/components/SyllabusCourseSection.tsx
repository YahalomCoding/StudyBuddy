import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import {
  Box,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import type { ReactNode } from "react";
import type {
  Lecturer,
  SyllabusPreview,
} from "../../../api/syllabi";
import { useStyles } from "../style";

type UpdateDraft = (
  updater: (current: SyllabusPreview) => SyllabusPreview,
) => void;

type SyllabusCourseSectionProps = {
  draft: SyllabusPreview;
  updateDraft: UpdateDraft;
};

const nullableNumber = (value: string): number | null => {
  if (value.trim() === "") return null;

  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const SectionCard = ({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) => {
  const styles = useStyles();

  return (
    <Paper elevation={0} className={styles.card}>
      <Box className={styles.sectionHeader}>
        <Typography className={styles.sectionTitle}>
          {title}
        </Typography>
        {subtitle ? (
          <Typography className={styles.sectionSubtitle}>
            {subtitle}
          </Typography>
        ) : null}
      </Box>
      <Box className={styles.cardContent}>{children}</Box>
    </Paper>
  );
};

export const SyllabusCourseSection = ({
  draft,
  updateDraft,
}: SyllabusCourseSectionProps) => {
  const styles = useStyles();

  const updateCourse = <
    Field extends keyof SyllabusPreview["syllabus"]["course"],
  >(
    field: Field,
    value: SyllabusPreview["syllabus"]["course"][Field],
  ) => {
    updateDraft((current) => ({
      ...current,
      syllabus: {
        ...current.syllabus,
        course: {
          ...current.syllabus.course,
          [field]: value,
        },
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
        lecturers: current.syllabus.lecturers.map(
          (lecturer, lecturerIndex) =>
            lecturerIndex === index
              ? {
                  ...lecturer,
                  [field]: value.trim() ? value : null,
                }
              : lecturer,
        ),
      },
    }));
  };

  return (
    <>
      <SectionCard
        title="שיוך הקורס"
        subtitle="יש לאשר לאיזה מסלול, שנת לימודים וסמסטר לשייך את הקורס."
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "2fr 1fr 1fr",
            },
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
                    degreeId:
                      value === "__new__" ? null : value,
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
              <MenuItem value="__new__">
                מסלול אחר / מסלול חדש
              </MenuItem>
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

      <SectionCard title="פרטי הקורס">
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "2fr 2fr 1fr",
            },
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
              updateCourse(
                "englishTitle",
                event.target.value || null,
              )
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
                updateCourse(
                  "credits",
                  nullableNumber(event.target.value),
                )
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
        title="מרצים"
        subtitle="אפשר למחוק שורה שזוהתה באופן שגוי או להשלים פרטים חסרים."
      >
        <Stack spacing={2}>
          {draft.syllabus.lecturers.map(
            (lecturer, index) => (
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
                      updateLecturer(
                        index,
                        "name",
                        event.target.value,
                      )
                    }
                    inputProps={{ dir: "auto" }}
                  />

                  <TextField
                    label="דוא״ל"
                    value={lecturer.email ?? ""}
                    onChange={(event) =>
                      updateLecturer(
                        index,
                        "email",
                        event.target.value,
                      )
                    }
                  />

                  <TextField
                    label="טלפון"
                    value={lecturer.phone ?? ""}
                    onChange={(event) =>
                      updateLecturer(
                        index,
                        "phone",
                        event.target.value,
                      )
                    }
                  />

                  <TextField
                    label="שעות קבלה / מיקום"
                    value={[
                      lecturer.officeHours,
                      lecturer.location,
                    ]
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
                          lecturers:
                            current.syllabus.lecturers.filter(
                              (_, lecturerIndex) =>
                                lecturerIndex !== index,
                            ),
                        },
                      }))
                    }
                  >
                    <DeleteOutlineRoundedIcon />
                  </IconButton>
                </Box>
              </Paper>
            ),
          )}

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
    </>
  );
};
