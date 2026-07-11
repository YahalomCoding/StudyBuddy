import { Box, LinearProgress, Paper, Typography } from "@mui/material";
import type {
  QuestionnaireForm,
  QuestionnaireFormInput,
} from "@studybuddy/schemas";
import { type FC, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { StepOnePage } from "./GeneralDetails";
import { useCreateQuestionnaireMutation } from "./queries/createQuestionnaireMutation";
import { useAuth } from "../../contexts/AuthContext";
import { questionnaireResolver } from "./resolver";
import { StepThreePage } from "./StepThreePage";
import { StepTwoPage } from "./StepTwoPage";

const STEPS = [
  { number: 1, label: "פרטים כלליים" },
  { number: 2, label: "זמינות לימוד" },
  { number: 3, label: "העדפות" },
];

export const OnBoarding: FC = () => {
  const navigate = useNavigate();
  const { user, refreshMe } = useAuth();
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const { mutateAsync: submitQuestionnaire, isPending } =
    useCreateQuestionnaireMutation();

  const {
    register,
    control,
    handleSubmit,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<QuestionnaireFormInput, unknown, QuestionnaireForm>({
    resolver: questionnaireResolver,
    defaultValues: {
      nickname: "",
      studyType: undefined,
      faculty: undefined,
      coursesPerSemester: undefined,
      workStatus: undefined,
      studyAvailabilityDays: [],
      realisticStudyHoursPerDay: undefined,
      focusTime: undefined,
      preferredStudyDuration: undefined,
      strongTopics: "",
      challengingTopics: "",
      semesterFocusGoal: undefined,
    },
  });

  const onSubmit = async (data: QuestionnaireForm) => {
    await submitQuestionnaire(data);
    await refreshMe();
    navigate("/home", { replace: true });
  };

  const isBusy = isSubmitting || isPending;

  const goToStepTwo = async () => {
    const valid = await trigger([
      "nickname",
      "studyType",
      "faculty",
      "coursesPerSemester",
      "workStatus",
    ]);
    if (valid) setStep(2);
  };

  const goToStepThree = async () => {
    const valid = await trigger([
      "studyAvailabilityDays",
      "realisticStudyHoursPerDay",
      "focusTime",
      "preferredStudyDuration",
    ]);
    if (valid) setStep(3);
  };

  const progress = ((step - 1) / 2) * 100;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "white",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        p: 3,
      }}
    >
      {/* Logo / brand */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          mb: 3,
        }}
      >
        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: 2.5,
            bgcolor: "#f0fdf4",
            border: "1.5px solid #bbf7d0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 22,
          }}
        >
          🎒
        </Box>
        <Typography fontWeight={700} fontSize={20} color="text.primary">
          StudyBuddy
        </Typography>
      </Box>

      {/* Card */}
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 700,
          borderRadius: 4,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          overflow: "hidden",
        }}
      >
        {/* Progress bar */}
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 3,
            bgcolor: "transparent",
            "& .MuiLinearProgress-bar": {
              bgcolor: "#22c55e",
            },
          }}
        />

        <Box sx={{ p: { xs: 3, sm: 4 } }}>
          {/* Step indicators */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
              mb: 3,
            }}
          >
            {STEPS.map((s, i) => (
              <Box key={s.number} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.75,
                  }}
                >
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      fontWeight: 700,
                      bgcolor:
                        step > s.number
                          ? "#22c55e"
                          : step === s.number
                          ? "#22c55e"
                          : "action.disabledBackground",
                      color:
                        step >= s.number ? "white" : "text.disabled",
                      transition: "background 0.3s",
                    }}
                  >
                    {step > s.number ? "✓" : s.number}
                  </Box>
                  <Typography
                    fontSize={12}
                    fontWeight={step === s.number ? 600 : 400}
                    color={step === s.number ? "text.primary" : "text.secondary"}
                  >
                    {s.label}
                  </Typography>
                </Box>

                {/* Connector line */}
                {i < STEPS.length - 1 && (
                  <Box
                    sx={{
                      width: 32,
                      height: 1,
                      bgcolor: step > s.number ? "#22c55e" : "divider",
                      transition: "background 0.3s",
                    }}
                  />
                )}
              </Box>
            ))}
          </Box>

          {/* Heading */}
          <Box sx={{ mb: 3, textAlign: "center" }}>
            <Typography fontWeight={700} fontSize={22} color="text.primary" mb={0.5}>
              שאלון פתיחה
            </Typography>
            <Typography fontSize={13} color="text.secondary">
              מחובר כ-{user?.username} {user?.email ? `(${user.email})` : ""}
            </Typography>
          </Box>

          {/* Form */}
          <Box component="form" noValidate onSubmit={handleSubmit(onSubmit)}>
            {step === 1 ? (
              <StepOnePage
                control={control}
                errors={errors}
                isSubmitting={isBusy}
                onNext={goToStepTwo}
                register={register}
              />
            ) : step === 2 ? (
              <StepTwoPage
                control={control}
                errors={errors}
                isSubmitting={isBusy}
                onBack={() => setStep(1)}
                onNext={goToStepThree}
                register={register}
              />
            ) : (
              <StepThreePage
                control={control}
                errors={errors}
                isSubmitting={isBusy}
                onBack={() => setStep(2)}
                register={register}
              />
            )}
          </Box>
        </Box>
      </Paper>

      {/* Footer */}
      <Typography fontSize={12} color="text.disabled" mt={3}>
        © {new Date().getFullYear()} StudyBuddy
      </Typography>
    </Box>
  );
};