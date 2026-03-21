import { css } from "@emotion/css";

export const useStyles = () => {
  return {
    page: css({
      minHeight: "100vh",
      background:
        "radial-gradient(circle at 80% 0%, #fff3dc 0%, #f6f9fc 45%, #edf6ff 100%)",
      paddingTop: "48px",
      paddingBottom: "48px",
      paddingLeft: "40px",
      paddingRight: "40px",
    }),
    content: css({
      maxWidth: "1180px",
      margin: "0 auto",
      display: "grid",
      gap: "40px",
      direction: "rtl",
    }),
    title: css({
      fontWeight: 600,
      letterSpacing: "-0.01em",
    }),
    section: css({
      display: "grid",
      gap: "12px",
    }),
    sectionTitle: css({
      fontWeight: 600,
    }),
    tablePaper: css({
      border: "1px solid #e5e7eb",
      borderRadius: "8px",
      overflow: "hidden",
      boxShadow: "none",
    }),
    tableHeadRow: css({
      backgroundColor: "#fafafa",
    }),
    taskNameCell: css({
      fontWeight: 500,
    }),
    assignmentNameCell: css({
      fontWeight: 500,
    }),
    overdueRow: css({
      backgroundColor: "#fff8f6",
      borderLeft: "3px solid #fca5a5",
    }),
    overdueDaysCell: css({
      color: "#b42318",
      fontWeight: 600,
    }),
    regularDaysCell: css({
      color: "#475467",
    }),
    chipBase: css({
      fontWeight: 500,
    }),
  };
};

export const statusChipClass = (status: string) => {
  const baseStyles = {
    fontWeight: 500,
  };

  if (status === "הושלם") {
    return css({
      ...baseStyles,
      backgroundColor: "#e8f5e9",
      color: "#2e7d32",
    });
  }
  if (status === "פעיל") {
    return css({
      ...baseStyles,
      backgroundColor: "#e3f2fd",
      color: "#1565c0",
    });
  }

  return css({
    ...baseStyles,
    backgroundColor: "#fff3e0",
    color: "#b54708",
  });
};

export const typeChipClass = (type: string) => {
  const baseStyles = {
    fontWeight: 500,
  };

  if (type === "פרויקט") {
    return css({
      ...baseStyles,
      backgroundColor: "#e3f2fd",
      color: "#1d4ed8",
    });
  }
  if (type === "תרגול") {
    return css({
      ...baseStyles,
      backgroundColor: "#e8f5e9",
      color: "#2e7d32",
    });
  }

  return css({
    ...baseStyles,
    backgroundColor: "#f3f4f6",
    color: "#4b5563",
  });
};
