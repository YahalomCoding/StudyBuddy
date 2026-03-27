import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Fade,
  IconButton,
  Paper,
  Snackbar,
  Tooltip,
  Typography,
} from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CloseIcon from "@mui/icons-material/Close";
import { ChatBot } from "./Chatbot";
import {
  showNotificationClientDef,
  showNotificationInputSchema,
} from "@studybuddy/tool-definitions";
import {
  clientTools,
  createChatClientOptions,
  fetchServerSentEvents,
  type AnyClientTool,
} from "@tanstack/ai-client";
import { useChat } from "@tanstack/ai-react";

export const ChatBotBubble = <T extends AnyClientTool[]>({
  tools,
  exampleQuestions,
}: {
  tools?: T;
  exampleQuestions?: string[];
}) => {
  const [open, setOpen] = useState(false);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    type: "success" | "error" | "info" | "warning";
  }>({
    open: false,
    message: "",
    type: "info",
  });

  const showNotificationTool = useMemo(
    () =>
      showNotificationClientDef.client(async (args) => {
        const { message, type } = showNotificationInputSchema.parse(args);
        setNotification({
          open: true,
          message,
          type,
        });

        return { shown: true };
      }),
    []
  );

  const allTools = useMemo(
    () =>
      tools
        ? clientTools(...tools, showNotificationTool)
        : clientTools(showNotificationTool),
    [showNotificationTool, tools]
  );

  const chatOptions = useMemo(
    () =>
      createChatClientOptions({
        connection: fetchServerSentEvents(
          `${import.meta.env.VITE_API_URL}/chat`,
          { credentials: "include" }
        ),
        tools: allTools,
      }),
    [allTools]
  );

  const chat = useChat(chatOptions);

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 65,
        right: 65,
        zIndex: 1300,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
      }}
    >
      <Snackbar
        open={notification.open}
        autoHideDuration={3500}
        onClose={(_, reason) => {
          if (reason === "clickaway") return;
          setNotification((prev) => ({ ...prev, open: false }));
        }}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setNotification((prev) => ({ ...prev, open: false }))}
          severity={notification.type}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>

      {/* Chat panel */}
      <Fade in={open} unmountOnExit>
        <Paper
          elevation={8}
          sx={{
            mb: 2,
            width: 360,
            height: 520,
            display: "flex",
            flexDirection: "column",
            borderRadius: 3,
            overflow: "hidden",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              px: 2,
              py: 1.25,
              bgcolor: "secondary.main",
              color: "primary.contrastText",
              flexShrink: 0,
            }}
          >
            <AutoAwesomeIcon fontSize="small" />
            <Typography variant="subtitle2" fontWeight={600} sx={{ flex: 1 }}>
              Study Buddy
            </Typography>
            <Tooltip title="Close">
              <IconButton
                size="small"
                onClick={() => setOpen(false)}
                sx={{ color: "primary.contrastText", p: 0.5 }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Chatbot body */}
          <Box sx={{ flex: 1, overflow: "hidden", minHeight: 0 }}>
            <ChatBot chat={chat} exampleQuestions={exampleQuestions} />
          </Box>
        </Paper>
      </Fade>

      {/* Bubble button */}
      <Tooltip
        title={
          open ? (
            ""
          ) : (
            <span style={{ fontSize: 15 }}>Chat with Your Study Buddy</span>
          )
        }
        placement="left"
      >
        <IconButton
          onClick={() => setOpen((v) => !v)}
          sx={{
            width: 70,
            height: 70,
            bgcolor: "secondary.main",
            color: "primary.contrastText",
            boxShadow: 4,
            transition: "transform 0.2s, box-shadow 0.2s",
            "&:hover": {
              bgcolor: "primary.dark",
              boxShadow: 6,
              transform: "scale(1.08)",
            },
          }}
        >
          <AutoAwesomeIcon fontSize="large" />
        </IconButton>
      </Tooltip>
    </Box>
  );
};
