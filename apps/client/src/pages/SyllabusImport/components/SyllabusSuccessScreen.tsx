import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import { Button, Chip, Divider, Paper, Stack, Typography } from "@mui/material";
import type { ConfirmSyllabusResponse } from "../../../api/syllabi";

type Props = {
  result: ConfirmSyllabusResponse;
  activeStatusChipClass: string;
  doneStatusChipClass: string;
  styles: Record<string, string>;
  onGoHome: () => void;
  onImportAnother: () => void;
};

export const SyllabusSuccessScreen = ({
  result,
  activeStatusChipClass,
  doneStatusChipClass,
  styles,
  onGoHome,
  onImportAnother,
}: Props) => (
  <Paper elevation={0} className={styles.successCard}>
    <CheckCircleOutlineRoundedIcon color="success" sx={{ fontSize: 72 }} />

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
    </Stack>

    <Stack
      direction={{ xs: "column", sm: "row" }}
      justifyContent="center"
      spacing={2}
      sx={{ mt: 4 }}
    >
      <Button variant="outlined" onClick={onGoHome}>
        חזרה לדף הבית
      </Button>
      <Button
        variant="contained"
        className={styles.greenButton}
        onClick={onImportAnother}
      >
        ייבוא סילבוס נוסף
      </Button>
    </Stack>
  </Paper>
);
