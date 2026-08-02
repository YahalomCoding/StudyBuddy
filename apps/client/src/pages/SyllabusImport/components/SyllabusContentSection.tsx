import {
  Box,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import type { SyllabusPreview } from "../../../api/syllabi";
import { useStyles } from "../style";

type UpdateDraft = (
  updater: (current: SyllabusPreview) => SyllabusPreview,
) => void;

type SyllabusContentSectionProps = {
  draft: SyllabusPreview;
  updateDraft: UpdateDraft;
};

const multilineValue = (items: string[]): string =>
  items.join("\n");

const multilineItems = (value: string): string[] =>
  value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

const newId = (prefix: string): string =>
  `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;

export const SyllabusContentSection = ({
  draft,
  updateDraft,
}: SyllabusContentSectionProps) => {
  const styles = useStyles();

  return (
    <Paper elevation={0} className={styles.card}>
      <Box className={styles.sectionHeader}>
        <Typography className={styles.sectionTitle}>
          תוכן הקורס ומדיניות
        </Typography>
      </Box>

      <Box className={styles.cardContent}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "1fr 1fr",
            },
            gap: 2,
          }}
        >
          <TextField
            multiline
            minRows={6}
            label="תוצרי למידה — שורה לכל תוצר"
            value={multilineValue(
              draft.syllabus.learningOutcomes,
            )}
            onChange={(event) =>
              updateDraft((current) => ({
                ...current,
                syllabus: {
                  ...current.syllabus,
                  learningOutcomes: multilineItems(
                    event.target.value,
                  ),
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
                  topics: multilineItems(
                    event.target.value,
                  ).map((title, index) => ({
                    id:
                      current.syllabus.topics[index]?.id ??
                      newId("topic"),
                    order: index + 1,
                    title,
                  })),
                },
              }))
            }
            inputProps={{ dir: "auto" }}
          />

          <TextField
            multiline
            minRows={5}
            label="דרישות קדם — שורה לכל דרישה"
            value={multilineValue(
              draft.syllabus.prerequisites,
            )}
            onChange={(event) =>
              updateDraft((current) => ({
                ...current,
                syllabus: {
                  ...current.syllabus,
                  prerequisites: multilineItems(
                    event.target.value,
                  ),
                },
              }))
            }
            inputProps={{ dir: "auto" }}
          />

          <TextField
            multiline
            minRows={5}
            label="מדיניות הקורס — שורה לכל כלל"
            value={multilineValue(
              draft.syllabus.policies,
            )}
            onChange={(event) =>
              updateDraft((current) => ({
                ...current,
                syllabus: {
                  ...current.syllabus,
                  policies: multilineItems(
                    event.target.value,
                  ),
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
                  teachingMethod:
                    event.target.value || null,
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
          value={multilineValue(
            draft.syllabus.bibliography,
          )}
          onChange={(event) =>
            updateDraft((current) => ({
              ...current,
              syllabus: {
                ...current.syllabus,
                bibliography: multilineItems(
                  event.target.value,
                ),
              },
            }))
          }
          sx={{ mt: 2 }}
          inputProps={{ dir: "auto" }}
        />
      </Box>
    </Paper>
  );
};
