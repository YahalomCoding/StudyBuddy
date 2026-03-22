import { Box, Button, Chip, Stack, Typography } from "@mui/material";
import { type SelectChangeEvent } from "@mui/material/Select";
import {
  Controller,
  type Control,
  type FieldErrors,
  type UseFormRegister,
} from "react-hook-form";
import { RtlSelect, RtlTextField } from "../../components/RTL";
import { useStyles } from "./style";
import {
  focusTimes,
  preferredStudyDurations,
  studyAvailabilityDays,
  type QuestionnaireForm,
} from "./types";

const ALL_DAYS_OPTION_VALUE = "__all_days__";

const isStudyAvailabilityDay = (value: string) =>
  studyAvailabilityDays.includes(
    value as (typeof studyAvailabilityDays)[number]
  );

const normalizeSelectedValues = (value: string | string[]) => {
  if (Array.isArray(value)) {
    return value;
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

interface StepTwoPageProps {
  control: Control<QuestionnaireForm>;
  errors: FieldErrors<QuestionnaireForm>;
  isSubmitting: boolean;
  onBack: () => void;
  onNext: () => void;
  register: UseFormRegister<QuestionnaireForm>;
}

export const StepTwoPage = ({
  control,
  errors,
  isSubmitting,
  onBack,
  onNext,
  register,
}: StepTwoPageProps) => {
  const classes = useStyles();

  return (
    <>
      <Box>
        <Typography className={classes.secondaryHeadline}>
          זמינות וזמן לימוד
        </Typography>

        <Stack sx={{ gap: 2, mt: 1 }}>
          <Controller
            name="studyAvailabilityDays"
            control={control}
            render={({ field }) => (
              <RtlSelect
                id="studyAvailabilityDays"
                label="באילו ימים את/ה זמינ/ה ללמוד?"
                placeholder="בחר/י יום אחד או יותר"
                options={[
                  {
                    label: "הכול",
                    value: ALL_DAYS_OPTION_VALUE,
                  },
                  ...studyAvailabilityDays.map((day) => ({
                    label: day,
                    value: day,
                  })),
                ]}
                name={field.name}
                value={field.value ?? []}
                onChange={(event) => {
                  const selectedValues = normalizeSelectedValues(
                    (event as SelectChangeEvent<string | string[]>).target.value
                  );

                  if (selectedValues.includes(ALL_DAYS_OPTION_VALUE)) {
                    const currentValue = field.value ?? [];
                    const areAllSelected = studyAvailabilityDays.every((day) =>
                      currentValue.includes(day)
                    );

                    field.onChange(
                      areAllSelected ? [] : [...studyAvailabilityDays]
                    );
                    return;
                  }

                  field.onChange(
                    selectedValues.filter((value) =>
                      isStudyAvailabilityDay(value)
                    )
                  );
                }}
                onBlur={field.onBlur}
                multiple
                ref={field.ref}
                renderValue={(selected) => {
                  const selectedDays = normalizeSelectedValues(
                    selected as string | string[]
                  ).filter((value) => isStudyAvailabilityDay(value));

                  if (selectedDays.length === 0) {
                    return (
                      <span style={{ opacity: 0.7 }}>בחרי יום אחד או יותר</span>
                    );
                  }

                  const areAllSelected = studyAvailabilityDays.every((day) =>
                    selectedDays.includes(day)
                  );

                  if (areAllSelected) {
                    return (
                      <Chip
                        size="small"
                        label="הכול"
                        onMouseDown={(event) => event.stopPropagation()}
                        onDelete={() => field.onChange([])}
                      />
                    );
                  }

                  return (
                    <Stack
                      direction="row"
                      spacing={0.75}
                      flexWrap="wrap"
                      useFlexGap
                    >
                      {selectedDays.map((day) => (
                        <Chip
                          key={day}
                          size="small"
                          label={day}
                          onMouseDown={(event) => event.stopPropagation()}
                          onDelete={() =>
                            field.onChange(
                              selectedDays.filter(
                                (selectedDay) => selectedDay !== day
                              )
                            )
                          }
                        />
                      ))}
                    </Stack>
                  );
                }}
                formControlProps={{
                  error: Boolean(errors.studyAvailabilityDays),
                }}
                helperText={errors.studyAvailabilityDays?.message}
              />
            )}
          />

          <RtlTextField
            fullWidth
            type="number"
            id="realisticStudyHoursPerDay"
            label="כמה שעות ביום ריאלית ללמידה?"
            placeholder="מספר שעות"
            error={Boolean(errors.realisticStudyHoursPerDay)}
            helperText={errors.realisticStudyHoursPerDay?.message}
            {...register("realisticStudyHoursPerDay", { valueAsNumber: true })}
          />

          <Controller
            name="focusTime"
            control={control}
            render={({ field }) => (
              <RtlSelect
                id="focusTime"
                label="מתי את/ה הכי מרוכז/ת?"
                placeholder="בחר/י זמן ריכוז"
                options={focusTimes.map((time) => ({
                  label: time,
                  value: time,
                }))}
                name={field.name}
                value={field.value ?? ""}
                onChange={field.onChange}
                onBlur={field.onBlur}
                ref={field.ref}
                formControlProps={{ error: Boolean(errors.focusTime) }}
                helperText={errors.focusTime?.message}
              />
            )}
          />

          <Controller
            name="preferredStudyDuration"
            control={control}
            render={({ field }) => (
              <RtlSelect
                id="preferredStudyDuration"
                label="משך למידה מועדף"
                placeholder="בחר/י 25 / 50 / 90 דקות"
                options={preferredStudyDurations.map((duration) => ({
                  label: `${duration} דקות`,
                  value: duration,
                }))}
                name={field.name}
                value={field.value ?? ""}
                onChange={field.onChange}
                onBlur={field.onBlur}
                ref={field.ref}
                formControlProps={{
                  error: Boolean(errors.preferredStudyDuration),
                }}
                helperText={errors.preferredStudyDuration?.message}
              />
            )}
          />
        </Stack>
      </Box>

      <Box className={classes.actionsRow}>
        <Button
          type="button"
          variant="outlined"
          size="large"
          disabled={isSubmitting}
          onClick={onBack}
        >
          חזרה
        </Button>

        <Button
          type="button"
          variant="contained"
          size="large"
          disabled={isSubmitting}
          onClick={onNext}
        >
          המשך
        </Button>
      </Box>
    </>
  );
};
