import { css } from "@emotion/css";

export const useStyles = () => {
  return {
    page: css({
      width: "100%",
      minHeight: "100vh",
      display: "grid",
      placeItems: "center",
      padding: "32px 16px",
      background:
        "radial-gradient(circle at 20% 10%, #e9f3ff 0%, #f6f9fc 40%, #f8f7f2 100%)",
      '[data-mui-color-scheme="dark"] &': {
        background:
          "radial-gradient(circle at 20% 10%, #0d1f35 0%, #111827 40%, #1a1a1a 100%)",
      },
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
      color: "var(--mui-palette-text-secondary)",
    }),
    heading: css({
      fontWeight: 700,
    }),
    secondaryHeadline: css({
      fontSize: "1.25rem",
      fontWeight: 700,
      paddingBottom: "0.5rem",
    }),
    subtitle: css({
      marginTop: "2px",
      color: "var(--mui-palette-text-secondary)",
    }),
    formStack: css({
      display: "grid",
      gap: "16px",
    }),
    actionsRow: css({
      display: "flex",
      justifyContent: "space-between",
      gap: "12px",
      flexWrap: "wrap",
    }),
    fieldError: css({
      marginTop: "6px",
      marginLeft: "1.5rem",
      color: "var(--mui-palette-error-main)",
      lineHeight: 1.4,
    }),
  };
};
