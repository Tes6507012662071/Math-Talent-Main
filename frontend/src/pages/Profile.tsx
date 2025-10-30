import React, { useEffect, useState } from "react";
import axios from "axios";
import { User, Upload, Download, LogOut, Edit, Save, X, FileText, Award, Settings, Home, TrendingUp, CheckCircle } from 'lucide-react';
import { fetchUserProfile } from "../api/auth";
import { getMyRegisteredEvents, uploadPaymentSlip } from "../api/registration";
import { fetchSurvey, submitSurveyResponse } from "../api/survey";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
// 1. ✅ Import Type ที่ถูกต้องจาก /types/event
import { Event as EventType, Station } from "../types/event"; 

// 2. ✅ ใช้ REACT_APP_API_URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// 3. ✅ แก้ไข Interface นี้ให้ใช้ Type ที่ถูกต้อง
interface EventStatus {
  id: string; // ‼️ ใช้ id
  userCode: string;
  // ✅ ใช้ EventType ที่ Import มา
  event: EventType; 
  status: string;
  slipUrl?: string;
  certificateUrl?: string;
  registrationId?: string;
  fullname?: string;
  grade?: string;
  school?: string;
  phone?: string;
  email?: string;
  note?: string;
}

interface SurveyQuestion {
  question: string;
  type: 'text' | 'radio' | 'checkbox';
  options?: string[];
}

interface Survey {
  id: string; // ‼️ ใช้ id
  eventId: string;
  title: string;
  questions: SurveyQuestion[];
  isActive: boolean;
}

