import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import axios from "axios";
import { fetchLandingContent, updateLandingContent, LandingData } from '../../api/landing';

const API_BASE_URL = process.env.REACT_APP_API_URL;

interface Applicant {
  id: string; 
  userCode: string;
  fullname: string;
  email: string;
  status: string;
  slipUrl?: string;
}

interface Station {
  stationName: string;
  address: string;
  capacity: number;
  code: number;
}

interface Event {
  id: string; 
  nameEvent: string;
  detail?: string;
  dateAndTime: string;
  location?: string;
  registrationType: 'individual' | 'school';
  stations: Station[];
  images?: string;
  levels?: string[];
}


const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [selectedTopic, setSelectedTopic] = useState("checkSlip");
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
  const [addEventForm, setAddEventForm] = useState({
    nameEvent: '', detail: '', dateAndTime: '', location: '',
    registrationType: 'individual' as 'individual' | 'school',
    stations: [{ stationName: '', address: '', capacity: 0, code: 1 }],
    levels: [''] 
  });
  const [eventImageFile, setEventImageFile] = useState<File | null>(null);
  const [addEventStatus, setAddEventStatus] = useState('');
  const [addSurveyTitle, setAddSurveyTitle] = useState("แบบสอบถามหลังสอบ");
  const [addQuestions, setAddQuestions] = useState<{ question: string; type: string; options?: string[] }[]>([
    { question: "", type: "text" }
  ]);
  const [addSurveyActive, setAddSurveyActive] = useState(true);
  const [landingData, setLandingData] = useState<LandingData>({
    historyTitle: '', historyContent: '', objectiveTitle: '', objectives: ['']
  });
  const [loadingLanding, setLoadingLanding] = useState(false);
  const [savingLanding, setSavingLanding] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [editEventForm, setEditEventForm] = useState({
    nameEvent: '', detail: '', dateAndTime: '', location: '',
    registrationType: 'individual' as 'individual' | 'school',
    stations: [] as { stationName: string; address: string; capacity: number; code: number; }[],
    levels: [] as string[]
  });
  const [surveyTitle, setSurveyTitle] = useState("แบบสอบถามหลังสอบ");
  const [questions, setQuestions] = useState<{ question: string; type: string; options?: string[] }[]>([
    { question: "", type: "text" }
  ]);
  const [surveyActive, setSurveyActive] = useState(false);
  const [editStatus, setEditStatus] = useState("");
  const addQuestionToAdd = () => setAddQuestions([...addQuestions, { question: "", type: "text" }]);
  const removeQuestionFromAdd = (index: number) => setAddQuestions(addQuestions.filter((_, i) => i !== index));
  const updateAddQuestion = (index: number, field: string, value: any) => {
    const newQuestions = [...addQuestions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setAddQuestions(newQuestions);
  };
  const addQuestion = () => setQuestions([...questions, { question: "", type: "text" }]);
  const removeQuestion = (index: number) => setQuestions(questions.filter((_, i) => i !== index));
  const updateQuestion = (index: number, field: string, value: any) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setQuestions(newQuestions);
  };

  const saveSurvey = async (eventId: string, surveyData: any, token: string) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/survey/${eventId}`, surveyData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error: any) {
       console.error("Save survey helper failed:", error);
       throw error;
    }
  };

  const handleSaveSurvey = async () => {
    const token = localStorage.getItem("token");
    if (!token || !selectedEventId) return;
    try {
      setEditStatus("กำลังบันทึกแบบสอบถาม...");
      await saveSurvey(selectedEventId, { title: surveyTitle, questions, isActive: surveyActive }, token);
      setEditStatus("✅ บันทึกแบบสอบถามสำเร็จ!");
      setTimeout(() => setEditStatus(""), 2000);
    } catch (err) {
      setEditStatus("❌ บันทึกล้มเหลว");
    }
  };

  useEffect(() => {
    if (!selectedEventId) return;
    const loadEventData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const eventRes = await axios.get<Event>(`${API_BASE_URL}/api/events/${selectedEventId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const event = eventRes.data;
        setEditEventForm({
          nameEvent: event.nameEvent,
          detail: event.detail || '',
          dateAndTime: event.dateAndTime ? new Date(event.dateAndTime).toISOString().slice(0, 16) : '',
          location: event.location || '',
          registrationType: event.registrationType,
          stations: event.stations?.map(s => ({ stationName: s.stationName, address: s.address, capacity: s.capacity, code: s.code })) || [],
          levels: event.levels || [] 
        });
        try {
          const surveyRes = await axios.get(`${API_BASE_URL}/api/survey/${selectedEventId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const survey = surveyRes.data;
          setSurveyTitle(survey?.title || "แบบสอบถามหลังสอบ");
          setQuestions(survey?.questions || [{ question: "", type: "text" }]);
          setSurveyActive(survey?.isActive || false);
        } catch (surveyErr: any) {
          if (surveyErr.response?.status === 404) {
            setSurveyTitle("แบบสอบถามหลังสอบ"); setQuestions([{ question: "", type: "text" }]); setSurveyActive(false);
          } else { console.error("Error loading survey:", surveyErr); }
        }
      } catch (err) {
        console.error("Error loading event data:", err);
        alert("ไม่สามารถโหลดข้อมูลกิจกรรมนี้ได้ (อาจเกิดจาก ID ไม่ถูกต้อง หรือ Server มีปัญหา)");
        setSelectedEventId("");
      }
    };
    loadEventData();
  }, [selectedEventId]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) { console.warn("Token not found, cannot fetch events."); return; }
        const res = await axios.get(`${API_BASE_URL}/api/events`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEvents(res.data);
      } catch (err) { console.error("❌ Fetch events error:", err); }
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    if (selectedTopic !== "editLanding") return;
    const loadLanding = async () => {
      try {
        setLoadingLanding(true); const data = await fetchLandingContent(); setLandingData(data);
      } catch (err) { console.error("โหลดข้อมูล Landing ไม่ได้:", err); alert("โหลดข้อมูลไม่ได้"); }
      finally { setLoadingLanding(false); }
    };
    loadLanding();
  }, [selectedTopic]);

  useEffect(() => {
    if (!selectedEventCheckSlip) return;
    const fetchApplicants = async () => {
      try {
        const token = localStorage.getItem("token"); if (!token) return;
        const res = await axios.get(`${API_BASE_URL}/api/individual-registration/event/${selectedEventCheckSlip}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setApplicants(res.data.applicants || []);
        setEventNameCheckSlip(res.data.eventName || "");
      } catch (err) { console.error("❌ Fetch applicants error:", err); }
    };
    fetchApplicants();
  }, [selectedEventCheckSlip]);

  const handleUpdateStatusToExamReady = async (applicantId: string) => {
    try {
      const token = localStorage.getItem("token"); if (!token) return;
      const res = await axios.patch(`${API_BASE_URL}/api/individual-registration/${applicantId}/status`,
        { status: "exam_ready" }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updatedApplicant = res.data.registration;
      setApplicants(prev => prev.map(a => (a.id === applicantId ? { ...a, status: updatedApplicant.status } : a)));
    } catch (err) { console.error("❌ Update status error:", err); alert("อัปเดตสถานะไม่สำเร็จ"); }
  };

  const handleSolutionFileChange = (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files) setSolutionFile(e.target.files[0]); };
  const handleSolutionUpload = async () => {
    if (!selectedEventUploadPDF) return alert("กรุณาเลือกกิจกรรม");
    if (!solutionFile) return alert("กรุณาเลือกไฟล์ PDF");
    setUploadStatus("กำลังอัปโหลด...");
    try {
      const formData = new FormData(); formData.append("eventId", selectedEventUploadPDF); formData.append("file", solutionFile);
      const token = localStorage.getItem("token");
      await axios.post(`${API_BASE_URL}/api/solutions/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
      });
      setUploadStatus("อัปโหลดสำเร็จ ✅");
    } catch (err) { console.error("❌ Solution upload error:", err); setUploadStatus("อัปโหลดล้มเหลว ❌"); }
  };

  const handleExcelFileChange = (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files) setExcelFile(e.target.files[0]); };
  const handleExcelUpload = async () => {
    if (!selectedEventUploadExcel) return alert("กรุณาเลือกกิจกรรม");
    if (!excelFile) return alert("กรุณาเลือกไฟล์ Excel");
    setExcelUploadStatus("กำลังอัปโหลด...");
    try {
      const formData = new FormData(); formData.append("eventId", selectedEventUploadExcel); formData.append("file", excelFile);
      const token = localStorage.getItem("token");
      const res = await axios.post(`${API_BASE_URL}/api/attendance/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
      });
      setExcelUploadStatus(`✅ อัปเดตสำเร็จ ${res.data.updated} รายการ | ไม่พบ ${Array.isArray(res.data.notFound) ? res.data.notFound.length : '?'} รายการ`);
      if (selectedEventCheckSlip === selectedEventUploadExcel) {
         if (!token) return;
         const refreshed = await axios.get(`${API_BASE_URL}/api/individual-registration/event/${selectedEventCheckSlip}`, { headers: { Authorization: `Bearer ${token}` } });
         setApplicants(refreshed.data.applicants || []);
      }
    } catch (err) { console.error("❌ Excel upload error:", err); setExcelUploadStatus("❌ อัปโหลดล้มเหลว"); }
  };

  const handleCertificateFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) { setSelectedCertificateFiles(Array.from(e.target.files)); setUploadProgress({}); setCertificateUploadStatus(""); }
  };
  const handleUploadCertificates = async () => {
    if (!selectedCertificateFiles || selectedCertificateFiles.length === 0) { alert("กรุณาเลือกไฟล์ Certificate"); return; }
    if (!selectedEventCertificate) { alert("กรุณาเลือกกิจกรรม"); return; }
    const formData = new FormData(); formData.append("eventId", selectedEventCertificate);
    selectedCertificateFiles.forEach((file) => { formData.append("files", file); });
    try {
      setCertificateUploadStatus("กำลังอัปโหลด..."); const token = localStorage.getItem("token");
      await axios.post(`${API_BASE_URL}/api/certificates/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress({ total: percent });
          }
        },
      });
      setCertificateUploadStatus("✅ อัปโหลด Certificate สำเร็จ"); fetchCertificates(selectedEventCertificate);
    } catch (error) { console.error("❌ Certificate upload error:", error); setCertificateUploadStatus("❌ อัปโหลดล้มเหลว"); }
  };

  const handleLandingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => { const { name, value } = e.target; setLandingData(prev => ({ ...prev, [name]: value })); };
  const handleObjectiveChange = (index: number, value: string) => { const newObjectives = [...landingData.objectives]; newObjectives[index] = value; setLandingData(prev => ({ ...prev, objectives: newObjectives })); };
  const addObjective = () => { setLandingData(prev => ({ ...prev, objectives: [...prev.objectives, ''] })); };
  const removeObjective = (index: number) => { if (landingData.objectives.length <= 1) return; const newObjectives = landingData.objectives.filter((_, i) => i !== index); setLandingData(prev => ({ ...prev, objectives: newObjectives })); };
  const saveLandingContent = async () => {
    try { const token = localStorage.getItem("token"); if (!token) return; setSavingLanding(true); await updateLandingContent(landingData, token); alert("✅ บันทึกข้อมูลสำเร็จ!"); }
    catch (err: any) { console.error("บันทึกไม่สำเร็จ:", err); alert(err.message || "บันทึกไม่สำเร็จ"); }
    finally { setSavingLanding(false); }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user"); if (!storedUser) { navigate("/login"); return; }
    try { const user = JSON.parse(storedUser); if (user.role !== "admin") navigate("/landing"); }
    catch { localStorage.removeItem("user"); localStorage.removeItem("token"); navigate("/login"); }
  }, [navigate]);

  const fetchCertificates = async (eventId: string) => {
    if (!eventId) return; try { setLoadingCertificates(true); const token = localStorage.getItem("token"); if (!token) return;
      const res = await axios.get(`${API_BASE_URL}/api/certificates/event/${eventId}`, { headers: { Authorization: `Bearer ${token}` } });
      setCertificates(res.data.data || []);
    } catch (error) { console.error("❌ Fetch certificates error:", error); setCertificates([]); }
    finally { setLoadingCertificates(false); }
  };

  const handleAddEventChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => { const { name, value } = e.target; setAddEventForm(prev => ({ ...prev, [name]: value })); };
  const handleStationChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target; const newStations = [...addEventForm.stations];
    newStations[index] = { ...newStations[index], [name]: (name === 'capacity' || name === 'code') ? parseInt(value) || 0 : value };
    setAddEventForm(prev => ({ ...prev, stations: newStations }));
  };
  const handleLevelChange = (index: number, value: string) => {
    const newLevels = [...addEventForm.levels];
    newLevels[index] = value;
    setAddEventForm(prev => ({ ...prev, levels: newLevels }));
  };
  const addLevel = () => { setAddEventForm(prev => ({ ...prev, levels: [...prev.levels, ''] })); };
  const removeLevel = (index: number) => {
    if (addEventForm.levels.length <= 1) return;
    setAddEventForm(prev => ({ ...prev, levels: prev.levels.filter((_, i) => i !== index) }));
  };
  const addStation = () => { setAddEventForm(prev => ({ ...prev, stations: [...prev.stations, { stationName: '', address: '', capacity: 0, code: prev.stations.length + 1 }] })); };
  const removeStation = (index: number) => { const newStations = addEventForm.stations.filter((_, i) => i !== index); setAddEventForm(prev => ({ ...prev, stations: newStations.map((s, i) => ({ ...s, code: i + 1 })) })); };
  const handleAddEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setAddEventStatus('กำลังสร้างเหตุการณ์และแบบสอบถาม...');
    try {
      const token = localStorage.getItem('token'); if (!token) throw new Error('ไม่พบ token');
      const validQuestions = addQuestions.filter(q => q.question.trim() !== '');
      if (validQuestions.length === 0) { setAddEventStatus('❌ กรุณาเพิ่มคำถามอย่างน้อย 1 ข้อ'); return; }
      const formData = new FormData(); formData.append('nameEvent', addEventForm.nameEvent);
      if (addEventForm.detail) formData.append('detail', addEventForm.detail);
      formData.append('dateAndTime', new Date(addEventForm.dateAndTime).toISOString());
      if (addEventForm.location) formData.append('location', addEventForm.location);
      formData.append('registrationType', addEventForm.registrationType);
      formData.append('stations', JSON.stringify(addEventForm.stations));
      formData.append('levels', JSON.stringify(addEventForm.levels.filter(l => l.trim() !== ''))); 
      if (eventImageFile) { formData.append('image', eventImageFile); }
      const eventRes = await axios.post(`${API_BASE_URL}/api/events`, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      const newEventId = eventRes.data.newEvent.id; 
      await saveSurvey(newEventId, { title: addSurveyTitle, questions: validQuestions, isActive: addSurveyActive }, token);
      setAddEventForm({ nameEvent: '', detail: '', dateAndTime: '', location: '', registrationType: 'individual', stations: [{ stationName: '', address: '', capacity: 0, code: 1 }], levels: [''] });
      setEventImageFile(null); setAddSurveyTitle("แบบสอบถามหลังสอบ"); setAddQuestions([{ question: "", type: "text" }]); setAddSurveyActive(true);
      setAddEventStatus('✅ สร้างเหตุการณ์และแบบสอบถามสำเร็จ!');
      const eventsRes = await axios.get(`${API_BASE_URL}/api/events`, { headers: { Authorization: `Bearer ${token}` } });
      setEvents(eventsRes.data); setTimeout(() => setAddEventStatus(''), 3000);
    } catch (err: any) { console.error('❌ Add event error:', err); setAddEventStatus(`❌ สร้างล้มเหลว: ${err.response?.data?.message || err.message || 'ไม่ทราบสาเหตุ'}`); }
  };

 const handleSaveAll = async () => {
   const token = localStorage.getItem("token"); if (!token || !selectedEventId) return;
   try {
     setEditStatus("กำลังบันทึก...");
     const formData = new FormData(); 
     formData.append('nameEvent', editEventForm.nameEvent);
     if (editEventForm.detail) formData.append('detail', editEventForm.detail);
     formData.append('dateAndTime', new Date(editEventForm.dateAndTime).toISOString());
     if (editEventForm.location) formData.append('location', editEventForm.location);
     formData.append('registrationType', editEventForm.registrationType);
     formData.append('stations', JSON.stringify(editEventForm.stations));
     formData.append('levels', JSON.stringify(editEventForm.levels.filter(l => l.trim() !== ''))); 
     await axios.patch(`${API_BASE_URL}/api/events/${selectedEventId}`, formData, {
       headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
     });
     await saveSurvey(selectedEventId, { title: surveyTitle, questions, isActive: surveyActive }, token);
     setEditStatus("✅ บันทึกทุกอย่างสำเร็จ!"); setTimeout(() => setEditStatus(""), 2000);
   } catch (err: any) { console.error("บันทึกล้มเหลว:", err); const msg = err.response?.data?.message || err.message || "ไม่ทราบสาเหตุ"; setEditStatus(`❌ บันทึกล้มเหลว: ${msg}`); }
 };

  const renderContent = () => {
    switch (selectedTopic) {
      case "uploadPDF":
        return (
          <section>
            <h2 className="font-semibold mb-3">1. อัพโหลดเฉลยข้อสอบ</h2>
            <select className="border p-2 rounded mr-4" value={selectedEventUploadPDF} onChange={(e) => setSelectedEventUploadPDF(e.target.value)}>
              <option value="">-- เลือกกิจกรรม--</option>
              {events.map((ev) => ( <option key={ev.id} value={ev.id}>{ev.nameEvent}</option> ))}
            </select>
            <input type="file" accept="application/pdf" onChange={handleSolutionFileChange} />
            <button onClick={handleSolutionUpload} className="ml-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">อัพโหลด</button>
            {uploadStatus && <p className="mt-2">{uploadStatus}</p>}
          </section>
        );

      case "checkSlip":
        const pendingApplicants = applicants.filter(app => app.status === "slip_uploaded");
        const approvedApplicants = applicants.filter(app => app.status === "exam_ready");
        return (
          <section>
            <h2 className="font-semibold mb-3">2. ตรวจสอบสลิปผู้สมัคร</h2>
            <select className="border p-2 rounded mb-4" value={selectedEventCheckSlip} onChange={(e) => setSelectedEventCheckSlip(e.target.value)}>
              <option value="">-- เลือกกิจกรรม --</option>
              {events.map((ev) => ( <option key={ev.id} value={ev.id}>{ev.nameEvent}</option> ))}
            </select>

            {selectedEventCheckSlip && (
              <button
                type="button"
                onClick={async () => {
                  const token = localStorage.getItem('token');
                  if (!token) return;
                  try {
                    const res = await axios.get(
                      `${API_BASE_URL}/api/export/applicants/${selectedEventCheckSlip}`,
                      { 
                        headers: { Authorization: `Bearer ${token}` },
                        responseType: 'blob'
                      }
                    );
                    const url = window.URL.createObjectURL(new Blob([res.data]));
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', `applicants_export_${selectedEventCheckSlip}.xlsx`);
                    document.body.appendChild(link);
                    link.click();
                    link.remove();
                  } catch (err: any) {
                    console.error("Export failed:", err);
                    const errorText = await (err.response?.data as Blob)?.text();
                    const errorJson = JSON.parse(errorText || '{}');
                    alert("Export ล้มเหลว: " + (errorJson.message || err.message));
                  }
                }}
                className="ml-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-medium"
              >
                📤 Export รายชื่อ (Excel)
              </button>
            )}

            {selectedEventCheckSlip && (applicants.length > 0 || pendingApplicants.length > 0) ? (
              <>
                <p className="font-medium mb-4 mt-4">Event: {eventNameCheckSlip}</p>
                <div className="mb-8">
                  <h3 className="font-semibold mb-2 text-lg">รอตรวจสอบสลิป ({pendingApplicants.length})</h3>
                  {pendingApplicants.length > 0 ? (
                    <table className="w-full border-collapse border border-gray-300">
                      <thead><tr className="bg-gray-200"><th className="border p-2">รหัสผู้สมัคร</th><th className="border p-2">ชื่อ-นามสกุล</th><th className="border p-2">อีเมล</th><th className="border p-2">สถานะ</th><th className="border p-2">สลิป</th><th className="border p-2">อัปเดตสถานะ</th></tr></thead>
                      <tbody>
                        {pendingApplicants.map((app) => (
                          <tr key={app.id} className="hover:bg-gray-100">
                            <td className="border p-2">{app.userCode || "-"}</td> <td className="border p-2">{app.fullname || "-"}</td> <td className="border p-2">{app.email || "-"}</td>
                            <td className="border p-2"><span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm">{app.status}</span></td>
                            <td className="border p-2">
                              {app.slipUrl ? ( app.slipUrl.endsWith(".pdf") ? (
                                <button className="text-blue-600 underline" onClick={() => { const fullUrl = app.slipUrl ? `${API_BASE_URL}${app.slipUrl}` : null; setSelectedSlipUrl(fullUrl); }}> ดูสลิป (PDF) </button>
                              ) : (
                                <img src={`${API_BASE_URL}${app.slipUrl}`} alt="Slip" className="w-32 h-auto border cursor-pointer" onClick={() => { const fullUrl = app.slipUrl ? `${API_BASE_URL}${app.slipUrl}` : null; setSelectedSlipUrl(fullUrl); }} />
                              )) : ("-")}
                            </td>
                            <td className="border p-2"><button onClick={() => handleUpdateStatusToExamReady(app.id)} className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">อนุมัติ</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (<p className="text-gray-500">ไม่มีสลิปที่รอตรวจสอบ</p>)}
                </div>
                <div>
                  <h3 className="font-semibold mb-2 text-lg">ผู้สมัครที่อนุมัติแล้ว ({approvedApplicants.length})</h3>
                  {approvedApplicants.length > 0 ? (
                    <table className="w-full border-collapse border border-gray-300">
                      <thead><tr className="bg-green-100"><th className="border p-2">รหัสผู้สมัคร</th><th className="border p-2">ชื่อ-นามสกุล</th><th className="border p-2">อีเมล</th><th className="border p-2">สถานะ</th><th className="border p-2">สลิป</th></tr></thead>
                      <tbody>
                        {approvedApplicants.map((app) => (
                          <tr key={app.id} className="hover:bg-gray-100">
                            <td className="border p-2">{app.userCode || "-"}</td> <td className="border p-2">{app.fullname || "-"}</td> <td className="border p-2">{app.email || "-"}</td>
                            <td className="border p-2"><span className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">{app.status}</span></td>
                            <td className="border p-2">
                              {app.slipUrl ? ( app.slipUrl.endsWith(".pdf") ? (
                                <button className="text-blue-600 underline" onClick={() => { const fullUrl = app.slipUrl ? `${API_BASE_URL}${app.slipUrl}` : null; setSelectedSlipUrl(fullUrl); }}>ดูสลิป (PDF)</button>
                              ) : (
                                <img src={`${API_BASE_URL}${app.slipUrl}`} alt="Slip" className="w-32 h-auto border cursor-pointer" onClick={() => { const fullUrl = app.slipUrl ? `${API_BASE_URL}${app.slipUrl}` : null; setSelectedSlipUrl(fullUrl); }} />
                              )) : ("-")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (<p className="text-gray-500">ยังไม่มีผู้สมัครที่ได้รับการอนุมัติ (สถานะ "exam_ready")</p>)}
                </div>
              </>
            ) : selectedEventCheckSlip ? (<p className="text-gray-500">ไม่พบผู้สมัครในกิจกรรมนี้</p>) : null}
            {selectedSlipUrl && (
              <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50" onClick={() => setSelectedSlipUrl(null)}>
                <div className="bg-white p-4 rounded-lg max-w-5xl max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
                  {selectedSlipUrl.endsWith(".pdf") ? (
                    <iframe src={selectedSlipUrl} className="w-[80vw] h-[80vh]" title="Slip PDF" />
                  ) : (
                    <img src={selectedSlipUrl} alt="Slip Full" className="max-h-[80vh] max-w-[80vw] mx-auto" />
                  )}
                  <button className="mt-4 px-4 py-2 bg-red-600 text-white rounded" onClick={() => setSelectedSlipUrl(null)}>ปิด</button>
                </div>
              </div>
            )}
          </section>
        );

      case "uploadExcel":
        return (
          <section>
            <h2 className="font-semibold mb-3">3. อัพโหลดไฟล์รายชื่อผู้เข้าสอบ</h2>
            <select className="border p-2 rounded mb-4" value={selectedEventUploadExcel} onChange={(e) => setSelectedEventUploadExcel(e.target.value)}>
              <option value="">-- เลือกกิจกรรม --</option>
              {events.map((ev) => ( <option key={ev.id} value={ev.id}>{ev.nameEvent}</option> ))}
            </select>
            <input type="file" accept=".xls,.xlsx" onChange={handleExcelFileChange} />
            <button onClick={handleExcelUpload} className="ml-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">อัพโหลด และ อัพเดตสถานะ</button>
            {excelUploadStatus && <p className="mt-2">{excelUploadStatus}</p>}
          </section>
        );

      case "certificate":
        return (
          <section>
            <h2 className="font-semibold mb-3">4. อัพโหลดใบประกาศนียบัตร</h2>
            <div className="mb-4">
              <label className="mr-2 font-medium">เลือกกิจกรรม:</label>
              <select className="border p-2 rounded" value={selectedEventCertificate} onChange={(e) => { setSelectedEventCertificate(e.target.value); fetchCertificates(e.target.value); }}>
                <option value="">-- เลือกกิจกรรม--</option>
                {events.map((ev) => ( <option key={ev.id} value={ev.id}>{ev.nameEvent}</option> ))}
              </select>
            </div>
            <input type="file" accept="application/pdf" multiple onChange={handleCertificateFileChange} className="border p-2 rounded" disabled={!selectedEventCertificate} />
            {selectedCertificateFiles.length > 0 && (
              <div className="mt-4">
                <h3 className="font-medium mb-2">📄 ไฟล์ที่เลือก ({selectedCertificateFiles.length}):</h3>
                <ul className="space-y-2">
                  {selectedCertificateFiles.map((file, index) => ( <li key={index} className="flex items-center justify-between border p-2 rounded"><span>{file.name}</span><span className="text-gray-500 text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</span></li> ))}
                </ul>
              </div>
            )}
            <button onClick={handleUploadCertificates} disabled={!selectedEventCertificate || selectedCertificateFiles.length === 0} className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400">อัพโหลด Certificate</button>
            {Object.keys(uploadProgress).length > 0 && (
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-4"><div className="bg-green-500 h-4 rounded-full" style={{ width: `${uploadProgress.total || 0}%` }}></div></div>
                <p className="text-sm mt-1">{uploadProgress.total || 0}%</p>
              </div>
            )}
            {certificateUploadStatus && <p className="mt-2 text-blue-600">{certificateUploadStatus}</p>}
            {selectedEventCertificate && (
              <div className="mt-6">
                <h3 className="font-medium mb-2">📄 รายชื่อผู้ที่มี Certificate แล้ว:</h3>
                {loadingCertificates ? (<p className="text-gray-500">⏳ กำลังโหลด...</p>) : certificates.length === 0 ? (<p className="text-red-500">ยังไม่มีการอัปโหลด Certificate</p>) : (
                  <ul className="space-y-2">
                    {certificates.map((cert) => (
                      <li key={cert.id} className="flex justify-between items-center border p-2 rounded">
                        <span>{cert.userCode}</span>
                        <a href={`${API_BASE_URL}${cert.certificateUrl}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">Download</a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </section>
        );

      case "editLanding":
        return (
          <section>
            <h2 className="font-semibold mb-6 text-2xl">🖊️ แก้ไขหน้าหลัก</h2>
            {loadingLanding ? (<div className="text-xl text-gray-500">กำลังโหลดข้อมูล...</div>) : (
              <div className="space-y-8">
                <div><label className="block text-lg font-medium text-gray-700 mb-3">หัวข้อประวัติและความเป็นมา</label><input type="text" name="historyTitle" value={landingData.historyTitle} onChange={handleLandingChange} className="w-full p-4 text-lg border border-gray-300 rounded-xl focus:ring-3 focus:ring-blue-500 focus:border-blue-500" required /></div>
                <div><label className="block text-lg font-medium text-gray-700 mb-3">เนื้อหาประวัติและความเป็นมา</label><textarea name="historyContent" value={landingData.historyContent} onChange={handleLandingChange} rows={12} className="w-full p-4 text-base border border-gray-300 rounded-xl focus:ring-3 focus:ring-blue-500 focus:border-blue-500 resize-vertical" required /></div>
                <div><label className="block text-lg font-medium text-gray-700 mb-3">หัวข้อวัตถุประสงค์</label><input type="text" name="objectiveTitle" value={landingData.objectiveTitle} onChange={handleLandingChange} className="w-full p-4 text-lg border border-gray-300 rounded-xl focus:ring-3 focus:ring-blue-500 focus:border-blue-500" required /></div>
                <div>
                  <div className="flex justify-between items-center mb-4"><label className="block text-lg font-medium text-gray-700">รายการวัตถุประสงค์</label><button type="button" onClick={addObjective} className="text-lg bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg font-medium">+ เพิ่มรายการ</button></div>
                  <div className="space-y-4">
                    {landingData.objectives.map((obj, index) => (
                      <div key={index} className="flex gap-3 items-start">
                        <input type="text" value={obj} onChange={e => handleObjectiveChange(index, e.target.value)} className="flex-1 p-4 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500" required />
                        <button type="button" onClick={() => removeObjective(index)} className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg font-medium disabled:opacity-50" disabled={landingData.objectives.length <= 1}>ลบ</button>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="pt-4"><button onClick={saveLandingContent} disabled={savingLanding} className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-4 rounded-xl font-bold disabled:opacity-50 transition">{savingLanding ? 'กำลังบันทึก...' : '💾 บันทึกการเปลี่ยนแปลง'}</button></div>
              </div>
            )}
          </section>
        );

      case "addEvent":
        return (
          <section>
            <h2 className="font-semibold mb-6 text-2xl">➕ เพิ่มเหตุการณ์ใหม่</h2>
            {addEventStatus && (<div className={`mb-4 p-3 rounded ${addEventStatus.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{addEventStatus}</div>)}
            <form onSubmit={handleAddEventSubmit} className="space-y-6">
              <div><label className="block mb-2 font-medium">ชื่อเหตุการณ์ *</label><input type="text" name="nameEvent" value={addEventForm.nameEvent} onChange={handleAddEventChange} className="w-full p-2 border rounded" required /></div>
              <div><label className="block mb-2 font-medium">รายละเอียด</label><textarea name="detail" value={addEventForm.detail} onChange={handleAddEventChange} className="w-full p-2 border rounded" rows={3} /></div>
              <div><label className="block mb-2 font-medium">วันที่และเวลาสอบ *</label><input type="datetime-local" name="dateAndTime" value={addEventForm.dateAndTime} onChange={handleAddEventChange} className="w-full p-2 border rounded" required /></div>
              <div><label className="block mb-2 font-medium">สถานที่หลัก (จังหวัด/เขต)</label><input type="text" name="location" value={addEventForm.location} onChange={handleAddEventChange} className="w-full p-2 border rounded" /></div>
              <div><label className="block mb-2 font-medium">รูปภาพเหตุการณ์</label><input type="file" accept="image/*" onChange={(e) => setEventImageFile(e.target.files?.[0] || null)} className="w-full p-2 border rounded" />{eventImageFile && (<div className="mt-2 text-sm text-gray-600">📎 {eventImageFile.name} ({(eventImageFile.size / 1024 / 1024).toFixed(2)} MB)</div>)}</div>
              <div><label className="block mb-2 font-medium">ประเภทการสมัคร</label><select name="registrationType" value={addEventForm.registrationType} onChange={handleAddEventChange} className="w-full p-2 border rounded"><option value="individual">บุคคลทั่วไป</option><option value="school">โรงเรียน</option></select></div>
              
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-medium">📚 ระดับชั้นที่เปิดสอบ</h3>
                  <button
                    type="button"
                    onClick={addLevel}
                    className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                  >
                    + เพิ่มระดับ
                  </button>
                </div>
                <div className="space-y-2">
                  {addEventForm.levels.map((level, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="เช่น ประถมศึกษาตอนปลาย"
                        value={level}
                        onChange={(e) => handleLevelChange(index, e.target.value)}
                        className="w-full p-2 border rounded"
                      />
                      {addEventForm.levels.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLevel(index)}
                          className="bg-red-500 text-white px-3 rounded hover:bg-red-600"
                        >
                          ลบ
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-3"><h3 className="font-medium">📍 ศูนย์สอบ</h3><button type="button" onClick={addStation} className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">+ เพิ่มศูนย์สอบ</button></div>
                {addEventForm.stations.map((station, index) => (
                  <div key={index} className="border p-4 mb-4 rounded bg-gray-50">
                    <div className="flex justify-between items-start mb-2"><span className="font-medium">ศูนย์สอบ {index + 1}</span>{addEventForm.stations.length > 1 && (<button type="button" onClick={() => removeStation(index)} className="text-red-600 hover:text-red-800">ลบ</button>)}</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div><label className="block mb-1 text-sm">ชื่อศูนย์สอบ *</label><input type="text" name="stationName" value={station.stationName} onChange={(e) => handleStationChange(index, e)} className="w-full p-2 border rounded" required /></div>
                      <div><label className="block mb-1 text-sm">ที่อยู่ *</label><input type="text" name="address" value={station.address} onChange={(e) => handleStationChange(index, e)} className="w-full p-2 border rounded" required /></div>
                      <div><label className="block mb-1 text-sm">ความจุ (คน) *</label><input type="number" name="capacity" value={station.capacity} onChange={(e) => handleStationChange(index, e)} min="0" className="w-full p-2 border rounded" required /></div>
                      <div><label className="block mb-1 text-sm">รหัสศูนย์</label><input type="number" name="code" value={station.code} onChange={(e) => handleStationChange(index, e)} className="w-full p-2 border rounded" /></div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border rounded bg-blue-50">
                <h3 className="text-xl font-semibold mb-4">📋 แบบสอบถามหลังสอบ (จำเป็น)</h3>
                <div className="mb-4"><label className="block mb-2 font-medium">หัวข้อแบบสอบถาม *</label><input type="text" value={addSurveyTitle} onChange={(e) => setAddSurveyTitle(e.target.value)} className="w-full p-2 border rounded" placeholder="เช่น แบบสอบถามความพึงพอใจ" required /></div>
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-3"><span className="font-medium">คำถาม * (ต้องมีอย่างน้อย 1 ข้อ)</span><button type="button" onClick={addQuestionToAdd} className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">+ เพิ่มคำถาม</button></div>
                  {addQuestions.map((q, idx) => (
                    <div key={idx} className="border p-3 mb-3 rounded bg-white">
                      <div className="flex justify-between items-start mb-2"><span className="text-sm font-medium text-gray-700">คำถามที่ {idx + 1} *</span>{addQuestions.length > 1 && (<button type="button" onClick={() => removeQuestionFromAdd(idx)} className="text-red-600 hover:text-red-800 text-sm">ลบ</button>)}</div>
                      <input type="text" placeholder="พิมพ์คำถาม..." value={q.question} onChange={(e) => updateAddQuestion(idx, 'question', e.target.value)} className="w-full p-2 mb-2 border rounded" required />
                      <div className="mb-2"><label className="block text-sm mb-1">ประเภทคำตอบ</label><select value={q.type} onChange={(e) => updateAddQuestion(idx, 'type', e.target.value)} className="w-full p-2 border rounded"><option value="text">ข้อความ</option><option value="radio">ตัวเลือกเดียว</option><option value="checkbox">หลายตัวเลือก</option></select></div>
                      {q.type !== 'text' && (
                        <div><label className="block text-sm mb-1">ตัวเลือก (คั่นด้วยเครื่องหมายจุลภาค)</label><input type="text" placeholder="เช่น มาก, ปานกลาง, น้อย" value={q.options?.join(', ') || ''} onChange={(e) => updateAddQuestion(idx, 'options', e.target.value.split(',').map(o => o.trim()).filter(o => o))} className="w-full p-2 border rounded" />{q.options && q.options.length > 0 && (<div className="mt-2 text-xs text-gray-600">ตัวอย่าง: {q.options.join(' | ')}</div>)}</div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex items-center p-3 bg-white rounded border"><input type="checkbox" id="isActiveAdd" checked={addSurveyActive} onChange={(e) => setAddSurveyActive(e.target.checked)} className="mr-2 w-4 h-4" /><label htmlFor="isActiveAdd" className="cursor-pointer">เปิดให้ผู้สมัครกรอกแบบสอบถามหลังสอบทันที</label></div>
              </div>
              <div className="pt-4"><button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded font-medium">📥 สร้างเหตุการณ์และแบบสอบถาม</button></div>
            </form>
          </section>
        );

      case "editEvent":
        return (
          <section>
            <h2 className="text-2xl font-bold mb-6">✏️ แก้ไขกิจกรรมและแบบสอบถาม</h2>
            <div className="mb-6"><label className="block mb-2 font-medium">เลือกกิจกรรมที่ต้องการแก้ไข</label><select value={selectedEventId} onChange={(e) => setSelectedEventId(e.target.value)} className="w-full p-2 border rounded"><option value="">-- เลือกกิจกรรม --</option>{events.map(ev => ( <option key={ev.id} value={ev.id}>{ev.nameEvent}</option> ))}</select></div>
            {selectedEventId && (
              <>
                {editStatus && (<div className={`mb-4 p-3 rounded ${editStatus.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{editStatus}</div>)}
                <div className="mb-8 p-4 border rounded bg-gray-50">
                  <h3 className="text-xl font-semibold mb-4">แก้ไขข้อมูลกิจกรรม</h3>
                  <div className="space-y-4">
                    <div><label className="block mb-1">ชื่อกิจกรรม</label><input type="text" value={editEventForm.nameEvent} onChange={(e) => setEditEventForm(prev => ({ ...prev, nameEvent: e.target.value }))} className="w-full p-2 border rounded" /></div>
                    <div><label className="block mb-1">รายละเอียด</label><textarea value={editEventForm.detail} onChange={(e) => setEditEventForm(prev => ({ ...prev, detail: e.target.value }))} className="w-full p-2 border rounded" rows={3} /></div>
                    <div><label className="block mb-1">วันที่และเวลา</label><input type="datetime-local" value={editEventForm.dateAndTime} onChange={(e) => setEditEventForm(prev => ({ ...prev, dateAndTime: e.target.value }))} className="w-full p-2 border rounded" /></div>
                    <div><label className="block mb-1">สถานที่</label><input type="text" value={editEventForm.location} onChange={(e) => setEditEventForm(prev => ({ ...prev, location: e.target.value }))} className="w-full p-2 border rounded" /></div>
                    <div><label className="block mb-1">ประเภทการสมัคร</label><select value={editEventForm.registrationType} onChange={(e) => setEditEventForm(prev => ({ ...prev, registrationType: e.target.value as 'individual' | 'school' }))} className="w-full p-2 border rounded"><option value="individual">บุคคลทั่วไป</option><option value="school">โรงเรียน</option></select></div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-medium">📚 ระดับชั้นที่เปิดสอบ</h4>
                        <button
                          type="button"
                          onClick={() => setEditEventForm(prev => ({
                            ...prev, levels: [...(prev.levels || []), '']
                          }))}
                          className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                        >
                          + เพิ่มระดับ
                        </button>
                      </div>
                      <div className="space-y-2">
                        {editEventForm.levels.map((level, index) => (
                          <div key={index} className="flex gap-2">
                            <input
                              type="text"
                              placeholder="เช่น ประถมศึกษาตอนปลาย"
                              value={level}
                              onChange={(e) => {
                                const newLevels = [...editEventForm.levels];
                                newLevels[index] = e.target.value;
                                setEditEventForm(prev => ({ ...prev, levels: newLevels }));
                              }}
                              className="w-full p-2 border rounded"
                            />
                            {editEventForm.levels.length > 1 && (
                              <button
                                type="button"
                                onClick={() => setEditEventForm(prev => ({
                                  ...prev,
                                  levels: prev.levels.filter((_, i) => i !== index)
                                }))}
                                className="bg-red-500 text-white px-3 rounded hover:bg-red-600"
                              >
                                ลบ
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2"><h4 className="font-medium">ศูนย์สอบ</h4><button type="button" onClick={() => { setEditEventForm(prev => ({ ...prev, stations: [...prev.stations, { stationName: '', address: '', capacity: 0, code: prev.stations.length + 1 }] })); }} className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">+ เพิ่มศูนย์สอบ</button></div>
                      {editEventForm.stations.map((station, index) => (
                        <div key={index} className="border p-3 mb-3 rounded bg-white">
                          <div className="flex justify-between items-start mb-2"><span className="text-sm font-medium">ศูนย์สอบ {index + 1}</span>{editEventForm.stations.length > 1 && (<button type="button" onClick={() => { const newStations = editEventForm.stations.filter((_, i) => i !== index); setEditEventForm(prev => ({ ...prev, stations: newStations.map((s, i) => ({ ...s, code: i + 1 })) })); }} className="text-red-600 hover:text-red-800 text-sm">ลบ</button>)}</div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div><label className="block text-sm mb-1">ชื่อศูนย์สอบ</label><input type="text" value={station.stationName} onChange={(e) => { const newStations = [...editEventForm.stations]; newStations[index] = { ...newStations[index], stationName: e.target.value }; setEditEventForm(prev => ({ ...prev, stations: newStations })); }} className="w-full p-2 border rounded" /></div>
                            <div><label className="block text-sm mb-1">ที่อยู่</label><input type="text" value={station.address} onChange={(e) => { const newStations = [...editEventForm.stations]; newStations[index] = { ...newStations[index], address: e.target.value }; setEditEventForm(prev => ({ ...prev, stations: newStations })); }} className="w-full p-2 border rounded" /></div>
                            <div><label className="block text-sm mb-1">ความจุ</label><input type="number" value={station.capacity} onChange={(e) => { const newStations = [...editEventForm.stations]; newStations[index] = { ...newStations[index], capacity: Number(e.target.value) }; setEditEventForm(prev => ({ ...prev, stations: newStations })); }} min="0" className="w-full p-2 border rounded" /></div>
                            <div><label className="block text-sm mb-1">รหัสศูนย์</label><input type="number" value={station.code} className="w-full p-2 border rounded bg-gray-200" readOnly /></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="p-4 border rounded bg-blue-50">
                  <h3 className="text-xl font-semibold mb-4">📋 แบบสอบถามหลังสอบ</h3>
                  <div className="mb-4"><label className="block mb-2 font-medium">หัวข้อแบบสอบถาม</label><input type="text" value={surveyTitle} onChange={(e) => setSurveyTitle(e.target.value)} className="w-full p-2 border rounded" placeholder="เช่น แบบสอบถามความพึงพอใจ" /></div>
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-3"><span className="font-medium">คำถาม</span><button type="button" onClick={addQuestion} className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">+ เพิ่มคำถาม</button></div>
                    {questions.length === 0 && (<div className="text-gray-500 text-sm p-3 bg-white rounded border border-dashed">ยังไม่มีคำถาม คลิกปุ่ม "+ เพิ่มคำถาม" เพื่อเริ่มสร้างแบบสอบถาม</div>)}
                    {questions.map((q, idx) => (
                      <div key={idx} className="border p-3 mb-3 rounded bg-white">
                        <div className="flex justify-between items-start mb-2"><span className="text-sm font-medium text-gray-700">คำถามที่ {idx + 1}</span><button type="button" onClick={() => removeQuestion(idx)} className="text-red-600 hover:text-red-800 text-sm">ลบ</button></div>
                        <input type="text" placeholder="พิมพ์คำถาม..." value={q.question} onChange={(e) => updateQuestion(idx, 'question', e.target.value)} className="w-full p-2 mb-2 border rounded" />
                        <div className="mb-2"><label className="block text-sm mb-1">ประเภทคำตอบ</label><select value={q.type} onChange={(e) => updateQuestion(idx, 'type', e.target.value)} className="w-full p-2 border rounded"><option value="text">ข้อความ</option><option value="radio">ตัวเลือกเดียว</option><option value="checkbox">หลายตัวเลือก</option></select></div>
                        {q.type !== 'text' && (
                          <div><label className="block text-sm mb-1">ตัวเลือก (คั่นด้วยเครื่องหมายจุลภาค)</label><input type="text" placeholder="เช่น มาก, ปานกลาง, น้อย" value={q.options?.join(', ') || ''} onChange={(e) => updateQuestion(idx, 'options', e.target.value.split(',').map(o => o.trim()).filter(o => o))} className="w-full p-2 border rounded" />{q.options && q.options.length > 0 && (<div className="mt-2 text-xs text-gray-600">ตัวอย่าง: {q.options.join(' | ')}</div>)}</div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center p-3 bg-white rounded border mb-4"><input type="checkbox" id="isActiveEdit" checked={surveyActive} onChange={(e) => setSurveyActive(e.target.checked)} className="mr-2 w-4 h-4" /><label htmlFor="isActiveEdit" className="cursor-pointer">เปิดให้ผู้สมัครกรอกแบบสอบถามหลังสอบ</label></div>
                  <div className="flex gap-3 pt-4 border-t mt-4">
                    <button
                      onClick={handleSaveAll}
                      className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 font-medium"
                    >
                      💾 บันทึกทั้งหมด
                    </button>
                    <button
                      onClick={handleSaveSurvey}
                      className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 font-medium"
                    >
                      📋 บันทึกเฉพาะแบบสอบถาม
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        const token = localStorage.getItem('token');
                        if (!token) return;
                        try {
                          setEditStatus("กำลัง Export...");
                          const res = await axios.get(
                            `${API_BASE_URL}/api/export/survey/${selectedEventId}`,
                            { 
                              headers: { Authorization: `Bearer ${token}` },
                              responseType: 'blob'
                            }
                          );
                          const url = window.URL.createObjectURL(new Blob([res.data]));
                          const link = document.createElement('a');
                          link.href = url;
                          link.setAttribute('download', `survey_export_${selectedEventId}.xlsx`);
                          document.body.appendChild(link);
                          link.click();
                          link.remove();
                          setEditStatus("Export สำเร็จ!");
                        } catch (err: any) {
                          console.error("Export failed:", err);
                          try {
                            const errorText = await (err.response?.data as Blob)?.text();
                            const errorJson = JSON.parse(errorText || '{}');
                            setEditStatus(`❌ Export ล้มเหลว: ${errorJson.message || 'ไม่พบข้อมูล Survey'}`);
                          } catch (parseError) {
                             setEditStatus(`❌ Export ล้มเหลว: ${err.message || 'ไม่ทราบสาเหตุ'}`);
                          }
                        }
                      }}
                      className="bg-gray-700 text-white px-6 py-2 rounded hover:bg-gray-800 font-medium ml-auto"
                    >
                      📤 Export Survey (Excel)
                    </button>
                  </div>
                </div>
              </>
            )}
          </section>
        );

      default: return null;
    }
  };

  return (
    <>
      <Navbar />
      <div className="p-6 flex space-x-6 max-w-6xl mx-auto">
        <aside className="w-64 border-r pr-4">
          <h2 className="text-lg font-bold mb-4">รายการ</h2>
          <ul className="space-y-2">
            <li><button className={`w-full text-left px-3 py-2 rounded ${selectedTopic === "uploadPDF" ? "bg-blue-100 font-semibold" : "hover:bg-gray-100"}`} onClick={() => setSelectedTopic("uploadPDF")}>1. อัพโหลดเฉลยข้อสอบ</button></li>
            <li><button className={`w-full text-left px-3 py-2 rounded ${selectedTopic === "checkSlip" ? "bg-blue-100 font-semibold" : "hover:bg-gray-100"}`} onClick={() => setSelectedTopic("checkSlip")}>2. ตรวจสอบสลิปผู้สมัคร</button></li>
            <li><button className={`w-full text-left px-3 py-2 rounded ${selectedTopic === "uploadExcel" ? "bg-blue-100 font-semibold" : "hover:bg-gray-100"}`} onClick={() => setSelectedTopic("uploadExcel")}>3. อัพโหลดไฟล์รายชื่อผู้เข้าสอบ (.xlsx)</button></li>
            <li><button className={`w-full text-left px-3 py-2 rounded ${selectedTopic === "certificate" ? "bg-blue-100 font-semibold" : "hover:bg-gray-100"}`} onClick={() => setSelectedTopic("certificate")}>4. อัพโหลดใบประกาศนียบัตร</button></li>
            <li><button className={`w-full text-left px-3 py-2 rounded ${selectedTopic === "editLanding" ? "bg-blue-100 font-semibold" : "hover:bg-gray-100"}`} onClick={() => setSelectedTopic("editLanding")}>5. แก้ไขหน้าหลัก</button></li>
            <li><button className={`w-full text-left px-3 py-2 rounded ${selectedTopic === "addEvent" ? "bg-blue-100 font-semibold" : "hover:bg-gray-100"}`} onClick={() => setSelectedTopic("addEvent")}>6. เพิ่มกิจกรรม</button></li>
            <li><button className={`w-full text-left px-3 py-2 rounded ${selectedTopic === "editEvent" ? "bg-blue-100 font-semibold" : "hover:bg-gray-100"}`} onClick={() => setSelectedTopic("editEvent")}>7. แก้ไขกิจกรรมและแบบสอบถาม</button></li>
          </ul>
        </aside>
        <main className="flex-1">{renderContent()}</main>
      </div>
      <Footer />
    </>
  );
};

export default AdminDashboard;