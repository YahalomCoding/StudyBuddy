import { Box, Button, Stack, Typography } from "@mui/material";
import {
  Controller,
  type Control,
  type FieldErrors,
  type UseFormRegister,
} from "react-hook-form";
import { RtlSelect, RtlTextField } from "../../components/RTL";
import { useStyles } from "./style";
import { semesterFocusGoals, type QuestionnaireForm } from "./types";

interface StepThreePageProps {
  control: Control<QuestionnaireForm>;
  errors: FieldErrors<QuestionnaireForm>;
  isSubmitting: boolean;
  onBack: () => void;
  register: UseFormRegister<QuestionnaireForm>;
}

export const StepThreePage = ({
  control,
  errors,
  isSubmitting,
  onBack,
  register,
}: StepThreePageProps) => {
  const classes = useStyles();

  return (
    <>
      <Box>
        <Typography className={classes.secondaryHeadline}>
          חוזקות וחולשות
        </Typography>
        <Stack sx={{ gap: 2, mt: 1 }}>
          <RtlTextField
            fullWidth
            id="strongTopics"
            label="באילו קורסים/נושאים את/ה מרגיש/ה חזק/ה?"
            placeholder="לדוגמה: מתמטיקה, סטטיסטיקה, תכנות"
            multiline
            minRows={2}
            error={Boolean(errors.strongTopics)}
            helperText={errors.strongTopics?.message}
            {...register("strongTopics", {
              required: "יש להזין נושאים חזקים",
            })}
          />
          <RtlTextField
            fullWidth
            id="challengingTopics"
            label="באילו קורסים/נושאים את/ה מתקשה?"
            placeholder="לדוגמה: פיזיקה, חשבונאות, כתיבה אקדמית"
            multiline
            minRows={2}
            error={Boolean(errors.challengingTopics)}
            helperText={errors.challengingTopics?.message}
            {...register("challengingTopics", {
              required: "יש להזין נושאים מאתגרים",
            })}
          />

          <Controller
            name="semesterFocusGoal"
            control={control}
            rules={{ required: "יש לבחור דגש לסמסטר" }}
            render={({ field }) => (
              <RtlSelect
                id="semesterFocusGoal"
                label="על מה תרצה/י לשים דגש בסמסטר הקרוב?"
                placeholder="בחר/י דגש"
                options={semesterFocusGoals.map((goal) => ({
                  label: goal,
                  value: goal,
                }))}
                name={field.name}
                value={field.value ?? ""}
                onChange={field.onChange}
                onBlur={field.onBlur}
                ref={field.ref}
                formControlProps={{
                  error: Boolean(errors.semesterFocusGoal),
                }}
                helperText={errors.semesterFocusGoal?.message}
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
          type="submit"
          variant="contained"
          size="large"
          disabled={isSubmitting}
        >
          {isSubmitting ? "שומר..." : "סיום"}
        </Button>
      </Box>
    </>
  );
};
