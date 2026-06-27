import { Box, Button, Stack, Typography } from "@mui/material";
import {
  semesterFocusGoals,
  type QuestionnaireFormInput,
} from "@studybuddy/schemas";
import {
  Controller,
  type Control,
  type FieldErrors,
  type UseFormRegister,
} from "react-hook-form";
import { RtlSelect, RtlTextField } from "../../components/RTL";

interface StepThreePageProps {
  control: Control<QuestionnaireFormInput>;
  errors: FieldErrors<QuestionnaireFormInput>;
  isSubmitting: boolean;
  onBack: () => void;
  register: UseFormRegister<QuestionnaireFormInput>;
}

export const StepThreePage = ({
  control,
  errors,
  isSubmitting,
  onBack,
  register,
}: StepThreePageProps) => {
  return (
    <Stack gap={3}>
      <Box>
        <Typography
          fontSize={13}
          fontWeight={600}
          color="text.secondary"
          mb={1.5}
          sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}
        >
          חוזקות וחולשות
        </Typography>

        <Stack gap={2}>
          <RtlTextField
            fullWidth
            id="strongTopics"
            label="באילו קורסים/נושאים את/ה מרגיש/ה חזק/ה?"
            placeholder="לדוגמה: מתמטיקה, סטטיסטיקה, תכנות"
            multiline
            minRows={2}
            error={Boolean(errors.strongTopics)}
            helperText={errors.strongTopics?.message}
            {...register("strongTopics")}
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
            {...register("challengingTopics")}
          />

          <Controller
            name="semesterFocusGoal"
            control={control}
            render={({ field }) => (
              <RtlSelect
                id="semesterFocusGoal"
                label="על מה תרצה/י לשים דגש בסמסטר הקרוב?"
                placeholder="בחר/י דגש"
                options={semesterFocusGoals.map((goal) => ({ label: goal, value: goal }))}
                name={field.name}
                value={field.value ?? ""}
                onChange={field.onChange}
                onBlur={field.onBlur}
                ref={field.ref}
                formControlProps={{ error: Boolean(errors.semesterFocusGoal) }}
                helperText={errors.semesterFocusGoal?.message}
              />
            )}
          />
        </Stack>
      </Box>

      <Box sx={{ display: "flex", gap: 1.5 }}>
        <Button
          type="button"
          variant="outlined"
          size="large"
          fullWidth
          disabled={isSubmitting}
          onClick={onBack}
          sx={{
            borderRadius: 2,
            fontWeight: 600,
            fontSize: 15,
            py: 1.2,
            borderColor: "divider",
            color: "text.primary",
            "&:hover": { borderColor: "text.secondary", bgcolor: "action.hover" },
          }}
        >
          חזרה
        </Button>
        <Button
          type="submit"
          variant="contained"
          size="large"
          fullWidth
          disabled={isSubmitting}
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
          {isSubmitting ? "שומר..." : "סיום"}
        </Button>
      </Box>
    </Stack>
  );
};