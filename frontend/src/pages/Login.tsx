import React, { useState } from "react";
import AuthFormInput from "../components/AuthFormInput";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../api/auth";

const Login: React.FC = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted with:", form);

    try {
      const data = await loginUser(form.email, form.password);
      console.log("Login success, token:", data.token);
      localStorage.setItem("token", data.token);
      navigate("/profile");
    } catch (err: any) {
      console.error("Login failed:", err);
      alert(err.message || "เข้าสู่ระบบล้มเหลว");
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-xl font-semibold mb-6 text-center">เข้าสู่ระบบ</h2>
        <form onSubmit={handleSubmit}>
          <AuthFormInput
            label="Email"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
          />
          <AuthFormInput
            label="Password"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
          />
          
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
            เข้าสู่ระบบ
          </button>
        </form>
        <p className="text-sm text-center mt-4">
          ยังไม่มีบัญชี? <Link to="/register" className="text-blue-600 underline">สมัครสมาชิก</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
