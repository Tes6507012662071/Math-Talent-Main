import React, { useState , useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  // [1] Upload Solution PDF
  const [selectedEvent, setSelectedEvent] = useState("");
  const [solutionFile, setSolutionFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState("");

  // [3] Upload Excel
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [excelUploadStatus, setExcelUploadStatus] = useState("");

  // ตัวอย่างข้อมูลผู้สมัคร (mock data)
  const applicants = [
    {
      id: "1",
      fullname: "สมชาย ใจดี",
      event: "คณิตศาสตร์ ม.ต้น",
      status: "slip_uploaded",
      slipUrl: "http://example.com/slip1.pdf",
    },
    {
      id: "2",
      fullname: "สมหญิง แสนสวย",
      event: "คณิตศาสตร์ ม.ปลาย",
      status: "registered",
      slipUrl: null,
    },
  ];

  // ตัวอย่างข้อมูลใบประกาศ
  const certificateUsers = [
    {
      id: "1",
      fullname: "สมชาย ใจดี",
      event: "คณิตศาสตร์ ม.ต้น",
      certUrl: "http://example.com/cert1.pdf",
    },
    {
      id: "3",
      fullname: "สมปอง แข็งแรง",
      event: "คณิตศาสตร์ ม.ปลาย",
      certUrl: null,
    },
  ];

  // ฟังก์ชัน handle
  const handleSolutionFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSolutionFile(e.target.files[0]);
      console.log("Selected solution file:", e.target.files[0]);
    }
  };

  const handleSolutionUpload = () => {
    if (!selectedEvent) return alert("กรุณาเลือกกิจกรรม");
    if (!solutionFile) return alert("กรุณาเลือกไฟล์ PDF");

    console.log("Uploading solution PDF for event:", selectedEvent, solutionFile);
    setUploadStatus("กำลังอัปโหลด...");

    // TODO: เรียก API อัปโหลดไฟล์
    setTimeout(() => {
      setUploadStatus("อัปโหลดสำเร็จ");
    }, 1500);
  };

  const handleExcelFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setExcelFile(e.target.files[0]);
      console.log("Selected Excel file:", e.target.files[0]);
    }
  };

  const handleExcelUpload = () => {
    if (!excelFile) return alert("กรุณาเลือกไฟล์ Excel");

    console.log("Uploading Excel file to update statuses:", excelFile);
    setExcelUploadStatus("กำลังอัปโหลด...");

    // TODO: เรียก API อัปโหลดและอัปเดตสถานะ
    setTimeout(() => {
      setExcelUploadStatus("อัปโหลดสำเร็จ");
    }, 1500);
  };

  const handleUpdateStatusToExamReady = (applicantId: string) => {
    console.log("Updating status to 'exam_ready' for applicant:", applicantId);
    // TODO: เรียก API อัปเดตสถานะ
    alert(`อัปเดตสถานะเป็น "รอสอบ" สำหรับผู้สมัคร ID: ${applicantId}`);
  };

  const handleCertFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      console.log("Uploading certificate file:", file);
      // TODO: เรียก API อัปโหลดใบประกาศเกียรติคุณ
      alert("อัปโหลดใบประกาศเกียรติคุณ (mock)");
    }
  };

  useEffect(() => {
    console.log("[AdminDashboard] Checking authentication...");

    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      console.warn("[AdminDashboard] No user found → redirect to /login");
      navigate("/login");
      return;
    }

    let user;
    try {
      user = JSON.parse(storedUser);
      console.log("[AdminDashboard] User data:", user);
    } catch (error) {
      console.error("[AdminDashboard] Failed to parse user:", error);
      localStorage.removeItem("user");
      navigate("/login");
      return;
    }

    if (user.role !== "admin") {
      console.warn("[AdminDashboard] Not admin → redirect to /landing");
      navigate("/landing");
    }
  }, [navigate]);

return (
    <>
      <Navbar/>
    <div className="p-6 space-y-10 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

      {/* [1] Upload Solution PDF */}
      <section className="border p-4 rounded shadow">
        <h2 className="font-semibold mb-3">1. Upload Solution PDF (เฉลยข้อสอบ)</h2>
        <select
          className="border p-2 rounded mr-4"
          value={selectedEvent}
          onChange={(e) => setSelectedEvent(e.target.value)}
        >
          <option value="">-- เลือกกิจกรรม --</option>
          <option value="event1">คณิตศาสตร์ ม.ต้น</option>
          <option value="event2">คณิตศาสตร์ ม.ปลาย</option>
        </select>
        <input type="file" accept="application/pdf" onChange={handleSolutionFileChange} />
        <button
          onClick={handleSolutionUpload}
          className="ml-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Upload
        </button>
        {uploadStatus && <p className="mt-2">{uploadStatus}</p>}
      </section>

      {/* [2] ตรวจสอบสลิปผู้สมัคร */}
      <section className="border p-4 rounded shadow">
        <h2 className="font-semibold mb-3">2. ตรวจสอบสลิปผู้สมัคร</h2>
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 p-2">ชื่อ-นามสกุล</th>
              <th className="border border-gray-300 p-2">กิจกรรม</th>
              <th className="border border-gray-300 p-2">สถานะ</th>
              <th className="border border-gray-300 p-2">สลิป</th>
              <th className="border border-gray-300 p-2">อัปเดตสถานะ</th>
            </tr>
          </thead>
          <tbody>
            {applicants.map((app) => (
              <tr key={app.id} className="hover:bg-gray-100">
                <td className="border border-gray-300 p-2">{app.fullname}</td>
                <td className="border border-gray-300 p-2">{app.event}</td>
                <td className="border border-gray-300 p-2">{app.status}</td>
                <td className="border border-gray-300 p-2">
                  {app.slipUrl ? (
                    <a href={app.slipUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                      ดูสลิป
                    </a>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="border border-gray-300 p-2">
                  <button
                    onClick={() => handleUpdateStatusToExamReady(app.id)}
                    className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                  >
                    Submit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* [3] Upload Excel */}
      <section className="border p-4 rounded shadow">
        <h2 className="font-semibold mb-3">3. Upload Excel อัปเดตสถานะ "completed"</h2>
        <input type="file" accept=".xls,.xlsx" onChange={handleExcelFileChange} />
        <button
          onClick={handleExcelUpload}
          className="ml-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Upload & Update Status
        </button>
        {excelUploadStatus && <p className="mt-2">{excelUploadStatus}</p>}
      </section>

      {/* [4] ใบประกาศเกียรติคุณ (Certificate) */}
      <section className="border p-4 rounded shadow">
        <h2 className="font-semibold mb-3">4. ใบประกาศเกียรติคุณ (Certificate)</h2>
        <input type="file" accept="application/pdf" onChange={handleCertFileUpload} />
        <table className="w-full border-collapse border border-gray-300 mt-4">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 p-2">ชื่อ-นามสกุล</th>
              <th className="border border-gray-300 p-2">กิจกรรม</th>
              <th className="border border-gray-300 p-2">ดาวน์โหลดใบ cert</th>
            </tr>
          </thead>
          <tbody>
            {certificateUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-100">
                <td className="border border-gray-300 p-2">{user.fullname}</td>
                <td className="border border-gray-300 p-2">{user.event}</td>
                <td className="border border-gray-300 p-2">
                  {user.certUrl ? (
                    <a href={user.certUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                      ดาวน์โหลด
                    </a>
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
    <Footer />
    </>
  );
};

export default AdminDashboard;
