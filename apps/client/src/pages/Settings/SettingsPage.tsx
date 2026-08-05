import { Box, Paper, Stack, Typography } from "@mui/material";

export const SettingsPage = () => {
  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          p: { xs: 2, md: 3 },
        }}
      >
        <Stack gap={1}>
          <Typography variant="h5" fontWeight={700}>
            הגדרות
          </Typography>
          <Typography color="text.secondary">
            עמוד ההגדרות מחובר כעת לניווט. אפשר להוסיף כאן העדפות משתמש, שפה,
            התראות ועוד.
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
};
