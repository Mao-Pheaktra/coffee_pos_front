import api from "./api";

export const getGeneralSettings = async () => {
  const response = await api.get("/settings/general");
  return response.data;
};

export const updateGeneralSettings = async (formData) => {
  formData.append("_method", "PUT");

  const response = await api.post(
    "/admin/settings/general",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};