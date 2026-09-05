import api from "./api";

export const registerUser = async (userData) => {
  const response = await api.post("/users/register", userData);

  return response.data;
};

export const loginUser = async (credentials) => {
  const response = await api.post("/users/login", credentials);

  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get("/users/me");

  return response.data;
};
