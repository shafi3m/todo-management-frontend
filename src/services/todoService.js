import api from "./api";

export const getTodos = async (params = {}) => {
  const response = await api.get("/todos", {
    params,
  });

  return response.data;
};

export const getTodoById = async (id) => {
  const response = await api.get(`/todos/${id}`);

  return response.data;
};

export const createTodo = async (todoData) => {
  const response = await api.post("/todos/new", todoData);

  return response.data;
};

export const updateTodo = async (id, todoData) => {
  const response = await api.put(`/todos/update/${id}`, todoData);

  return response.data;
};

export const deleteTodo = async (id) => {
  const response = await api.delete(`/todos/delete/${id}`);

  return response.data;
};
