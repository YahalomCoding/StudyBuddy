import { Box, Button, Stack, Typography } from "@mui/material";
import {
  faculties,
  studyTypes,
  workStatuses,
  type QuestionnaireFormInput,
} from "@studybuddy/schemas";
import {
  Controller,
  type Control,
  type FieldErrors,
  type UseFormRegister,
} from "react-hook-form";
import { RtlSelect, RtlTextField } from "../../components/RTL";

interface StepOnePageProps {
  control: Control<QuestionnaireFormInput>;
  errors: FieldErrors<QuestionnaireFormInput>;
  isSubmitting: boolean;
  onNext: () => void;
  register: UseFormRegister<QuestionnaireFormInput>;
}

export const StepOnePage = ({
  control,
  errors,
  isSubmitting,
  onNext,
  register,
}: StepOnePageProps) => {
  return (
    <Stack gap={3}>
      <RtlTextField
        fullWidth
        id="שם"
        label="שם חיבה"
        placeholder="הקלד שם שאתה רוצה שנשתמש בו באתר"
        error={Boolean(errors.nickname)}
        helperText={errors.nickname?.message}
        {...register("nickname")}
      />

      <Box>
        <Typography
          fontSize={13}
          fontWeight={600}
          color="text.secondary"
          mb={1.5}
          sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}
        >
          פרטים כלליים
        </Typography>

        <Stack gap={2}>
          <Controller
            name="studyType"
            control={control}
            render={({ field }) => (
              <RtlSelect
                id="studyType"
                label="סוג לימודים"
                placeholder="בחר סוג לימודים"
                options={studyTypes.map((type) => ({ label: type, value: type }))}
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
            render={({ field }) => (
              <RtlSelect
                id="faculty"
                label="תחום / פקולטה"
                placeholder="בחר תחום / פקולטה"
                options={faculties.map((faculty) => ({ label: faculty, value: faculty }))}
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
            {...register("coursesPerSemester", { valueAsNumber: true })}
          />

          <Controller
            name="workStatus"
            control={control}
            render={({ field }) => (
              <RtlSelect
                id="workStatus"
                label="האם את/ת עובד/ת?"
                placeholder="בחר סטטוס עבודה"
                options={workStatuses.map((status) => ({ label: status, value: status }))}
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
        fullWidth
        disabled={isSubmitting}
        onClick={onNext}
        sx={{
          bgcolor: "#22c55e",
          "&:hover": { bgcolor: "#16a34a" },
          borderRadius: 2,
          fontWeight: 600,
          fontSize: 15,
          py: 1.2,
          boxShadow: "none",
        }}
      >
        המשך
      </Button>
    </Stack>
  );
};