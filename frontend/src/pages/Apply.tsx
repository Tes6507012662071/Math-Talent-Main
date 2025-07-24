import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { submitIndividualForm } from "../api/individualForm";

interface Student {
  fullname: string;
  grade: string;
  school: string;
  phone: string;
  email: string;
  note?: string;
}

const Apply: React.FC = () => {
  const { eventId } = useParams();
  const [type, setType] = useState<"individual" | "school" | null>(null);

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold mb-4">สมัครสอบกิจกรรม #{eventId}</h1>

      {!type && (
        <div className="space-y-4">
          <p>เลือกวิธีการสมัคร:</p>
          <button
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            onClick={() => setType("individual")}
          >
            สมัครแบบบุคคล
          </button>
          <button
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
            onClick={() => setType("school")}
          >
            สมัครแบบโรงเรียน (อัปโหลด Excel)
          </button>
        </div>
      )}

      {type === "individual" && <IndividualForm eventId={eventId!} />}
      {type === "school" && <SchoolUploadForm eventId={eventId!} />}
    </div>
  );
};

export default Apply;

// จะเพิ่ม Component 2 ตัวด้านล่างต่อไป:
const IndividualForm = ({ eventId }: { eventId: string }) => {
  const [form, setForm] = useState({
    fullname: "",
    grade: "",
    school: "",
    phone: "",
    email: "",
    note: "",
  });
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      alert("กรุณาล็อกอินก่อนสมัคร");
      return;
    }
    console.log("🎯 สมัครกิจกรรม:", eventId, form);
    
    // 🔜 ต่อ backend / บันทึกในฐานข้อมูล
    try {
      await submitIndividualForm(token, { eventId, ...form });
      alert("สมัครสำเร็จ!");
      console.log("✅ eventId จาก URL:", eventId);
      // 🔄 กลับไปที่หน้ารายละเอียดกิจกรรม
      navigate(`/events/${eventId}`);
    } catch (error: any) {
      alert("เกิดข้อผิดพลาด: " + (error.message || "ไม่ทราบสาเหตุ"));
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow p-6 rounded space-y-4 mt-6">
      <h2 className="text-xl font-bold">สมัครแบบบุคคล</h2>

      <div>
        <label className="block mb-1 font-medium">ชื่อ - นามสกุล</label>
        <input
          type="text"
          name="fullname"
          value={form.fullname}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
          required
        />
      </div>

      <div>
        <label className="block mb-1 font-medium">ระดับชั้น</label>
        <select
          name="grade"
          value={form.grade}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
          required
        >
          <option value="">-- เลือกระดับชั้น --</option>
          <option value="ป.6">ป.6</option>
          <option value="ม.1">ม.1</option>
          <option value="ม.2">ม.2</option>
          <option value="ม.3">ม.3</option>
          <option value="ม.4">ม.4</option>
          <option value="ม.5">ม.5</option>
          <option value="ม.6">ม.6</option>
        </select>
      </div>

      <div>
        <label className="block mb-1 font-medium">โรงเรียน</label>
        <input
          type="text"
          name="school"
          value={form.school}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
          required
        />
      </div>

      <div>
        <label className="block mb-1 font-medium">เบอร์โทรศัพท์</label>
        <input
          type="text"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
          required
        />
      </div>

      <div>
        <label className="block mb-1 font-medium">อีเมล</label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
          required
        />
      </div>

      <div>
        <label className="block mb-1 font-medium">หมายเหตุเพิ่มเติม</label>
        <textarea
          name="note"
          value={form.note}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
          rows={3}
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        ส่งสมัครสอบ
      </button>
    </form>
  );
};

const SchoolUploadForm = ({ eventId }: { eventId: string }) => {
  const [file, setFile] = useState<File | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setError(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = evt.target?.result;
      if (typeof data === "string" || data instanceof ArrayBuffer) {
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

        // แปลงข้อมูลให้ตรงกับ Student interface
        const parsed: Student[] = jsonData.map((row) => ({
          fullname: row["ชื่อ-นามสกุล"] || "",
          grade: row["ระดับชั้น"] || "",
          school: row["โรงเรียน"] || "",
          phone: row["เบอร์โทร"] || "",
          email: row["อีเมล"] || "",
          note: row["หมายเหตุ"] || "",
        }));

        setStudents(parsed);
      }
    };
    reader.readAsBinaryString(f);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (students.length === 0) {
      setError("กรุณาเลือกไฟล์และตรวจสอบข้อมูลก่อนส่ง");
      return;
    }

    console.log("ส่งข้อมูลนักเรียนทั้งหมด", students);

    alert("ส่งข้อมูลเรียบร้อย (mock)");

    const token = localStorage.getItem('token');
    // TODO: เชื่อม backend
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE}/register/school`, {
        method: "POST",
        headers: { "Content-Type": "application/json","Authorization": `Bearer ${token}` },
        body: JSON.stringify({ eventId, students }),
      });

      if (response.ok) {
        alert("ส่งข้อมูลเรียบร้อย!");
        navigate(`/events/${eventId}`);
      } else {
        const err = await response.json();
        alert("เกิดข้อผิดพลาด: " + err.message);
      }
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 bg-white p-6 rounded shadow space-y-4">
      <h2 className="text-xl font-bold mb-4">สมัครแบบโรงเรียน (อัปโหลด Excel)</h2>

      <input
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileChange}
        className="border rounded p-2"
      />

      {error && <p className="text-red-600">{error}</p>}

      {students.length > 0 && (
        <>
          <h3 className="font-semibold mt-4 mb-2">ตัวอย่างข้อมูลในไฟล์</h3>
          <div className="overflow-x-auto max-h-64 border rounded">
            <table className="w-full border-collapse border border-gray-300 text-sm">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  <th className="border border-gray-300 px-2 py-1">ชื่อ-นามสกุล</th>
                  <th className="border border-gray-300 px-2 py-1">ระดับชั้น</th>
                  <th className="border border-gray-300 px-2 py-1">โรงเรียน</th>
                  <th className="border border-gray-300 px-2 py-1">เบอร์โทร</th>
                  <th className="border border-gray-300 px-2 py-1">อีเมล</th>
                  <th className="border border-gray-300 px-2 py-1">หมายเหตุ</th>
                </tr>
              </thead>
              <tbody>
                {students.map((stu, i) => (
                  <tr key={i}>
                    <td className="border border-gray-300 px-2 py-1">{stu.fullname}</td>
                    <td className="border border-gray-300 px-2 py-1">{stu.grade}</td>
                    <td className="border border-gray-300 px-2 py-1">{stu.school}</td>
                    <td className="border border-gray-300 px-2 py-1">{stu.phone}</td>
                    <td className="border border-gray-300 px-2 py-1">{stu.email}</td>
                    <td className="border border-gray-300 px-2 py-1">{stu.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <button
        type="submit"
        className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
      >
        ส่งสมัครสอบทั้งหมด
      </button>
    </form>
  );
};

