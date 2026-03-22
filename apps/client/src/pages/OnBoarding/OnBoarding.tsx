import { Box, Card, CardContent, Stack, Typography } from "@mui/material";
import { type FC, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { StepOnePage } from "./GeneralDetails";
import { useCreateQuestionnaireMutation } from "./queries/createQuestionnaireMutation";
import { questionnaireResolver } from "./resolver";
import { StepThreePage } from "./StepThreePage";
import { StepTwoPage } from "./StepTwoPage";
import { useStyles } from "./style";
import { type QuestionnaireForm } from "./types";

const mockUser = {
  username: "talit",
  email: "talit@example.com",
};

export const OnBoarding: FC = () => {
  const classes = useStyles();
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const { mutateAsync: submitQuestionnaire, isPending } =
    useCreateQuestionnaireMutation();

  const {
    register,
    control,
    handleSubmit,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<QuestionnaireForm>({
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
    navigate("/home", { replace: true });
  };

  const isBusy = isSubmitting || isPending;

  const goToStepTwo = async () => {
    const isStepOneValid = await trigger([
      "nickname",
      "studyType",
      "faculty",
      "coursesPerSemester",
      "workStatus",
    ]);

    if (isStepOneValid) {
      setStep(2);
    }
  };

  const goToStepThree = async () => {
    const isStepTwoValid = await trigger([
      "studyAvailabilityDays",
      "realisticStudyHoursPerDay",
      "focusTime",
      "preferredStudyDuration",
    ]);

    if (isStepTwoValid) {
      setStep(3);
    }
  };

  const stepLabel = {
    1: "שלב ראשון",
    2: "שלב שני",
    3: "שלב שלישי",
  }[step];

  return (
    <Stack className={classes.page}>
      <Card className={classes.card} elevation={6}>
        <CardContent className={classes.cardContent}>
          <Stack className={classes.sectionStack}>
            <Box className={classes.headingBlock}>
              <Typography variant="overline" className={classes.overline}>
                {stepLabel}
              </Typography>
              <Typography
                variant="h4"
                component="h1"
                className={classes.heading}
              >
                שאלון פתיחה
              </Typography>
              <Typography variant="body2" className={classes.subtitle}>
                מחובר כ-{mockUser.username} ({mockUser.email})
              </Typography>
            </Box>

            <Box component="form" noValidate onSubmit={handleSubmit(onSubmit)}>
              <Stack className={classes.formStack}>
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
              </Stack>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
};
