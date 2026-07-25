import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface AiMarkdownModalProps {
  open: boolean;
  title: string;
  content: string;
  reasoning: string;
  isStreaming: boolean;
  errorMessage: string | null;
  canRegenerate?: boolean;
  onRegenerate?: () => void;
  onClose: () => void;
}

export const AiMarkdownModal = ({
  open,
  title,
  content = "",
  reasoning = "",
  isStreaming,
  errorMessage,
  canRegenerate = false,
  onRegenerate,
  onClose,
}: AiMarkdownModalProps) => {
  const [isReasoningExpanded, setIsReasoningExpanded] = useState(false);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            height: 700,
            maxHeight: "90vh",
            overflow: "hidden",
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Typography fontWeight={700} fontSize={18}>
            {title}
          </Typography>
          {isStreaming ? <CircularProgress size={16} /> : null}
          {canRegenerate && onRegenerate ? (
            <Typography
              component="button"
              type="button"
              onClick={onRegenerate}
              sx={{
                border: "none",
                bgcolor: "transparent",
                color: "primary.main",
                fontWeight: 700,
                fontSize: 13,
                cursor: "pointer",
                p: 0,
              }}
            >
              Regenerate
            </Typography>
          ) : null}
        </Box>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent
        sx={{ p: 0, display: "flex", flexDirection: "column", minHeight: 0 }}
      >
        <Accordion
          disableGutters
          elevation={0}
          expanded={isReasoningExpanded}
          onChange={(_event, expanded) => setIsReasoningExpanded(expanded)}
          sx={{
            borderBottom: "1px solid",
            borderColor: "divider",
            "&:before": { display: "none" },
          }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography fontWeight={600} fontSize={14}>
              תהליך החשיבה של המודל (אם נתמך על ידי המודל)
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 0 }}>
            <Box
              sx={{
                maxHeight: 180,
                overflowY: "auto",
                overflowAnchor: "auto",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                bgcolor: "grey.50",
                p: 1.5,
                direction: "rtl",
                textAlign: "right",
              }}
            >
              {reasoning.trim().length > 0 ? (
                <Typography
                  fontSize={13}
                  color="text.secondary"
                  sx={{ whiteSpace: "pre-wrap", lineHeight: 1.7 }}
                >
                  {reasoning}
                </Typography>
              ) : (
                <Typography fontSize={13} color="text.secondary">
                  {isStreaming
                    ? "המודל עדיין לא החזיר reasoning..."
                    : "לא התקבל reasoning בהרצה זו (ייתכן שהמודל לא תומך בכך)."}
                </Typography>
              )}
            </Box>
          </AccordionDetails>
        </Accordion>

        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            px: 3,
            py: 2.5,
            overflowY: "auto",
            overflowAnchor: "auto",
            direction: "rtl",
            textAlign: "right",
            "& table": {
              width: "100%",
              borderCollapse: "collapse",
              my: 1.5,
            },
            "& th, & td": {
              border: "1px solid",
              borderColor: "divider",
              p: 1,
              textAlign: "right",
            },
            "& h1, & h2, & h3": {
              mt: 2.5,
              mb: 1.2,
              lineHeight: 1.35,
            },
            "& p": {
              mb: 1.25,
              lineHeight: 1.8,
              fontSize: 15,
            },
            "& ul, & ol": {
              pr: 3,
              pl: 0,
              mb: 1.2,
            },
            "& li": {
              mb: 0.45,
            },
          }}
        >
          {errorMessage ? (
            <Typography color="error.main" fontSize={13} mb={1.5}>
              {errorMessage}
            </Typography>
          ) : null}

          {content.trim().length === 0 ? (
            <Typography color="text.secondary" fontSize={14}>
              ממתין לתשובת המודל...
            </Typography>
          ) : (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};
