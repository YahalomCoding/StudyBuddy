import { Box, Card, Typography } from "@mui/material";
import { useStyles } from "../style";

type GradesSummaryProps = {
  overallAverage: number | null;
  totalCredits: number;
};

export const GradesSummary = ({
  overallAverage,
  totalCredits,
}: GradesSummaryProps) => {
  const classes = useStyles();

  return (
    <Box className={classes.summaryGrid}>
      <Card className={classes.summaryCard}>
        <Typography
          variant="body2"
          className={classes.summaryLabel}
        >
          ממוצע כולל
        </Typography>
        <Typography
          variant="h4"
          className={classes.summaryValue}
        >
          {overallAverage ?? "—"}
        </Typography>
      </Card>

      <Card className={classes.summaryCard}>
        <Typography
          variant="body2"
          className={classes.summaryLabel}
        >
          סה&quot;כ נקודות זכות
        </Typography>
        <Typography
          variant="h4"
          className={classes.summaryValue}
        >
          {totalCredits}
        </Typography>
      </Card>
    </Box>
  );
};
