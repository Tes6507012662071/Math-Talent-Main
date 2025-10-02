import React, { useState } from "react";
import AuthFormInput from "../components/AuthFormInput";
import { Link } from "react-router-dom";
import { registerUser } from "../api/auth";
import { useNavigate } from "react-router-dom";

const Register: React.FC = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

const navigate = useNavigate();

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (form.password !== form.confirmPassword) {
    alert("รหัสผ่าน ไม่ตรงกัน");
    return;
  }

  try {
    await registerUser(form.name, form.email, form.password);
    alert("สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ");
    navigate("/login");
  } catch (err: any) {
    alert(err.message || "สมัครไม่สำเร็จ");
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-xl font-semibold mb-6 text-center">สมัครสมาชิก</h2>
        <form onSubmit={handleSubmit}>
          <AuthFormInput
            label="ชื่อ-นามสกุล"
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
          />
          <AuthFormInput
            label="อีเมล"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
          />
          <AuthFormInput
            label="รหัสผ่าน"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
          />
          <AuthFormInput
            label="ยืนยัน รหัสผ่าน"
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
          />
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
            สมัครสมาชิก
          </button>
        </form>
        <p className="text-sm text-center mt-4">
          มีบัญชีอยู่แล้ว? <Link to="/login" className="text-blue-600 underline">เข้าสู่ระบบ</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
