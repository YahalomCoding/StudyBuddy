import baseApi from "./baseApi";

export const importAssignmentsFromIcs = async (
  file: File
): Promise<{ createdCount: number }> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await baseApi.post("/assignments/import-ics", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};