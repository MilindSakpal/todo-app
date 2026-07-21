import axios from "axios";

const API = "https://todo-server-beta-ten.vercel.app/auth";

export const login = async (
  email: string,
  password: string
) => {
  const response = await axios.post(`${API}/login`, {
    email,
    password,
  });

  return response.data;
};

export const register = async (data: {
  full_name: string;
  email: string;
  password: string;
  department: string;
}) => {
  const response = await axios.post(`${API}/register`, data);

  return response.data;
};