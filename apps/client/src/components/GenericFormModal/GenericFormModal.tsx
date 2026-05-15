import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Select,
  TextField,
  Typography,
  Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useState } from "react";
import type { ReactNode } from "react";

// ─── Field definitions ────────────────────────────────────────────────────────

export type FieldOption = { label: string; value: string };

export type FormField =
  | { type: "text"; name: string; label: string; placeholder?: string }
  | { type: "date"; name: string; label: string }
  | { type: "select"; name: string; label: string; options: FieldOption[] };

export type FormValues = Record<string, string>;

// ─── Props ────────────────────────────────────────────────────────────────────

interface GenericFormModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  fields: FormField[];
  values: FormValues;
  onChange: (name: string, value: string) => void;
  onSave: (values: FormValues) => void;
  saveLabel?: string;
  cancelLabel?: string;
  extraActions?: ReactNode;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const GenericFormModal = ({
  open,
  onClose,
  title,
  fields,
  values,
  onChange,
  onSave,
  saveLabel = "Save",
  cancelLabel = "Cancel",
  extraActions,
}: GenericFormModalProps) => {
  const [triedToSave, setTriedToSave] = useState(false);

  const isFieldEmpty = (fieldName: string) => {
    return !values[fieldName] || values[fieldName].trim() === "";
  };

  const isFormValid = fields.every((field) => !isFieldEmpty(field.name));

  const handleSave = () => {
    setTriedToSave(true);

    if (!isFormValid) return;

    onSave(values);
  };

  const handleClose = () => {
    setTriedToSave(false);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: {
          borderRadius: 3,
          minWidth: 360,
          maxWidth: 460,
          width: "100%",
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pb: 1,
          pt: 2.5,
          px: 3,
        }}
      >
        <Typography fontWeight={600} fontSize={16}>
          {title}
        </Typography>

        <IconButton
          size="small"
          onClick={handleClose}
          sx={{ color: "text.secondary" }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 3, pb: 3, pt: 0 }}>
        {/* Fields */}
        <Box display="flex" flexDirection="column" gap={2} mt={1}>
          {fields.map((field) => {
            const hasError = triedToSave && isFieldEmpty(field.name);

            return (
              <Box key={field.name}>
                <Typography
                  fontSize={13}
                  fontWeight={500}
                  color="text.secondary"
                  mb={0.5}
                >
                  {field.label}
                </Typography>

                {field.type === "text" && (
                  <TextField
                    fullWidth
                    size="small"
                    placeholder={field.placeholder}
                    value={values[field.name] ?? ""}
                    onChange={(e) => onChange(field.name, e.target.value)}
                    error={hasError}
                    helperText={hasError ? "This field is required" : ""}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 1.5,
                      },
                    }}
                  />
                )}

                {field.type === "date" && (
                  <TextField
                    fullWidth
                    size="small"
                    type="date"
                    value={values[field.name] ?? ""}
                    onChange={(e) => onChange(field.name, e.target.value)}
                    error={hasError}
                    helperText={hasError ? "This field is required" : ""}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 1.5,
                      },
                    }}
                  />
                )}

                {field.type === "select" && (
                  <>
                    <Select
                      fullWidth
                      size="small"
                      value={values[field.name] ?? ""}
                      onChange={(e) => onChange(field.name, e.target.value)}
                      displayEmpty
                      error={hasError}
                      sx={{
                        borderRadius: 1.5,
                      }}
                    >
                      {field.options.map((opt) => (
                        <MenuItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </MenuItem>
                      ))}
                    </Select>

                    {hasError && (
                      <Typography fontSize={12} color="error" mt={0.5}>
                        This field is required
                      </Typography>
                    )}
                  </>
                )}
              </Box>
            );
          })}
        </Box>

        {/* Actions */}
        <Box
          display="flex"
          justifyContent="flex-end"
          alignItems="center"
          gap={1}
          mt={3}
        >
          {extraActions}

          <Button
            variant="text"
            onClick={handleClose}
            sx={{
              color: "text.secondary",
              textTransform: "none",
              fontWeight: 500,
            }}
          >
            {cancelLabel}
          </Button>

          <Button
            variant="contained"
            onClick={handleSave}
            sx={{
              bgcolor: "#22c55e",
              color: "white",
              textTransform: "none",
              fontWeight: 600,
              borderRadius: 2,
              px: 3,
              boxShadow: "none",
              "&:hover": {
                bgcolor: "#16a34a",
                boxShadow: "none",
              },
            }}
          >
            {saveLabel}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};