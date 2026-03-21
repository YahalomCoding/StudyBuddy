import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { type FC } from "react";
import { useForm } from "react-hook-form";
import { useStyles } from "./style";
import { type QuestionnaireForm } from "./types";

const mockUser = {
  username: "talit",
  email: "talit@example.com",
};

export const OnBoarding: FC = () => {
  const classes = useStyles();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<QuestionnaireForm>({
    defaultValues: {
      nickname: "",
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
                <TextField
                  className={classes.input}
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
