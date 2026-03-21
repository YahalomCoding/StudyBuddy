import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Typography,
} from "@mui/material";
import { type FC } from "react";
import { Controller, useForm } from "react-hook-form";
import { RtlSelect, RtlTextField } from "../../components/RTL";
import { useStyles } from "./style";
import {
  faculties,
  type QuestionnaireForm,
  studyTypes,
  workStatuses,
} from "./types";

const mockUser = {
  username: "talit",
  email: "talit@example.com",
};

export const OnBoarding: FC = () => {
  const classes = useStyles();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<QuestionnaireForm>({
    defaultValues: {
      nickname: "",
      studyType: undefined,
      faculty: undefined,
      coursesPerSemester: undefined,
      workStatus: undefined,
    },
  });

  const onSubmit = async (data: QuestionnaireForm) => {
    void data;
    await new Promise((resolve) => setTimeout(resolve, 300));
  };

  return (
    <Stack className={classes.page}>
      <Card className={classes.card} elevation={6}>
        <CardContent className={classes.cardContent}>
          <Stack className={classes.sectionStack}>
            <Box className={classes.headingBlock}>
              <Typography variant="overline" className={classes.overline}>
                שלב ראשון
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
                <RtlTextField
                  fullWidth
                  id="שם"
                  label="שם חיבה"
                  slotProps={{
                    inputLabel: {
                      shrink: true,
                    },
                  }}
                  placeholder="הקלד שם שאתה רוצה שנשתמש בו באתר"
                  error={Boolean(errors.nickname)}
                  helperText={errors.nickname?.message}
                  {...register("nickname", {
                    required: "בבקשה להזין שם",
                    minLength: {
                      value: 2,
                      message: "השם חייב להיות לפחות 2 תווים",
                    },
                  })}
                />

                <Box>
                  <Typography className={classes.secondaryHeadline}>
                    פרטים כלליים
                  </Typography>

                  <Stack sx={{ gap: 2 }}>
                    <Controller
                      name="studyType"
                      control={control}
                      render={({ field }) => (
                        <RtlSelect
                          id="studyType"
                          label="סוג לימודים"
                          placeholder="בחר סוג לימודים"
                          options={studyTypes.map((type) => ({
                            label: type,
                            value: type,
                          }))}
                          name={field.name}
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          ref={field.ref}
                        />
                      )}
                    />

                    <Controller
                      name="faculty"
                      control={control}
                      render={({ field }) => (
                        <RtlSelect
                          id="faculty"
                          label="תחום / פקולטה"
                          placeholder="בחר תחום / פקולטה"
                          options={faculties.map((faculty) => ({
                            label: faculty,
                            value: faculty,
                          }))}
                          name={field.name}
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          ref={field.ref}
                        />
                      )}
                    />

                    <RtlTextField
                      fullWidth
                      type="number"
                      id="coursesPerSemester"
                      label="מספר קורסים בסמסטר"
                      slotProps={{
                        inputLabel: {
                          shrink: true,
                        },
                      }}
                      placeholder="הקלד מספר"
                      error={Boolean(errors.coursesPerSemester)}
                      helperText={errors.coursesPerSemester?.message}
                      {...register("coursesPerSemester", {
                        valueAsNumber: true,
                        min: {
                          value: 1,
                          message: "מספר הקורסים חייב להיות לפחות 1",
                        },
                      })}
                    />

                    <Controller
                      name="workStatus"
                      control={control}
                      render={({ field }) => (
                        <RtlSelect
                          id="workStatus"
                          label="האם את/ת עובד/ת?"
                          placeholder="בחר סטטוס עבודה"
                          options={workStatuses.map((status) => ({
                            label: status,
                            value: status,
                          }))}
                          name={field.name}
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          ref={field.ref}
                        />
                      )}
                    />
                  </Stack>
                </Box>

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "שומר..." : "המשך"}
                </Button>
              </Stack>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
};
