import { Card, CardContent, Stack, Typography } from "@mui/material";

export const Home = () => {
  return (
    <Stack
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        p: 2,
        background:
          "radial-gradient(circle at 80% 0%, #fff3dc 0%, #f6f9fc 45%, #edf6ff 100%)",
      }}
    >
      <Card
        elevation={4}
        sx={{ width: "100%", maxWidth: 640, borderRadius: 3 }}
      >
        <CardContent>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
            ברוכה הבאה ל-StudyBuddy
          </Typography>
        </CardContent>
      </Card>
    </Stack>
  );
};
