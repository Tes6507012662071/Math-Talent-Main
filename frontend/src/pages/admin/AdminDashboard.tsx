import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [selectedTopic, setSelectedTopic] = useState("uploadPDF");

  // --- existing states & mock data (keep as-is) ---
  const [selectedEvent, setSelectedEvent] = useState("");
  const [solutionFile, setSolutionFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [excelUploadStatus, setExcelUploadStatus] = useState("");

  const [events, setEvents] = useState<any[]>([]);
  const [applicants, setApplicants] = useState<any[]>([]);

  // Fetch events on load
  useEffect(() => {
    const fetchEvents = async () => {
      const res = await fetch("http://localhost:5000/api/events"); // adjust to your event.routes
      const data = await res.json();
      setEvents(data);
    };
    fetchEvents();
  }, []);

  // Fetch slips when event selected
  useEffect(() => {
    if (!selectedEvent) return;
    const fetchSlips = async () => {
      const res = await fetch(`http://localhost:5000/api/slips/event/${selectedEvent}`);
      const data = await res.json();
      setApplicants(data);
    };
    fetchSlips();
  }, [selectedEvent]);

  // Update slip status
  const handleUpdateStatusToExamReady = async (id: string) => {
    await fetch(`http://localhost:5000/api/slips/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "exam_ready" }),
    });
    // refresh list
    setApplicants((prev) =>
      prev.map((a) => (a._id === id ? { ...a, status: "exam_ready" } : a))
    );
  };

  const certificateUsers = [
    { id: "1", fullname: "สมชาย ใจดี", event: "คณิตศาสตร์ ม.ต้น", certUrl: "http://example.com/cert1.pdf" },
    { id: "3", fullname: "สมปอง แข็งแรง", event: "คณิตศาสตร์ ม.ปลาย", certUrl: null },
  ];

  // --- handlers (same as before, shortened here) ---
  const handleSolutionFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setSolutionFile(e.target.files[0]);
  };
  const handleSolutionUpload = async () => {
    if (!selectedEvent) {
      alert("กรุณาเลือกกิจกรรม");
      return;
    }
    if (!solutionFile) {
      alert("กรุณาเลือกไฟล์ PDF");
      return;
    }

    setUploadStatus("กำลังอัปโหลด...");

    try {
      const formData = new FormData();
      formData.append("eventId", selectedEvent);
      formData.append("file", solutionFile);

      const response = await fetch("http://localhost:5000/api/solutions/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const result = await response.json();
      console.log("Uploaded:", result);

      // Example: API returns { success: true, fileUrl: "http://..." }
      setUploadStatus("อัปโหลดสำเร็จ ✅");
    } catch (error) {
      console.error("Upload error:", error);
      setUploadStatus("อัปโหลดล้มเหลว ❌");
    }
  };
  const handleExcelFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setExcelFile(e.target.files[0]);
  };
  const handleExcelUpload = () => {
    if (!excelFile) return alert("กรุณาเลือกไฟล์");
    setExcelUploadStatus("กำลังอัปโหลด...");
    setTimeout(() => setExcelUploadStatus("อัปโหลดสำเร็จ"), 1500);
  };
  // Removed duplicate handleUpdateStatusToExamReady to fix redeclaration error
  const handleCertFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) alert("อัปโหลดใบประกาศเกียรติคุณ (mock)");
  };

  // --- auth check ---
  useEffect(() => {
  const checkAuth = async () => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
      return;
    }

    try {
      const user = JSON.parse(storedUser);
      if (user.role !== "admin") {
        navigate("/landing");
      }
    } catch (err) {
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  checkAuth();
}, [navigate]);

  // --- render content for right side ---
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
        );
        case "checkSlip":
          return (
            <section>
              <h2 className="font-semibold mb-3">2. ตรวจสอบสลิปผู้สมัคร</h2>

              {/* Select Event */}
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
                      {ev.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Show candidates */}
              {selectedEvent && applicants.length > 0 ? (
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="border p-2">ชื่อ-นามสกุล</th>
                      <th className="border p-2">สถานะ</th>
                      <th className="border p-2">สลิป</th>
                      <th className="border p-2">อัปเดตสถานะ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applicants.map((app) => (
                      <tr key={app._id} className="hover:bg-gray-100">
                        <td className="border p-2">{app.fullname}</td>
                        <td className="border p-2">{app.status}</td>
                        <td className="border p-2">
                          {app.slipUrl ? (
                            <a href={app.slipUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                              ดูสลิป
                            </a>
                          ) : (
                            "-"
                          )}
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
              ) : (
                selectedEvent && <p className="text-gray-500">ไม่พบผู้สมัครในกิจกรรมนี้</p>
              )}
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
            <table className="w-full border-collapse border border-gray-300 mt-4">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border p-2">ชื่อ-นามสกุล</th>
                  <th className="border p-2">กิจกรรม</th>
                  <th className="border p-2">ดาวน์โหลดใบ cert</th>
                </tr>
              </thead>
              <tbody>
                {certificateUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-100">
                    <td className="border p-2">{u.fullname}</td>
                    <td className="border p-2">{u.event}</td>
                    <td className="border p-2">
                      {u.certUrl ? (
                        <a href={u.certUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                          ดาวน์โหลด
                        </a>
                      ) : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
        {/* Left menu */}
        <aside className="w-64 border-r pr-4">
          <h2 className="text-lg font-bold mb-4">Menu</h2>
          <ul className="space-y-2">
            <li>
              <button
                className={`w-full text-left px-3 py-2 rounded ${selectedTopic === "uploadPDF" ? "bg-blue-100 font-semibold" : "hover:bg-gray-100"}`}
                onClick={() => setSelectedTopic("uploadPDF")}
              >
                1. Upload Solution PDF
              </button>
            </li>
            <li>
              <button
                className={`w-full text-left px-3 py-2 rounded ${selectedTopic === "checkSlip" ? "bg-blue-100 font-semibold" : "hover:bg-gray-100"}`}
                onClick={() => setSelectedTopic("checkSlip")}
              >
                2. ตรวจสอบสลิปผู้สมัคร
              </button>
            </li>
            <li>
              <button
                className={`w-full text-left px-3 py-2 rounded ${selectedTopic === "uploadExcel" ? "bg-blue-100 font-semibold" : "hover:bg-gray-100"}`}
                onClick={() => setSelectedTopic("uploadExcel")}
              >
                3. Upload Excel
              </button>
            </li>
            <li>
              <button
                className={`w-full text-left px-3 py-2 rounded ${selectedTopic === "certificate" ? "bg-blue-100 font-semibold" : "hover:bg-gray-100"}`}
                onClick={() => setSelectedTopic("certificate")}
              >
                4. ใบประกาศเกียรติคุณ
              </button>
            </li>
          </ul>
        </aside>

        {/* Right content */}
        <main className="flex-1">{renderContent()}</main>
      </div>
      <Footer />
    </>
  );
};

export default AdminDashboard;
