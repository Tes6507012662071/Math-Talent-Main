// src/api/auth.ts

const API_URL = "http://localhost:5000/api";

export const loginUser = async (email: string, password: string) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "เข้าสู่ระบบไม่สำเร็จ");
  }
  
  console.log("📌 Login successful, received token");

  return response.json(); // { token: "...", user: {...} }
};

export const registerUser = async (name: string, email: string, password: string) => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "สมัครสมาชิกไม่สำเร็จ");
  }

  return response.json(); // { message: "Registered successfully" }
};

export const fetchUserProfile = async (token: string) => {
  const response = await fetch(`${API_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("UNAUTHORIZED");
    }
    throw new Error("โหลดโปรไฟล์ไม่สำเร็จ");
  }

  return response.json(); // { _id, name, email, ... }
};

export const validateToken = async (token: string): Promise<boolean> => {
  try {
    await fetchUserProfile(token);
    return true;
  } catch (error) {
    return false;
  }
};