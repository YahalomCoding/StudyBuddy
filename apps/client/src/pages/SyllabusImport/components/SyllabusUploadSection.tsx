import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import type {
  Dispatch,
  DragEvent,
  RefObject,
  SetStateAction,
} from "react";
import { activeStatusChipClass, useStyles } from "../style";

type SyllabusUploadSectionProps = {
  file: File | null;
  inputRef: RefObject<HTMLInputElement | null>;
  isUploading: boolean;
  isDragging: boolean;
  setIsDragging: Dispatch<SetStateAction<boolean>>;
  chooseFile: (file: File | null) => void;
  handleDrop: (event: DragEvent<HTMLDivElement>) => void;
  handlePreview: () => void;
};

export const SyllabusUploadSection = ({
  file,
  inputRef,
  isUploading,
  isDragging,
  setIsDragging,
  chooseFile,
  handleDrop,
  handlePreview,
}: SyllabusUploadSectionProps) => {
  const styles = useStyles();

  return (
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
            sx={{
              direction: "rtl",
              gap: 1,
              "& .MuiButton-startIcon": {
                margin: 0,
              },
            }}
          >
            בחירת קובץ PDF
          </Button>

          {file ? (
            <Chip
              label={`${file.name} · ${(
                file.size /
                1024 /
                1024
              ).toFixed(2)}MB`}
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
          {isUploading
            ? "הסילבוס נקרא..."
            : "ניתוח והצגת המידע"}
        </Button>
      </Box>
    </Stack>
  );
};
