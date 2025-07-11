import axios from "axios";

const API_URL = "http://localhost:5000/api";

export const registerUser = async (data: {
  name: string;
  email: string;
  password: string;
}) => {
  const res = await axios.post(`${API_URL}/auth/register`, data);
  return res.data;
};

export const loginUser = async (data: {
  email: string;
  password: string;
}) => {
  const res = await axios.post(`${API_URL}/auth/login`, data);
  return res.data;
};

export const fetchUserProfile = async (token: string) => {
  const res = await axios.get(`${API_URL}/auth/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};