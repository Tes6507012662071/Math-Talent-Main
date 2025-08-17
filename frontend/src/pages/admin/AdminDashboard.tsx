import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import axios from "axios";

interface Applicant {
  _id: string;
  userCode: string;
  fullname: string;
  email: string;
  status: string;
  slipUrl?: string;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [selectedTopic, setSelectedTopic] = useState("uploadPDF");

  const [selectedEvent, setSelectedEvent] = useState("");
  const [solutionFile, setSolutionFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [excelUploadStatus, setExcelUploadStatus] = useState("");

  const [events, setEvents] = useState<any[]>([]);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [eventName, setEventName] = useState("");

  // --- Fetch events ---
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        console.log("📌 Fetching events...");
        const res = await axios.get("http://localhost:5000/api/events", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        console.log("📌 Events fetched:", res.data);
        setEvents(res.data);
      } catch (err) {
        console.error("❌ Fetch events error:", err);
      }
    };
    fetchEvents();
  }, []);

  // --- Fetch applicants when event selected ---
  useEffect(() => {
    if (!selectedEvent) return;

    const fetchApplicants = async () => {
      try {
        console.log("📌 Selected event ID:", selectedEvent);

        const res = await axios.get(
          `http://localhost:5000/api/individual-registration/event/${selectedEvent}`,
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );

        console.log("📌 API response for applicants:", res.data);

        if (!res.data) console.warn("⚠️ Response data is empty");
        if (!res.data.applicants) console.warn("⚠️ Applicants field missing in response");

        setApplicants(res.data.applicants || []);
        setEventName(res.data.eventName || "");
        console.log("📌 Applicants state updated:", res.data.applicants);
      } catch (err) {
        console.error("❌ Fetch applicants error:", err);
      }
    };

    fetchApplicants();
  }, [selectedEvent]);

  // --- Update applicant status ---
  const handleUpdateStatusToExamReady = async (id: string) => {
    try {
      console.log("📌 Updating status for registration ID:", id);

      const res = await axios.patch(
        `http://localhost:5000/api/individual-registration/${id}/status`,
        { status: "examReady" },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      console.log("📌 Status update response:", res.data);

      const updated = res.data.registration;
      setApplicants((prev) =>
        prev.map((a) => (a._id === id ? updated : a))
      );
      console.log("📌 Applicants after update:", applicants);
    } catch (err) {
      console.error("❌ Update status error:", err);
    }
  };

  // --- Handlers for uploads ---
  const handleSolutionFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setSolutionFile(e.target.files[0]);
  };

  const handleSolutionUpload = async () => {
    if (!selectedEvent) return alert("กรุณาเลือกกิจกรรม");
    if (!solutionFile) return alert("กรุณาเลือกไฟล์ PDF");

    setUploadStatus("กำลังอัปโหลด...");
    try {
      const formData = new FormData();
      formData.append("eventId", selectedEvent);
      formData.append("file", solutionFile);

      console.log("📌 Uploading solution PDF with FormData:", formData);

      await axios.post(
        "http://localhost:5000/api/solutions/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setUploadStatus("อัปโหลดสำเร็จ ✅");
      console.log("📌 Solution PDF uploaded successfully");
    } catch (err) {
      console.error("❌ Solution upload error:", err);
      setUploadStatus("อัปโหลดล้มเหลว ❌");
    }
  };

  const handleExcelFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setExcelFile(e.target.files[0]);
  };

  const handleExcelUpload = () => {
    if (!excelFile) return alert("กรุณาเลือกไฟล์");
    setExcelUploadStatus("กำลังอัปโหลด...");
    setTimeout(() => {
      setExcelUploadStatus("อัปโหลดสำเร็จ");
      console.log("📌 Excel uploaded (mock)");
    }, 1500);
  };

  const handleCertFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) console.log("📌 Certificate file selected (mock)", e.target.files[0]);
  };

  // --- Auth check ---
  useEffect(() => {
    const checkAuth = async () => {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) return navigate("/login");
      try {
        const user = JSON.parse(storedUser);
        if (user.role !== "admin") navigate("/landing");
      } catch {
        localStorage.removeItem("user");
        navigate("/login");
      }
    };
    checkAuth();
  }, [navigate]);

  // --- Render content ---
  const renderContent = () => {
    switch (selectedTopic) {
      case "uploadPDF":
        return (
          <section>
            <h2 className="font-semibold mb-3">1. Upload Solution PDF (เฉลยข้อสอบ)</h2>
            <select
              className="border p-2 rounded mr-4"
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
            >
              <option value="">-- เลือกกิจกรรม --</option>
              {events.map((ev) => (
                <option key={ev._id} value={ev._id}>
                  {ev.title}
                </option>
              ))}
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
        );

      case "checkSlip":
        return (
          <section>
            <h2 className="font-semibold mb-3">2. ตรวจสอบสลิปผู้สมัคร</h2>
            <div className="mb-4">
              <label className="mr-2 font-medium">เลือกกิจกรรม:</label>
              <select
                className="border p-2 rounded"
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
              >
                <option value="">-- เลือกกิจกรรม --</option>
                {events.map((ev) => (
                  <option key={ev._id} value={ev._id}>
                    {ev.title}
                  </option>
                ))}
              </select>
            </div>

            {selectedEvent && applicants.length > 0 ? (
              <>
                <p className="font-medium mb-2">Event: {eventName}</p>
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="border p-2">รหัสผู้สมัคร</th>
                      <th className="border p-2">ชื่อ-นามสกุล</th>
                      <th className="border p-2">อีเมล</th>
                      <th className="border p-2">สถานะ</th>
                      <th className="border p-2">สลิป</th>
                      <th className="border p-2">อัปเดตสถานะ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applicants.map((app) => (
                      <tr key={app._id} className="hover:bg-gray-100">
                        <td className="border p-2">{app.userCode || "-"}</td>
                        <td className="border p-2">{app.fullname || "-"}</td>
                        <td className="border p-2">{app.email || "-"}</td>
                        <td className="border p-2">{app.status}</td>
                        <td className="border p-2">
                          {app.slipUrl ? (
                            app.slipUrl.endsWith(".pdf") ? (
                              <a href={app.slipUrl} target="_blank" rel="noreferrer">
                                ดูสลิป (PDF)
                              </a>
                            ) : (
                              <a href={app.slipUrl} target="_blank" rel="noreferrer">
                                <img src={app.slipUrl} alt="Slip" className="w-32 h-auto border" />
                              </a>
                            )
                          ) : "-"}
                        </td>
                        <td className="border p-2">
                          <button
                            onClick={() => handleUpdateStatusToExamReady(app._id)}
                            className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                          >
                            Submit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            ) : selectedEvent ? (
              <p className="text-gray-500">ไม่พบผู้สมัครในกิจกรรมนี้</p>
            ) : null}
          </section>
        );

      case "uploadExcel":
        return (
          <section>
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
        );

      case "certificate":
        return (
          <section>
            <h2 className="font-semibold mb-3">4. ใบประกาศเกียรติคุณ (Certificate)</h2>
            <input type="file" accept="application/pdf" onChange={handleCertFileUpload} />
          </section>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Navbar />
      <div className="p-6 flex space-x-6 max-w-6xl mx-auto">
        <aside className="w-64 border-r pr-4">
          <h2 className="text-lg font-bold mb-4">Menu</h2>
          <ul className="space-y-2">
            <li>
              <button
                className={`w-full text-left px-3 py-2 rounded ${
                  selectedTopic === "uploadPDF" ? "bg-blue-100 font-semibold" : "hover:bg-gray-100"
                }`}
                onClick={() => setSelectedTopic("uploadPDF")}
              >
                1. Upload Solution PDF
              </button>
            </li>
            <li>
              <button
                className={`w-full text-left px-3 py-2 rounded ${
                  selectedTopic === "checkSlip" ? "bg-blue-100 font-semibold" : "hover:bg-gray-100"
                }`}
                onClick={() => setSelectedTopic("checkSlip")}
              >
                2. ตรวจสอบสลิปผู้สมัคร
              </button>
            </li>
            <li>
              <button
                className={`w-full text-left px-3 py-2 rounded ${
                  selectedTopic === "uploadExcel" ? "bg-blue-100 font-semibold" : "hover:bg-gray-100"
                }`}
                onClick={() => setSelectedTopic("uploadExcel")}
              >
                3. Upload Excel
              </button>
            </li>
            <li>
              <button
                className={`w-full text-left px-3 py-2 rounded ${
                  selectedTopic === "certificate" ? "bg-blue-100 font-semibold" : "hover:bg-gray-100"
                }`}
                onClick={() => setSelectedTopic("certificate")}
              >
                4. ใบประกาศเกียรติคุณ
              </button>
            </li>
          </ul>
        </aside>
        <main className="flex-1">{renderContent()}</main>
      </div>
      <Footer />
    </>
  );
};

export default AdminDashboard;
