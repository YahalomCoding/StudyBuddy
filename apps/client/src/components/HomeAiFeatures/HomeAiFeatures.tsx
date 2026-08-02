import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { Box, Button, Paper, Typography } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { generateAssignmentsFromAi } from "../../api/ai";
import { homeDashboardQueryKey } from "../../api/home";
import { AiMarkdownModal } from "../AiMarkdownModal/AiMarkdownModal";
import {
  type AiFeatureKey,
  useAiFeatures,
} from "../../contexts/AiFeaturesContext";

const AI_FEATURE_CONFIG: Record<AiFeatureKey, { title: string }> = {
  studyPlan: {
    title: "AI Study Plan",
  },
  deadlineInsights: {
    title: "Deadline Insights",
  },
};

export const HomeAiFeatures = () => {
  const queryClient = useQueryClient();
  const {
    aiModalOpen,
    activeAiFeature,
    aiFeatureState,
    openAiModal,
    closeAiModal,
    startAiFeatureGeneration,
  } = useAiFeatures();

  const generateAssignmentsMutation = useMutation({
    mutationFn: generateAssignmentsFromAi,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: homeDashboardQueryKey });
    },
    meta: { disableLoadingDefault: true },
  });

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          p: 2,
          mb: 2.5,
          display: "flex",
          alignItems: { xs: "flex-start", md: "center" },
          justifyContent: "space-between",
          flexDirection: { xs: "column", md: "row" },
          gap: 1.5,
          bgcolor: "background.paper",
        }}
        dir="ltr"
      >
        <Box display="flex" alignItems="center" gap={2}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #a78bfa 0%, #60a5fa 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <AutoAwesomeIcon sx={{ color: "white", fontSize: 24 }} />
          </Box>
          <Box dir="ltr" sx={{ textAlign: "left" }}>
            <Typography fontWeight={600} fontSize={15}>
              Generate AI Study Plan
            </Typography>
            <Typography variant="body2" color="text.secondary" dir="ltr">
              A custom AI-generated study plan to help you progress.
            </Typography>
          </Box>
        </Box>
        <Box
          display="flex"
          alignItems="center"
          gap={1}
          flexWrap="wrap"
          dir="ltr"
          sx={{
            width: { xs: "100%", md: "auto" },
            justifyContent: { xs: "flex-start", md: "flex-end" },
          }}
        >
          <Button
            variant="contained"
            onClick={() => openAiModal("studyPlan")}
            sx={{
              bgcolor: "#22c55e",
              color: "white",
              textTransform: "none",
              fontWeight: 700,
              borderRadius: 2.5,
              "&:hover": { bgcolor: "#16a34a" },
            }}
          >
            Generate Study Plan
          </Button>

          <Button
            variant="outlined"
            onClick={() => openAiModal("deadlineInsights")}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              borderRadius: 2.5,
            }}
          >
            Deadline Insights
          </Button>

          <Button
            variant="contained"
            onClick={() => generateAssignmentsMutation.mutate()}
            disabled={generateAssignmentsMutation.isPending}
            sx={{
              bgcolor: "#0ea5e9",
              color: "white",
              textTransform: "none",
              fontWeight: 700,
              borderRadius: 2.5,
              "&:hover": { bgcolor: "#0284c7" },
            }}
          >
            {generateAssignmentsMutation.isPending
              ? "Generating Assignments..."
              : "Generate Assignments"}
          </Button>
        </Box>
      </Paper>

      <AiMarkdownModal
        open={aiModalOpen && activeAiFeature !== null}
        title={activeAiFeature ? AI_FEATURE_CONFIG[activeAiFeature].title : ""}
        content={activeAiFeature ? aiFeatureState[activeAiFeature].content : ""}
        reasoning={
          activeAiFeature ? aiFeatureState[activeAiFeature].reasoning : ""
        }
        isStreaming={
          activeAiFeature ? aiFeatureState[activeAiFeature].isStreaming : false
        }
        errorMessage={
          activeAiFeature ? aiFeatureState[activeAiFeature].errorMessage : null
        }
        canRegenerate={
          activeAiFeature
            ? aiFeatureState[activeAiFeature].hasFinished &&
              !aiFeatureState[activeAiFeature].isStreaming
            : false
        }
        onRegenerate={
          activeAiFeature
            ? () => {
                startAiFeatureGeneration(activeAiFeature);
              }
            : undefined
        }
        onClose={closeAiModal}
      />
    </>
  );
};
