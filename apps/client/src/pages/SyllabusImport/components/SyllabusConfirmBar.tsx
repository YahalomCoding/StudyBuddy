import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

type Props = {
  validationErrors: string[];
  isSaving: boolean;
  styles: Record<string, string>;
  onReset: () => void;
  onConfirm: () => void;
};

export const SyllabusConfirmBar = ({
  validationErrors,
  isSaving,
  styles,
  onReset,
  onConfirm,
}: Props) => (
  <Paper elevation={0} className={styles.stickyActions}>
    {validationErrors.length > 0 ? (
      <Alert severity="error" sx={{ mb: 2 }}>
        <Stack spacing={0.5}>
          {validationErrors.map((err) => (
            <Typography key={err} fontSize={13}>
              {err}
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
          האישור ייצור את הקורס וישמור את כל המטלות והמבחנים.
        </Typography>
      </Box>

      <Stack direction="row" spacing={1.5}>
        <Button variant="outlined" onClick={onReset}>
          התחלה מחדש
        </Button>
        <Button
          variant="contained"
          className={styles.greenButton}
          disabled={validationErrors.length > 0 || isSaving}
          onClick={onConfirm}
          startIcon={
            isSaving ? <CircularProgress size={18} color="inherit" /> : null
          }
        >
          {isSaving ? "המידע נשמר..." : "אישור והוספה"}
        </Button>
      </Stack>
    </Stack>
  </Paper>
);
