import { Box, Button, Stack, Typography } from "@mui/material";
import {
  Controller,
  type Control,
  type FieldErrors,
  type UseFormRegister,
} from "react-hook-form";
import { RtlSelect, RtlTextField } from "../../components/RTL";
import { useStyles } from "./style";
import {
  faculties,
  studyTypes,
  workStatuses,
  type QuestionnaireForm,
} from "./types";

interface StepOnePageProps {
  control: Control<QuestionnaireForm>;
  errors: FieldErrors<QuestionnaireForm>;
  isSubmitting: boolean;
  onNext: () => void;
  register: UseFormRegister<QuestionnaireForm>;
}

export const StepOnePage = ({
  control,
  errors,
  isSubmitting,
  onNext,
  register,
}: StepOnePageProps) => {
  const classes = useStyles();

  return (
    <>
      <RtlTextField
        fullWidth
        id="שם"
        label="שם חיבה"
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
            rules={{ required: "יש לבחור סוג לימודים" }}
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
                formControlProps={{ error: Boolean(errors.studyType) }}
                helperText={errors.studyType?.message}
              />
            )}
          />

          <Controller
            name="faculty"
            control={control}
            rules={{ required: "יש לבחור תחום / פקולטה" }}
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
                formControlProps={{ error: Boolean(errors.faculty) }}
                helperText={errors.faculty?.message}
              />
            )}
          />

          <RtlTextField
            fullWidth
            type="number"
            id="coursesPerSemester"
            label="מספר קורסים בסמסטר"
            placeholder="הקלד מספר"
            error={Boolean(errors.coursesPerSemester)}
            helperText={errors.coursesPerSemester?.message}
            {...register("coursesPerSemester", {
              required: "יש להזין מספר קורסים",
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
            rules={{ required: "יש לבחור סטטוס עבודה" }}
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
                formControlProps={{ error: Boolean(errors.workStatus) }}
                helperText={errors.workStatus?.message}
              />
            )}
          />
        </Stack>
      </Box>

      <Button
        type="button"
        variant="contained"
        size="large"
        disabled={isSubmitting}
        onClick={onNext}
      >
        המשך
      </Button>
    </>
  );
};
