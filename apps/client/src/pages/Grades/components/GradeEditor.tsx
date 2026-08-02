import { Box, Button, TextField } from "@mui/material";
import { useStyles } from "../style";

type GradeEditorProps = {
  value: string;
  isSaving: boolean;
  onChange: (value: string) => void;
  onSave: () => void;
};

export const GradeEditor = ({
  value,
  isSaving,
  onChange,
  onSave,
}: GradeEditorProps) => {
  const classes = useStyles();

  return (
    <Box className={classes.inlineEditor}>
      <TextField
        autoFocus
        value={value}
        onChange={(event) => onChange(event.target.value)}
        size="small"
        type="number"
        inputProps={{ min: 0, max: 100, step: 0.1 }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            onSave();
          }
        }}
      />
      <Button
        size="small"
        variant="contained"
        className={classes.saveButton}
        onClick={onSave}
        disabled={isSaving}
      >
        {isSaving ? "…" : "שמור"}
      </Button>
    </Box>
  );
};
