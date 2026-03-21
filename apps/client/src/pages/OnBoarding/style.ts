import { css } from "@emotion/css";
import { useTheme } from "@mui/material";

export const useStyles = () => {
  const theme = useTheme();

  return {
    page: css({
      width: "100%",
      minHeight: "100vh",
      display: "grid",
      placeItems: "center",
      padding: "32px 16px",
      background:
        "radial-gradient(circle at 20% 10%, #e9f3ff 0%, #f6f9fc 40%, #f8f7f2 100%)",
    }),
    card: css({
      width: "100%",
      maxWidth: "620px",
      borderRadius: "16px",
    }),
    cardContent: css({
      padding: "28px",
      "@media (max-width: 600px)": {
        padding: "18px",
      },
    }),
    sectionStack: css({
      display: "grid",
      gap: "18px",
    }),
    headingBlock: css({
      display: "grid",
      gap: "4px",
    }),
    overline: css({
      letterSpacing: "0.12em",
      color: "rgba(0, 0, 0, 0.6)",
    }),
    heading: css({
      fontWeight: 700,
    }),
    subtitle: css({
      marginTop: "2px",
      color: "rgba(0, 0, 0, 0.6)",
    }),
    formStack: css({
      display: "grid",
      gap: "16px",
    }),
    fieldError: css({
      marginTop: "6px",
      marginLeft: "1.5rem",
      color: "#d32f2f",
      lineHeight: 1.4,
    }),
    input: css({
      direction: "rtl",
      "& .MuiInputLabel-root": {
        right: theme.spacing(3),
        left: "auto",
        transformOrigin: "top right",
      },
      "& .MuiInputBase-input": {
        direction: "rtl",
        textAlign: "right",
      },
      "& .MuiOutlinedInput-notchedOutline legend": {
        textAlign: "right",
      },
    }),
  };
};
