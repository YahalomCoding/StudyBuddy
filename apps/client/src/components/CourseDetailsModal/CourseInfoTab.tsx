import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import {
  Box,
  Button,
  Chip,
  Divider,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { formatSemesterLabel } from "@studybuddy/utils";
import type { UseMutationResult } from "@tanstack/react-query";
import type { CourseDetailsResponse } from "../../api/courses";
import { ContentSection, InfoField, valueOrDash } from "./courseDetailsUtils";

type EditValues = { title: string; credits: string; semesterNumber: string };

type Props = {
  data: CourseDetailsResponse;
  isEditing: boolean;
  setIsEditing: (v: boolean) => void;
  editValues: EditValues;
  setEditValues: React.Dispatch<React.SetStateAction<EditValues>>;
  updateMutation: UseMutationResult<
    unknown,
    unknown,
    { title?: string; credits?: number; semesterNumber?: number }
  >;
  handleSaveEdit: () => void;
};

export const CourseInfoTab = ({
  data,
  isEditing,
  setIsEditing,
  editValues,
  setEditValues,
  updateMutation,
  handleSaveEdit,
}: Props) => (
  <Stack spacing={2}>
    <ContentSection
      title="מידע כללי"
      icon={<InfoOutlinedIcon sx={{ fontSize: 19, color: "#22c55e" }} />}
    >
      {isEditing ? (
        <Box display="flex" flexDirection="column" gap={2}>
          <Box>
            <Typography fontSize={12} color="text.secondary" mb={0.5}>
              שם הקורס
            </Typography>
            <TextField
              fullWidth
              size="small"
              value={editValues.title}
              onChange={(e) =>
                setEditValues((v) => ({ ...v, title: e.target.value }))
              }
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
            />
          </Box>

          <Box display="flex" gap={2}>
            <Box flex={1}>
              <Typography fontSize={12} color="text.secondary" mb={0.5}>
                נקודות זכות
              </Typography>
              <TextField
                fullWidth
                size="small"
                type="number"
                inputProps={{ min: 0, step: 0.5 }}
                value={editValues.credits}
                onChange={(e) =>
                  setEditValues((v) => ({ ...v, credits: e.target.value }))
                }
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
              />
            </Box>
            <Box flex={1}>
              <Typography fontSize={12} color="text.secondary" mb={0.5}>
                סמסטר
              </Typography>
              <Select
                fullWidth
                size="small"
                value={editValues.semesterNumber}
                onChange={(e) =>
                  setEditValues((v) => ({
                    ...v,
                    semesterNumber: String(e.target.value),
                  }))
                }
                sx={{ borderRadius: 1.5 }}
              >
                <MenuItem value="1">א</MenuItem>
                <MenuItem value="2">ב</MenuItem>
                <MenuItem value="3">קיץ</MenuItem>
              </Select>
            </Box>
          </Box>

          <Box display="flex" gap={1} justifyContent="flex-end">
            <Button size="small" onClick={() => setIsEditing(false)}>
              ביטול
            </Button>
            <Button
              size="small"
              variant="contained"
              onClick={handleSaveEdit}
              disabled={updateMutation.isPending}
              sx={{ bgcolor: "#22c55e", "&:hover": { bgcolor: "#16a34a" } }}
            >
              שמור
            </Button>
          </Box>
        </Box>
      ) : (
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
          <InfoField label="קוד קורס" value={valueOrDash(data.code)} />
          <InfoField
            label="נקודות זכות"
            value={data.credits === null ? "לא צוין" : `${data.credits} נ״ז`}
          />
          <InfoField
            label="שעות שבועיות"
            value={
              data.weeklyHours === null ? "לא צוין" : `${data.weeklyHours} ש״ס`
            }
          />
          <InfoField
            label="שנה וסמסטר"
            value={`${data.academicYearLabel} · סמסטר ${formatSemesterLabel(data.semesterNumber) ?? data.semesterLabel}`}
          />
        </Box>
      )}

      <Divider sx={{ my: 2 }} />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: 2,
        }}
      >
        <InfoField label="מוסד" value={valueOrDash(data.institution)} />
        <InfoField
          label="פקולטה / מסלול"
          value={data.faculty || data.degreeTitle || "לא צוין"}
        />
      </Box>
    </ContentSection>

    <ContentSection
      title="מרצים"
      icon={
        <PersonOutlineRoundedIcon sx={{ fontSize: 19, color: "#22c55e" }} />
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
                pb: index === data.lecturers.length - 1 ? 0 : 1.25,
                borderBottom:
                  index === data.lecturers.length - 1 ? "none" : "1px solid",
                borderColor: "divider",
              }}
            >
              <Box>
                <Typography fontWeight={500} fontSize={14}>
                  {lecturer.name || "שם המרצה לא צוין"}
                </Typography>
                {lecturer.email ? (
                  <Box display="flex" alignItems="center" gap={0.6} mt={0.5}>
                    <EmailOutlinedIcon
                      sx={{ fontSize: 16, color: "text.secondary" }}
                    />
                    <Typography color="text.secondary" fontSize={13}>
                      {lecturer.email}
                    </Typography>
                  </Box>
                ) : null}
              </Box>
              <Stack direction="row" spacing={0.75} flexWrap="wrap">
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
      <Typography fontSize={14} lineHeight={1.8} color="text.secondary">
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
);
