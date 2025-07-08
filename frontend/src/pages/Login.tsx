import React, { useState } from "react";
import AuthFormInput from "../components/AuthFormInput";
import { Link } from "react-router-dom";

const Login: React.FC = () => {
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 🔒 เรียก API login ตรงนี้
    console.log("Login with", form);
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
          <Link to="/Landing" className="text-sm text-blue-600 hover:underline mb-4 block text-right">
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
            เข้าสู่ระบบ
          </button>
          </Link>
        </form>
        <p className="text-sm text-center mt-4">
          ยังไม่มีบัญชี? <Link to="/register" className="text-blue-600 underline">สมัครสมาชิก</Link>
        </p>
      </div>
    </div>
    
  );
};

export default Login;