const Profile: React.FC = () => {
  // ... (State ส่วนใหญ่เหมือนเดิม)
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [events, setEvents] = useState<EventStatus[]>([]); // ✅ ใช้ EventStatus
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<{ [registrationId: string]: File | null }>({});
  const [uploading, setUploading] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<{ [key: string]: number }>({});
  const [showSurveyModal, setShowSurveyModal] = useState(false);
  const [currentSurvey, setCurrentSurvey] = useState<Survey | null>(null);
  const [surveyAnswers, setSurveyAnswers] = useState<{ [key: number]: string | string[] }>({});
  const [pendingDownload, setPendingDownload] = useState<{ eventId: string; userCode: string } | null>(null);
  const [surveySubmitting, setSurveySubmitting] = useState(false);
  const [userProfile, setUserProfile] = useState({ name: '', email: '', phone: '', department: '', position: '', joinDate: '', bio: '' });
  const [editedProfile, setEditedProfile] = useState(userProfile);

  // ✅ SIMPLIFIED: Single function to fetch data
  const fetchRegistrations = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");
      
      const registrations = await getMyRegisteredEvents(token); 
      console.log("✅ Fetched registrations:", registrations);
      setEvents(registrations);
    } catch (err) {
      console.error("❌ Failed to fetch registrations:", err);
      throw err;
    }
  };

  // ✅ SIMPLIFIED: Load data using single API
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("ไม่พบ token ใน localStorage"); setLoading(false); return;
    }
    Promise.all([
      fetchUserProfile(token),
      fetchRegistrations(),
    ])
      .then(([userData]) => {
        setUser(userData);
        setUserProfile({
          name: (userData as any).name || '',
          email: (userData as any).email || '',
          phone: (userData as any).phone || '',
          department: (userData as any).department || '',
          position: (userData as any).position || '',
          joinDate: (userData as any).joinDate || '',
          bio: (userData as any).bio || ''
        });
      })
      .catch((err) => {
        console.error("❌ เกิด error ขณะโหลดข้อมูล:", err);
        if ((err as any).response?.status === 401) {
          localStorage.removeItem("token");
          alert("Session หมดอายุ กรุณาเข้าสู่ระบบใหม่");
        } else {
          // (ไม่ต้อง Alert Error 404 ของ fetchRegistrations ที่นี่)
        }
      })
      .finally(() => setLoading(false));
  }, []);


  // Update editedProfile when userProfile changes
  useEffect(() => {
    setEditedProfile(userProfile);
  }, [userProfile]);

  // ✅ Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, registrationId: string) => {
    const file = e.target.files?.[0] || null;
    setSelectedFiles((prev) => ({ ...prev, [registrationId]: file }));
  };

  // ✅ SIMPLIFIED: Handle slip upload
  const handleSlipSubmit = async (registrationId: string) => {
    const file = selectedFiles[registrationId];
    if (!file) return alert("กรุณาเลือกไฟล์ก่อน");
    try {
      setUploading(true);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");
      console.log("🔄 Uploading slip for registration:", registrationId);
      await uploadPaymentSlip(token, registrationId, file);
      alert("✅ อัปโหลดสลิปสำเร็จ");
      setSelectedFiles((prev) => ({ ...prev, [registrationId]: null }));
      setShowSuccessPopup(true);
      setTimeout(() => setShowSuccessPopup(false), 3000);
      await fetchRegistrations(); // Refresh ข้อมูล
    } catch (err) {
      console.error("❌ Upload slip failed:", err);
      alert("❌ อัปโหลดสลิปไม่สำเร็จ");
    } finally {
      setUploading(false);
    }
  };

  // helper แปลงสถานะ
  const getStatusText = (status: string) => {
    switch (status) {
      case "registered": return "ลงทะเบียนแล้ว - รออัปโหลดสลิป";
      case "slip_uploaded": return "รอตรวจสอบสลิป";
      case "verified": return "สลิปผ่านการยืนยัน";
      case "exam_ready": return "พร้อมสอบ";
      case "completed": return "สำเร็จแล้ว";
      default: return status;
    }
  };

  // Helper function to safely get event title
  const getEventTitle = (eventData?: EventType): string => {
    if (!eventData) return 'Untitled Event';
    return eventData.nameEvent || 'Untitled Event'; // ‼️ ใช้ nameEvent
  };

  const getEventDate = (dateInput?: string | Date): string => {
    if (!dateInput) return 'ยังไม่ระบุวันที่';
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) return 'รูปแบบวันที่ไม่ถูกต้อง';
    return date.toLocaleDateString('th-TH', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  // ✅ New function to handle certificate download with survey
  const handleCertificateDownloadClick = async (eventId: string, userCode: string) => {
    console.log("🔍 [Step 1] Certificate download triggered");
    try {
      const surveyData = await fetchSurvey(eventId);
      console.log("📊 [Step 2] Fetched survey data:", surveyData);
      
      if (surveyData && surveyData.isActive) {
        console.log("✅ Survey exists and is active → showing modal");
        setCurrentSurvey(surveyData);
        setPendingDownload({ eventId, userCode });
        setSurveyAnswers({});
        setShowSurveyModal(true);
      } else {
        console.log("⚠️ No active survey → downloading certificate directly");
        await downloadCertificate(eventId, userCode);
      }
    } catch (error) {
      console.error("❌ [Error] Failed to fetch survey:", error);
      console.log("➡️ Proceeding to download certificate anyway...");
      await downloadCertificate(eventId, userCode);
    }
  };

  // ✅ Function to actually download certificate
  const downloadCertificate = async (eventId: string, userCode: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");
      setDownloadProgress((prev) => ({ ...prev, [userCode]: 0 }));

      const res = await axios.get(
        `${API_BASE_URL}/api/certificates/download/${eventId}/${userCode}`, 
        {
          responseType: "blob",
          headers: { Authorization: `Bearer ${token}` },
          onDownloadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setDownloadProgress((prev) => ({ ...prev, [userCode]: percent }));
            }
          },
        }
      );

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${userCode}_Certificate.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setDownloadProgress((prev) => ({ ...prev, [userCode]: 100 }));
    } catch (error: any) {
      console.error("❌ Download certificate error:", error);
      alert(error.response?.data?.message || "เกิดข้อผิดพลาดในการดาวน์โหลด");
      setDownloadProgress((prev) => ({ ...prev, [userCode]: 0 }));
    }
  };

  // ✅ Handle survey submission
  const handleSurveySubmit = async () => {
    console.log("📤 [Step 3] Survey submission started");
    if (!currentSurvey || !pendingDownload) {
      console.error("❌ Missing currentSurvey or pendingDownload"); return;
    }
    
    if (!currentSurvey.id) {
      alert("ข้อมูลแบบสอบถามไม่สมบูรณ์ กรุณาลองใหม่"); return;
    }

    // ตรวจสอบว่าตอบครบทุกข้อ
    const unanswered = currentSurvey.questions.some((_, i) => {
      const ans = surveyAnswers[i];
      return !ans || (Array.isArray(ans) && ans.length === 0) || ans === '';
    });
    if (unanswered) {
      alert('กรุณาตอบคำถามให้ครบทุกข้อ');
      return;
    }

    try {
      setSurveySubmitting(true);
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token");

      // ‼️ [แก้ไข] แปลง Array (Checkbox) เป็น JSON String ก่อนส่ง ‼️
      const answersArray = currentSurvey.questions.map((q, index) => {
        const rawAnswer = surveyAnswers[index];
        return {
          questionIndex: index,
          question: q.question,
          // ✅ ถ้าคำตอบเป็น Array ให้ JSON.stringify()
          answer: Array.isArray(rawAnswer) ? JSON.stringify(rawAnswer) : rawAnswer
        };
      });

      console.log("📦 [Step 4] Submitting with:", {
        eventId: pendingDownload.eventId,
        surveyId: currentSurvey.id,
        userCode: pendingDownload.userCode,
        answers: answersArray // 👈 ใช้ Array ที่แปลงแล้ว
      });

      await submitSurveyResponse(
        pendingDownload.eventId,
        currentSurvey.id, 
        answersArray,
        pendingDownload.userCode,
        token
      );
      
      console.log("✅ [Step 5] Survey submitted successfully!");

      // ปิด modal และดาวน์โหลด
      setShowSurveyModal(false);
      await downloadCertificate(pendingDownload.eventId, pendingDownload.userCode);
      setCurrentSurvey(null); setPendingDownload(null); setSurveyAnswers({});
    } catch (error: any) {
      console.error("❌ Survey submission error:", error);
      const msg = error.response?.data?.message || "ส่งแบบสอบถามไม่สำเร็จ";
      alert(msg);
    } finally {
      setSurveySubmitting(false);
    }
  };

  // ✅ Handle survey answer change
  const handleSurveyAnswerChange = (questionIndex: number, value: string | string[]) => {
    setSurveyAnswers((prev) => ({ ...prev, [questionIndex]: value }));
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const handleProfileSave = () => { setIsEditing(false); setUserProfile(editedProfile); /* TODO: API call */ };
  const handleProfileCancel = () => { setIsEditing(false); setEditedProfile(userProfile); };

  if (loading) return <div className="p-8 text-center">⏳ กำลังโหลดข้อมูล...</div>;
  if (!user) return <div className="p-8 text-center">⚠ ไม่พบข้อมูลผู้ใช้</div>;

  console.log("✅ Current events state:", events);

  // Dashboard Tab
  const renderDashboardTab = () => {
    const completedEvents = events.filter(event => event.status === 'completed');
    const certificatesAvailable = events.filter(event => event.status === 'completed');
    const recentEvents = events.slice(0, 3);
    const uploadedSlipsCount = events.filter(e => e.slipUrl).length;

    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-900 to-purple-800 rounded-lg shadow-md p-6 text-white">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {userProfile.name}!</h1>
          <p className="text-blue-100">Here's your activity overview and quick actions.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between"><div><p className="text-sm font-medium text-gray-600">Total Events</p><p className="text-2xl font-bold text-gray-900">{events.length}</p></div><div className="bg-blue-100 p-3 rounded-full"><FileText className="h-6 w-6 text-blue-600" /></div></div><p className="text-sm text-gray-500 mt-2"><span className="text-green-600">+{events.length}</span> registered</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between"><div><p className="text-sm font-medium text-gray-600">Completed</p><p className="text-2xl font-bold text-gray-900">{completedEvents.length}</p></div><div className="bg-green-100 p-3 rounded-full"><CheckCircle className="h-6 w-6 text-green-600" /></div></div><p className="text-sm text-gray-500 mt-2"><span className="text-green-600">{events.length > 0 ? Math.round((completedEvents.length / events.length) * 100) : 0}%</span> completion rate</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between"><div><p className="text-sm font-medium text-gray-600">Certificates</p><p className="text-2xl font-bold text-gray-900">{certificatesAvailable.length}</p></div><div className="bg-yellow-100 p-3 rounded-full"><Award className="h-6 w-6 text-yellow-600" /></div></div><p className="text-sm text-gray-500 mt-2">Available for download</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between"><div><p className="text-sm font-medium text-gray-600">Files Uploaded</p><p className="text-2xl font-bold text-gray-900">{uploadedSlipsCount}</p></div><div className="bg-purple-100 p-3 rounded-full"><Upload className="h-6 w-6 text-purple-600" /></div></div><p className="text-sm text-gray-500 mt-2">Payment slips</p>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button onClick={() => setActiveTab('profile')} className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"><Edit className="h-5 w-5 text-blue-600" /><span className="font-medium text-blue-600">Edit Profile</span></button>
            <button onClick={() => setActiveTab('activity')} className="flex items-center gap-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"><Upload className="h-5 w-5 text-green-600" /><span className="font-medium text-green-600">Upload Activity</span></button>
            <button onClick={() => setActiveTab('certificate')} className="flex items-center gap-3 p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"><Download className="h-5 w-5 text-yellow-600" /><span className="font-medium text-yellow-600">Download Certificates</span></button>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4"><h2 className="text-xl font-bold text-gray-800">Recent Events</h2><button onClick={() => setActiveTab('activity')} className="text-blue-600 hover:text-blue-800 text-sm font-medium">View All</button></div>
          <div className="space-y-3">
            {recentEvents.length > 0 ? (
              recentEvents.map((event) => (
                // ‼️ แก้ key เป็น id ‼️
                <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-full"><FileText className="h-4 w-4 text-blue-600" /></div>
                    <div>
                      <h3 className="font-medium text-gray-800">{getEventTitle(event.event)}</h3>
                      {/* ‼️ ใช้ event.event.dateAndTime ‼️ */}
                      <p className="text-sm text-gray-600">{getEventDate(event.event?.dateAndTime)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${event.status === 'completed' ? 'bg-green-100 text-green-800' : event.status === 'slip_uploaded' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>{getStatusText(event.status)}</span>
                    {event.status === 'completed' && (<Award className="h-4 w-4 text-yellow-500" />)}
                  </div>
                </div>
              ))
            ) : (<p className="text-gray-500 text-center py-4">No events registered yet</p>)}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Profile Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div><div className="flex items-center gap-3 mb-3"><User className="h-5 w-5 text-gray-600" /><span className="font-medium text-gray-700">Personal Info</span></div><div className="space-y-2 text-sm"><p><span className="font-medium">Department:</span> {userProfile.department || 'Not specified'}</p><p><span className="font-medium">Position:</span> {userProfile.position || 'Not specified'}</p><p><span className="font-medium">Joined:</span> {userProfile.joinDate || 'Not specified'}</p></div></div>
            <div><div className="flex items-center gap-3 mb-3"><TrendingUp className="h-5 w-5 text-gray-600" /><span className="font-medium text-gray-700">Activity Progress</span></div><div className="space-y-2 text-sm"><div className="flex justify-between"><span>Completion Rate</span><span className="font-medium text-green-600">{events.length > 0 ? Math.round((completedEvents.length / events.length) * 100) : 0}%</span></div><div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-green-600 h-2 rounded-full" style={{ width: `${events.length > 0 ? (completedEvents.length / events.length) * 100 : 0}%` }}></div></div></div></div>
          </div>
        </div>
      </div>
    );
  };

  // Profile Tab
  const renderProfileTab = () => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6"><h2 className="text-2xl font-bold text-gray-800">Profile Information</h2>{!isEditing ? (<button onClick={() => setIsEditing(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"><Edit size={16} />Edit Profile</button>) : (<div className="flex gap-2"><button onClick={handleProfileSave} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"><Save size={16} />Save</button><button onClick={handleProfileCancel} className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"><X size={16} />Cancel</button></div>)}</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div><label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>{isEditing ? (<input type="text" value={editedProfile.name} onChange={(e) => setEditedProfile({...editedProfile, name: e.target.value})} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />) : (<p className="p-3 bg-gray-50 rounded-lg">{userProfile.name}</p>)}</div>
        <div><label className="block text-sm font-medium text-gray-700 mb-2">Email</label>{isEditing ? (<input type="email" value={editedProfile.email} onChange={(e) => setEditedProfile({...editedProfile, email: e.target.value})} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />) : (<p className="p-3 bg-gray-50 rounded-lg">{userProfile.email}</p>)}</div>
        <div><label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>{isEditing ? (<input type="tel" value={editedProfile.phone} onChange={(e) => setEditedProfile({...editedProfile, phone: e.target.value})} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />) : (<p className="p-3 bg-gray-50 rounded-lg">{userProfile.phone || 'Not specified'}</p>)}</div>
        <div><label className="block text-sm font-medium text-gray-700 mb-2">Department</label>{isEditing ? (<input type="text" value={editedProfile.department} onChange={(e) => setEditedProfile({...editedProfile, department: e.target.value})} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />) : (<p className="p-3 bg-gray-50 rounded-lg">{userProfile.department || 'Not specified'}</p>)}</div>
        <div><label className="block text-sm font-medium text-gray-700 mb-2">Position</label>{isEditing ? (<input type="text" value={editedProfile.position} onChange={(e) => setEditedProfile({...editedProfile, position: e.target.value})} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />) : (<p className="p-3 bg-gray-50 rounded-lg">{userProfile.position || 'Not specified'}</p>)}</div>
        <div><label className="block text-sm font-medium text-gray-700 mb-2">Join Date</label><p className="p-3 bg-gray-50 rounded-lg">{userProfile.joinDate || 'Not specified'}</p></div>
        <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>{isEditing ? (<textarea value={editedProfile.bio} onChange={(e) => setEditedProfile({...editedProfile, bio: e.target.value})} rows={4} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />) : (<p className="p-3 bg-gray-50 rounded-lg">{userProfile.bio || 'No bio provided'}</p>)}</div>
      </div>
    </div>
  );
  
  // ✅ Activity Tab
  const renderActivityTab = () => {
    const statusColorMap: Record<string, string> = {
      registered: "bg-gray-100 text-gray-800",
      slip_uploaded: "bg-yellow-100 text-yellow-800",
      verified: "bg-blue-100 text-blue-800",
      exam_ready: "bg-purple-100 text-purple-800",
      completed: "bg-green-100 text-green-800",
    };

    const ongoingEvents = events.filter(e => e.status !== "completed");
    const completedEvents = events.filter(e => e.status === "completed");

    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Activity List</h2>
        {showSuccessPopup && (<div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50">📤 อัปโหลดสลิปสำเร็จแล้ว!</div>)}
        <div className="space-y-4 mb-8">
          <h3 className="text-lg font-semibold text-gray-800">Ongoing Events ({ongoingEvents.length})</h3>
          {ongoingEvents.length > 0 ? (
            ongoingEvents.map((e) => (
              // ‼️ แก้ key เป็น id ‼️
              <div key={e.id} className="flex flex-col gap-2 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    {/* ‼️ ใช้ nameEvent และ dateAndTime ‼️ */}
                    <h4 className="font-medium text-gray-800">{getEventTitle(e.event)}</h4>
                    <p className="text-sm text-gray-600">Date: {getEventDate(e.event?.dateAndTime)}</p>
                    {e.event?.location && (<p className="text-sm text-gray-500">Location: {e.event.location}</p>)}
                    <p className="text-sm text-gray-600">User Code: {e.userCode}</p>
                    <span className={`inline-block px-2 py-1 mt-1 rounded-full text-xs font-medium ${statusColorMap[e.status] || "bg-gray-100 text-gray-800"}`}>
                      {getStatusText(e.status)}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {e.status === "registered" && (
                      <form onSubmit={(ev) => { ev.preventDefault(); handleSlipSubmit(e.id); }} className="flex items-center gap-2">
                        <input type="file" accept="image/*,application/pdf" onChange={(event) => handleFileSelect(event, e.id)} className="border p-1 text-sm rounded-md" required disabled={uploading} />
                        <button type="submit" className="bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 disabled:opacity-50" disabled={uploading}>
                          {uploading ? "Uploading..." : "Submit"}
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (<p className="text-gray-500 text-center py-4">No ongoing events</p>)}
        </div>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Completed Events ({completedEvents.length})</h3>
          {completedEvents.length > 0 ? (
            completedEvents.map((e) => (
              // ‼️ แก้ key เป็น id ‼️
              <div key={e.id} className="flex flex-col gap-2 p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex justify-between items-start">
                  <div>
                    {/* ‼️ ใช้ nameEvent และ dateAndTime ‼️ */}
                    <h4 className="font-medium text-gray-800">{getEventTitle(e.event)}</h4>
                    <p className="text-sm text-gray-600">Date: {getEventDate(e.event?.dateAndTime)}</p>
                    {e.event?.location && (<p className="text-sm text-gray-500">Location: {e.event.location}</p>)}
                    <p className="text-sm text-gray-600">User Code: {e.userCode}</p>
                    <span className={`inline-block px-2 py-1 mt-1 rounded-full text-xs font-medium ${statusColorMap[e.status] || "bg-gray-100 text-gray-800"}`}>
                      {getStatusText(e.status)}
                    </span>
                  </div>
                  <button onClick={() => handleCertificateDownloadClick(e.event.id, e.userCode)} className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700">
                    <Award size={16} /> View Certificate
                  </button>
                </div>
              </div>
            ))
          ) : (<p className="text-gray-500 text-center py-4">No completed events yet</p>)}
        </div>
      </div>
    );
  };

  // Certificate Tab
  const renderCertificateTab = () => {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Certificates</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.filter(event => event.status === 'completed').map((event) => (
            // ‼️ แก้ key เป็น id ‼️
            <div key={event.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <Award className="h-8 w-8 text-yellow-500" />
                <div>
                  {/* ‼️ ใช้ nameEvent และ dateAndTime ‼️ */}
                  <h3 className="font-semibold text-gray-800">{getEventTitle(event.event)}</h3>
                  <p className="text-sm text-gray-600">Completed on {getEventDate(event.event?.dateAndTime)}</p>
                  {event.event.location && (<p className="text-xs text-gray-500">{event.event.location}</p>)}
                </div>
              </div>
              <button
                onClick={() => {
                  handleCertificateDownloadClick(event.event.id, event.userCode); 
                }}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download size={16} />
                Download Certificate
              </button>
            </div>
          ))}
        </div>
        {events.filter(event => event.status === 'completed').length === 0 && (
          <div className="text-center py-12"><Award className="h-16 w-16 text-gray-400 mx-auto mb-4" /><p className="text-gray-600">No certificates available yet.</p></div>
        )}
      </div>
    );
  };

  // ✅ Survey Modal Component
  const renderSurveyModal = () => {
    if (!showSurveyModal || !currentSurvey) return null;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
            <div className="flex items-center justify-between"><h2 className="text-2xl font-bold text-gray-800">{currentSurvey.title}</h2><button onClick={() => { setShowSurveyModal(false); setCurrentSurvey(null); setPendingDownload(null); setSurveyAnswers({}); }} className="text-gray-400 hover:text-gray-600"><X size={24} /></button></div>
            <p className="text-sm text-gray-600 mt-2">กรุณาตอบแบบสอบถามก่อนดาวน์โหลดใบประกาศนียบัตร</p>
          </div>
          <div className="p-6 space-y-6">
            {currentSurvey.questions.map((question, index) => (
              <div key={index} className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">{index + 1}. {question.question}<span className="text-red-500 ml-1">*</span></label>
                {question.type === 'text' && (<textarea value={(surveyAnswers[index] as string) || ''} onChange={(e) => handleSurveyAnswerChange(index, e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" rows={3} placeholder="กรุณาใส่คำตอบของคุณ" />)}
                {question.type === 'radio' && question.options && (
                  <div className="space-y-2">
                    {question.options.map((option, optIndex) => (
                      <label key={optIndex} className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"><input type="radio" name={`question-${index}`} value={option} checked={surveyAnswers[index] === option} onChange={(e) => handleSurveyAnswerChange(index, e.target.value)} className="w-4 h-4 text-blue-600" /><span className="text-sm text-gray-700">{option}</span></label>
                    ))}
                  </div>
                )}
                {question.type === 'checkbox' && question.options && (
                  <div className="space-y-2">
                    {question.options.map((option, optIndex) => (
                      <label key={optIndex} className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input type="checkbox" value={option} checked={(surveyAnswers[index] as string[] || []).includes(option)}
                          onChange={(e) => {
                            const currentAnswers = (surveyAnswers[index] as string[]) || [];
                            if (e.target.checked) { handleSurveyAnswerChange(index, [...currentAnswers, option]); }
                            else { handleSurveyAnswerChange(index, currentAnswers.filter(a => a !== option)); }
                          }}
                          className="w-4 h-4 text-blue-600"
                        /><span className="text-sm text-gray-700">{option}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
            <div className="flex gap-3 justify-end">
              <button onClick={() => { setShowSurveyModal(false); setCurrentSurvey(null); setPendingDownload(null); setSurveyAnswers({}); }} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">ยกเลิก</button>
              <button onClick={handleSurveySubmit} disabled={surveySubmitting} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                {surveySubmitting ? (<><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>กำลังส่ง...</>) : (<>ส่งคำตอบและดาวน์โหลด</>)}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex bg-gray-100 p-4">
        <aside className="w-64 h-screen bg-white shadow-lg rounded-2xl flex flex-col justify-between overflow-hidden">
          <div>
            <div className="flex items-center gap-3 px-6 py-4 border-b"><User className="h-8 w-8 text-blue-600" /><h1 className="text-lg font-bold text-gray-800">Profile Dashboard</h1></div>
            <nav className="mt-4">
              <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-2 px-6 py-3 text-sm font-medium text-left ${activeTab === 'dashboard' ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-500' : 'text-gray-600 hover:bg-gray-100'}`}><Home size={16} />Dashboard</button>
              <button onClick={() => setActiveTab('profile')} className={`w-full flex items-center gap-2 px-6 py-3 text-sm font-medium text-left ${activeTab === 'profile' ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-500' : 'text-gray-600 hover:bg-gray-100'}`}><Settings size={16} />Manage Profile</button>
              <button onClick={() => setActiveTab('activity')} className={`w-full flex items-center gap-2 px-6 py-3 text-sm font-medium text-left ${activeTab === 'activity' ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-500' : 'text-gray-600 hover:bg-gray-100'}`}><FileText size={16} />Activity List</button>
              <button onClick={() => setActiveTab('certificate')} className={`w-full flex items-center gap-2 px-6 py-3 text-sm font-medium text-left ${activeTab === 'certificate' ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-500' : 'text-gray-600 hover:bg-gray-100'}`}><Award size={16} />Certificates</button>
            </nav>
          </div>
          <div className="px-6 py-4 border-t"><button onClick={handleLogout} className="flex items-center gap-2 text-red-600 hover:text-red-800 text-sm"><LogOut size={16} />Log Out</button></div>
        </aside>

        <main className="flex-1 h-full self-stretch ml-4 bg-white shadow-lg rounded-2xl px-6 py-8 overflow-auto">
          {activeTab === 'dashboard' && renderDashboardTab()}
          {activeTab === 'profile' && renderProfileTab()}
          {activeTab === 'activity' && renderActivityTab()}
          {activeTab === 'certificate' && renderCertificateTab()}
        </main>
      </div>
      
      {renderSurveyModal()}
      
      <Footer />
    </>
  );
};

export default Profile;