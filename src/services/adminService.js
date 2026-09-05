import api from "./api";

export const getAdminDashboard = async () => {
  const response = await api.get("/admin/dashboard");

  return response.data;
};

export const getAllUsers = async () => {
  const response = await api.get("/admin/users");

  return response.data;
};

export const deleteAdminUser = async (id) => {
  const response = await api.delete(`/admin/users/${id}`);

  return response.data;
};

export const getAllTodos = async () => {
  const response = await api.get("/admin/todos");

  return response.data;
};

export const deleteAdminTodo = async (id) => {
  const response = await api.delete(`/admin/todos/${id}`);

  return response.data;
};
