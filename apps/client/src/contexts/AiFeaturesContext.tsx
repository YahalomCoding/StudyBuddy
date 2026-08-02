import React, { createContext, useContext, useState } from "react";
import { streamDeadlineInsights, streamStudyPlan } from "../api/ai";

export type AiFeatureKey = "studyPlan" | "deadlineInsights";

type AiFeatureState = {
  content: string;
  reasoning: string;
  errorMessage: string | null;
  isStreaming: boolean;
  hasFinished: boolean;
};

type AiFeatureStreamFn = (
  onDelta: (delta: string) => void,
  callbacks?: {
    onReasoningDelta?: (delta: string) => void;
  }
) => Promise<void>;

const AI_FEATURE_STREAMS: Record<
  AiFeatureKey,
  AiFeatureStreamFn
> = {
  studyPlan: streamStudyPlan,
  deadlineInsights: streamDeadlineInsights,
};

const createInitialAiFeatureState = (): Record<AiFeatureKey, AiFeatureState> => ({
  studyPlan: {
    content: "",
    reasoning: "",
    errorMessage: null,
    isStreaming: false,
    hasFinished: false,
  },
  deadlineInsights: {
    content: "",
    reasoning: "",
    errorMessage: null,
    isStreaming: false,
    hasFinished: false,
  },
});

type AiFeaturesContextValue = {
  aiModalOpen: boolean;
  activeAiFeature: AiFeatureKey | null;
  aiFeatureState: Record<AiFeatureKey, AiFeatureState>;
  openAiModal: (feature: AiFeatureKey) => void;
  closeAiModal: () => void;
  startAiFeatureGeneration: (feature: AiFeatureKey) => void;
};

const AiFeaturesContext = createContext<AiFeaturesContextValue | null>(null);

export const useAiFeatures = (): AiFeaturesContextValue => {
  const context = useContext(AiFeaturesContext);
  if (!context) {
    throw new Error("useAiFeatures must be used within an AiFeaturesProvider");
  }

  return context;
};

export const AiFeaturesProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [activeAiFeature, setActiveAiFeature] = useState<AiFeatureKey | null>(
    null
  );
  const [aiFeatureState, setAiFeatureState] = useState<
    Record<AiFeatureKey, AiFeatureState>
  >(createInitialAiFeatureState);

  const startAiFeatureGeneration = (feature: AiFeatureKey) => {
    const streamFn = AI_FEATURE_STREAMS[feature];
    const previousContent = aiFeatureState[feature].content;
    const previousReasoning = aiFeatureState[feature].reasoning;
    let receivedDelta = false;
    let receivedReasoningDelta = false;

    setAiFeatureState((prev) => ({
      ...prev,
      [feature]: {
        content: prev[feature].content,
        reasoning: prev[feature].reasoning,
        errorMessage: null,
        isStreaming: true,
        hasFinished: false,
      },
    }));

    void streamFn(
      (delta) => {
        receivedDelta = true;
        setAiFeatureState((prev) => ({
          ...prev,
          [feature]: {
            ...prev[feature],
            errorMessage: null,
            content:
              prev[feature].content === previousContent
                ? delta
                : prev[feature].content + delta,
          },
        }));
      },
      {
        onReasoningDelta: (delta) => {
          receivedReasoningDelta = true;
          setAiFeatureState((prev) => ({
            ...prev,
            [feature]: {
              ...prev[feature],
              reasoning:
                prev[feature].reasoning === previousReasoning
                  ? delta
                  : prev[feature].reasoning + delta,
            },
          }));
        },
      }
    )
      .catch((error: unknown) => {
        const defaultMessage = receivedDelta
          ? "היצירה הופסקה באמצע. התוכן עשוי להיות חלקי."
          : "לא הצלחנו לייצר תשובת AI כרגע.";
        const resolvedMessage =
          error instanceof Error && error.message.trim().length > 0
            ? error.message
            : defaultMessage;

        setAiFeatureState((prev) => ({
          ...prev,
          [feature]: {
            ...prev[feature],
            errorMessage: resolvedMessage,
          },
        }));
      })
      .finally(() => {
        if (!receivedReasoningDelta && previousReasoning.trim().length > 0) {
          setAiFeatureState((prev) => ({
            ...prev,
            [feature]: {
              ...prev[feature],
              reasoning: previousReasoning,
            },
          }));
        }

        setAiFeatureState((prev) => ({
          ...prev,
          [feature]: {
            ...prev[feature],
            isStreaming: false,
            hasFinished: true,
          },
        }));
      });
  };

  const openAiModal = (feature: AiFeatureKey) => {
    setActiveAiFeature(feature);
    setAiModalOpen(true);

    const state = aiFeatureState[feature];
    const hasRenderedContent = state.content.trim().length > 0;
    if (!state.isStreaming && !hasRenderedContent && !state.hasFinished) {
      startAiFeatureGeneration(feature);
    }
  };

  const closeAiModal = () => {
    setAiModalOpen(false);
  };

  return (
    <AiFeaturesContext.Provider
      value={{
        aiModalOpen,
        activeAiFeature,
        aiFeatureState,
        openAiModal,
        closeAiModal,
        startAiFeatureGeneration,
      }}
    >
      {children}
    </AiFeaturesContext.Provider>
  );
};
