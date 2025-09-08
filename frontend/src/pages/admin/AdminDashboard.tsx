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

interface Event {
  _id: string;
  title: string;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [selectedTopic, setSelectedTopic] = useState("uploadPDF");

  // --- State แยกตามเมนู ---
  const [selectedEventUploadPDF, setSelectedEventUploadPDF] = useState("");
  const [selectedEventCheckSlip, setSelectedEventCheckSlip] = useState("");
  const [selectedEventUploadExcel, setSelectedEventUploadExcel] = useState("");
  const [selectedEventCertificate, setSelectedEventCertificate] = useState("");

  const [solutionFile, setSolutionFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [excelUploadStatus, setExcelUploadStatus] = useState("");
  const [events, setEvents] = useState<Event[]>([]);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [eventNameCheckSlip, setEventNameCheckSlip] = useState("");
  const [selectedSlipUrl, setSelectedSlipUrl] = useState<string | null>(null);
  const [selectedCertificateFiles, setSelectedCertificateFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [certificateUploadStatus, setCertificateUploadStatus] = useState("");
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loadingCertificates, setLoadingCertificates] = useState(false);
  


  // --- Fetch events ---
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/events", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setEvents(res.data);
      } catch (err) {
        console.error("❌ Fetch events error:", err);
      }
    };
    fetchEvents();
  }, []);

  // --- Fetch applicants for Check Slip ---
  useEffect(() => {
    if (!selectedEventCheckSlip) return;

    const fetchApplicants = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/individual-registration/event/${selectedEventCheckSlip}`,
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        setApplicants(res.data.applicants || []);
        setEventNameCheckSlip(res.data.eventName || "");
      } catch (err) {
        console.error("❌ Fetch applicants error:", err);
      }
    };
    fetchApplicants();
  }, [selectedEventCheckSlip]);

  // --- Update applicant status ---
  const handleUpdateStatusToExamReady = async (id: string) => {
    try {
      const res = await axios.patch(
        `http://localhost:5000/api/individual-registration/${id}/status`,
        { status: "examReady" },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      const updated = res.data.registration;
      setApplicants((prev) =>
        prev.map((a) => (a._id === id ? updated : a))
      );
    } catch (err) {
      console.error("❌ Update status error:", err);
    }
  };

  // --- Handlers for uploads ---
  const handleSolutionFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setSolutionFile(e.target.files[0]);
  };
  const handleSolutionUpload = async () => {
    if (!selectedEventUploadPDF) return alert("กรุณาเลือกกิจกรรม");
    if (!solutionFile) return alert("กรุณาเลือกไฟล์ PDF");

    setUploadStatus("กำลังอัปโหลด...");
    try {
      const formData = new FormData();
      formData.append("eventId", selectedEventUploadPDF);
      formData.append("file", solutionFile);

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
    } catch (err) {
      console.error("❌ Solution upload error:", err);
      setUploadStatus("อัปโหลดล้มเหลว ❌");
    }
  };

  const handleExcelFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setExcelFile(e.target.files[0]);
  };
  const handleExcelUpload = async () => {
    if (!selectedEventUploadExcel) return alert("กรุณาเลือกกิจกรรม");
    if (!excelFile) return alert("กรุณาเลือกไฟล์ Excel");

    setExcelUploadStatus("กำลังอัปโหลด...");
    try {
      const formData = new FormData();
      formData.append("eventId", selectedEventUploadExcel);
      formData.append("file", excelFile);

      const res = await axios.post(
        "http://localhost:5000/api/attendance/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setExcelUploadStatus(
        `✅ อัปเดตสำเร็จ ${res.data.updated} รายการ | ไม่พบ ${res.data.notFound.length} รายการ`
      );

      // Reload applicants for Check Slip (optional)
      if (selectedEventCheckSlip === selectedEventUploadExcel) {
        const refreshed = await axios.get(
          `http://localhost:5000/api/individual-registration/event/${selectedEventCheckSlip}`,
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );
        setApplicants(refreshed.data.applicants || []);
      }
    } catch (err) {
      console.error("❌ Excel upload error:", err);
      setExcelUploadStatus("❌ อัปโหลดล้มเหลว");
    }
  };

  const handleCertificateFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedCertificateFiles(Array.from(e.target.files));
      setUploadProgress({});
      setCertificateUploadStatus("");
    }
  };

  const handleUploadCertificates = async () => {
    if (!selectedCertificateFiles || selectedCertificateFiles.length === 0) {
      alert("กรุณาเลือกไฟล์ Certificate");
      return;
    }
    if (!selectedEventCertificate) {
      alert("กรุณาเลือกกิจกรรม");
      return;
    }

    const formData = new FormData();
    formData.append("eventId", selectedEventCertificate); // ✅ ส่ง eventId
    selectedCertificateFiles.forEach((file) => {
      formData.append("files", file);
    });

    try {
      setCertificateUploadStatus("กำลังอัปโหลด...");
      const token = localStorage.getItem("token");

      await axios.post(
        "http://localhost:5000/api/certificates/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setUploadProgress({ total: percent });
            }
          },
        }
      );

      setCertificateUploadStatus("✅ อัปโหลด Certificate สำเร็จ");
    } catch (error) {
      console.error("❌ Certificate upload error:", error);
      setCertificateUploadStatus("❌ อัปโหลดล้มเหลว");
    }
  };


  // --- Auth check ---
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
      return;
    }
    try {
      const user = JSON.parse(storedUser);
      if (user.role !== "admin") navigate("/landing");
    } catch {
      localStorage.removeItem("user");
      navigate("/login");
    }
  }, [navigate]);

  const fetchCertificates = async (eventId: string) => {
  try {
    setLoadingCertificates(true);
    const res = await axios.get(
      `http://localhost:5000/api/certificates/event/${eventId}`
    );
    setCertificates(res.data.data);
  } catch (error) {
    console.error("❌ Fetch certificates error:", error);
    setCertificates([]);
  } finally {
    setLoadingCertificates(false);
  }
};


  // --- Render content ---
  const renderContent = () => {
    switch (selectedTopic) {
      case "uploadPDF":
        return (
          <section>
            <h2 className="font-semibold mb-3">1. Upload Solution PDF (เฉลยข้อสอบ)</h2>
            <select
              className="border p-2 rounded mr-4"
              value={selectedEventUploadPDF}
              onChange={(e) => setSelectedEventUploadPDF(e.target.value)}
            >
              <option value="">-- Select Event --</option>
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
            <h2 className="font-semibold mb-3">2. Check Applicant Slip</h2>
            <select
              className="border p-2 rounded mb-4"
              value={selectedEventCheckSlip}
              onChange={(e) => setSelectedEventCheckSlip(e.target.value)}
            >
              <option value="">-- Select Event --</option>
              {events.map((ev) => (
                <option key={ev._id} value={ev._id}>
                  {ev.title}
                </option>
              ))}
            </select>

            {selectedEventCheckSlip && applicants.length > 0 ? (
              <>
                <p className="font-medium mb-2">Event: {eventNameCheckSlip}</p>
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
                              <button
                                className="text-blue-600 underline"
                                onClick={() => setSelectedSlipUrl(app.slipUrl ?? null)}
                              >
                                ดูสลิป (PDF)
                              </button>
                            ) : (
                              <img
                                src={app.slipUrl}
                                alt="Slip"
                                className="w-32 h-auto border cursor-pointer"
                                onClick={() => setSelectedSlipUrl(app.slipUrl ?? null)}
                              />
                            )
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
              </>
            ) : selectedEventCheckSlip ? (
              <p className="text-gray-500">ไม่พบผู้สมัครในกิจกรรมนี้</p>
            ) : null}

            {/* Modal แสดง slip */}
            {selectedSlipUrl && (
              <div
                className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
                onClick={() => setSelectedSlipUrl(null)}
              >
                <div
                  className="bg-white p-4 rounded-lg max-w-5xl max-h-[90vh] overflow-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  {selectedSlipUrl.endsWith(".pdf") ? (
                    <iframe
                      src={selectedSlipUrl}
                      className="w-[80vw] h-[80vh]"
                      title="Slip PDF"
                    />
                  ) : (
                    <img
                      src={selectedSlipUrl}
                      alt="Slip Full"
                      className="max-h-[80vh] max-w-[80vw] mx-auto"
                    />
                  )}
                  <button
                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded"
                    onClick={() => setSelectedSlipUrl(null)}
                  >
                    ปิด
                  </button>
                </div>
              </div>
            )}
          </section>
        );

      case "uploadExcel":
        return (
          <section>
            <h2 className="font-semibold mb-3">3. Upload Excel อัปเดตสถานะ "completed"</h2>
            <select
              className="border p-2 rounded mb-4"
              value={selectedEventUploadExcel}
              onChange={(e) => setSelectedEventUploadExcel(e.target.value)}
            >
              <option value="">-- Select Event --</option>
              {events.map((ev) => (
                <option key={ev._id} value={ev._id}>
                  {ev.title}
                </option>
              ))}
            </select>
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
            <h2 className="font-semibold mb-3">4. Certificate (Certificate)</h2>

            {/* เลือก Event */}
            <div className="mb-4">
              <label className="mr-2 font-medium">Select Event:</label>
              <select
                className="border p-2 rounded"
                value={selectedEventCertificate}
                onChange={(e) => {
                  setSelectedEventCertificate(e.target.value);
                  fetchCertificates(e.target.value);
                }}
              >
                <option value="">-- Select Event --</option>
                {events.map((ev) => (
                  <option key={ev._id} value={ev._id}>
                    {ev.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Input เลือกหลายไฟล์ */}
            <input
              type="file"
              accept="application/pdf"
              multiple
              onChange={handleCertificateFileChange}
              className="border p-2 rounded"
              disabled={!selectedEventCertificate}
            />

            {/* แสดงรายการไฟล์ที่เลือก */}
            {selectedCertificateFiles.length > 0 && (
              <div className="mt-4">
                <h3 className="font-medium mb-2">📄 ไฟล์ที่เลือก ({selectedCertificateFiles.length}):</h3>
                <ul className="space-y-2">
                  {selectedCertificateFiles.map((file, index) => (
                    <li key={index} className="flex items-center justify-between border p-2 rounded">
                      <span>{file.name}</span>
                      <span className="text-gray-500 text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* ปุ่มอัปโหลด */}
            <button
              onClick={handleUploadCertificates}
              disabled={!selectedEventCertificate || selectedCertificateFiles.length === 0}
              className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
            >
              Upload Certificates
            </button>

            {/* Progress Bar */}
            {Object.keys(uploadProgress).length > 0 && (
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-green-500 h-4 rounded-full"
                    style={{ width: `${uploadProgress.total || 0}%` }}
                  ></div>
                </div>
                <p className="text-sm mt-1">{uploadProgress.total || 0}%</p>
              </div>
            )}

            {certificateUploadStatus && <p className="mt-2 text-blue-600">{certificateUploadStatus}</p>}

            {/* รายชื่อผู้ที่มี Certificate แล้ว */}
            {selectedEventCertificate && (
              <div className="mt-6">
                <h3 className="font-medium mb-2">📄 รายชื่อผู้ที่มี Certificate แล้ว:</h3>

                {loadingCertificates ? (
                  <p className="text-gray-500">⏳ กำลังโหลด...</p>
                ) : certificates.length === 0 ? (
                  <p className="text-red-500">ยังไม่มีการอัปโหลด Certificate</p>
                ) : (
                  <ul className="space-y-2">
                    {certificates.map((cert) => (
                      <li
                        key={cert._id}
                        className="flex justify-between items-center border p-2 rounded"
                      >
                        <span>{cert.userCode}</span>
                        <a
                          href={`http://localhost:5000${cert.certificateUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline hover:text-blue-800"
                        >
                          Download
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
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
                2. Check Applicant Slip
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
                4. Certificate
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
