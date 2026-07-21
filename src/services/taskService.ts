import axios from "axios";

const API = axios.create({
  baseURL: "https://todo-server-jtmk.vercel.app",
});

// Automatically attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const getTasks = async () => {
  const res = await API.get("/tasks");
  return res.data;
};

export const createTask = async (task: any) => {
  const res = await API.post("/tasks", task);
  return res.data;
};

export const updateTask = async (id: number, task: any) => {
  const res = await API.put(`/tasks/${id}`, task);
  return res.data;
};

export const deleteTask = async (id: number) => {
  const res = await API.delete(`/tasks/${id}`);
  return res.data;
};

export const updateTaskStatus = async (id: number, status: string) => {
  const res = await API.patch(`/tasks/${id}/status`, { status });
  return res.data;
};