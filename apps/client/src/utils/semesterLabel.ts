export const formatSemesterLabel = (
  semesterNumber: number | null | undefined
) => {
  if (semesterNumber === 1) {
    return "א";
  }

  if (semesterNumber === 2) {
    return "ב";
  }

  if (semesterNumber === 3) {
    return "קיץ";
  }

  return null;
};
