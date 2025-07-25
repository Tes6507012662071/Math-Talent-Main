import React, { useEffect, useState } from "react";
import { User, Upload, Download, LogOut, Edit, Save, X, FileText, Award, Settings, Home, Calendar, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { fetchUserProfile } from "../api/auth";
import { getMyRegisteredEvents, uploadPaymentSlip } from "../api/registration";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import axios from "axios";


interface EventDetail {
  _id?: string;
  id?: string;
  title: string;
  description?: string;
  date: string;
  location?: string;
  detail?: string;
  registrationType?: string;
}

interface EventStatus {
  _id: string;
  event: EventDetail;
  status: string;
}

interface UploadedFile {
  id: number;
  name: string;
  size: number;
  uploadDate: string;
  file: File;
}

const Profile: React.FC = () => {
  // API-related state
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [events, setEvents] = useState<EventStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [registrations, setRegistrations] = useState([]);

  // UI state
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isEditing, setIsEditing] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  //const [uploadEventId, setUploadEventId] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<{ [eventId: string]: File | null }>({});
  const [uploading, setUploading] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);




  // Profile state (will be populated from API)
  const [userProfile, setUserProfile] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    joinDate: '',
    bio: ''
  });

  const [editedProfile, setEditedProfile] = useState(userProfile);

  // Helper function to safely get event title
  const getEventTitle = (eventData?: EventDetail): string => {
    if (!eventData) return 'Untitled Event';
    return eventData.title || 'Untitled Event';
  };

  const getEventDate = (dateInput?: string | Date): string => {
    if (!dateInput) return 'ยังไม่ระบุวันที่';

    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) return 'รูปแบบวันที่ไม่ถูกต้อง';

    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  

  // Load data from API
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("ไม่พบ token ใน localStorage");
      setLoading(false);
      return;
    }

    console.log("📌 ใช้ token:", token);

    Promise.all([
      fetchUserProfile(token),
      getMyRegisteredEvents(token),
    ])
      .then(([userData, registeredEvents]) => {
        setUser(userData);
        
        // Ensure events have proper structure
        const processedEvents = registeredEvents.map((eventItem: any) => ({
          _id: eventItem._id || eventItem.id,
          event: {
            _id: eventItem.eventId?._id,
            title: eventItem.eventId?.title || 'Untitled Event',
            description: eventItem.eventId?.description,
            date: eventItem.eventId?.date,
            location: eventItem.eventId?.location,
            detail: eventItem.eventId?.detail,
            registrationType: eventItem.eventId?.registrationType
          },
          status: eventItem.status || 'registered'
        }));


        console.log("Processed events for state:", processedEvents);
        
        setEvents(processedEvents);
        
        // Update profile state with API data
        setUserProfile({
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          department: userData.department || '',
          position: userData.position || '',
          joinDate: userData.joinDate || '',
          bio: userData.bio || ''
        });
      })
      .catch((err) => {
        console.error("❌ เกิด error ขณะโหลดข้อมูล:", err);
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          alert("Session หมดอายุ กรุณาเข้าสู่ระบบใหม่");
        } else {
          alert("เกิดข้อผิดพลาดในการโหลดข้อมูล");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  // Update editedProfile when userProfile changes
  useEffect(() => {
    setEditedProfile(userProfile);
  }, [userProfile]);

  const handleUploadSlip = async (registrationId: string) => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";

    fileInput.onchange = async () => {
      const file = fileInput.files?.[0];
      if (!file) return;

      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        await uploadPaymentSlip(token, registrationId, file);
        alert("อัปโหลดสลิปสำเร็จ");

        const updatedEvents = await getMyRegisteredEvents(token);
        setEvents(updatedEvents);
      } catch (error) {
        console.error("❌ อัปโหลดสลิปล้มเหลว:", error);
        alert("เกิดข้อผิดพลาดในการอัปโหลด");
      }
    };

    fileInput.click();
  };

  const handleProfileSave = () => {
    setUserProfile(editedProfile);
    setIsEditing(false);
    // TODO: Add API call to save profile changes
  };

  const handleProfileCancel = () => {
    setEditedProfile(userProfile);
    setIsEditing(false);
  };

  /*const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    const newFiles = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      uploadDate: new Date().toISOString().split('T')[0],
      file: file
    }));
    setUploadedFiles(prev => [...prev, ...newFiles]);
  };*/

  const handleSlipUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    eventId: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("slip", file);

    try {
      const res = await axios.post(
        `http://localhost:5000/api/registration/upload-slip/${eventId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // ✅ หลัง upload สำเร็จ ให้ update state ด้วย
      setEvents((prev) =>
        prev.map((ev) =>
          ev._id === eventId ? { ...ev, status: "slip_uploaded" } : ev
        )
      );
    } catch (err) {
      console.error("❌ Upload failed", err);
    }
  };

  // ฟังก์ชันเมื่อเลือกไฟล์
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, eventId: string) => {
    const file = e.target.files?.[0] || null;
    setSelectedFiles((prev) => ({ ...prev, [eventId]: file }));
  };

  // ฟังก์ชันเมื่อกด Submit
  const handleSlipSubmit = async (eventId: string) => {
    console.log("==> Submitting for eventId:", eventId);
    const file = selectedFiles[eventId];
    if (!file) {
      console.warn("No file selected for eventId:", eventId);
      return;
    }

    const formData = new FormData();
    formData.append("slip", file);

    try {
      setUploading(true);
      await axios.post(
        `http://localhost:5000/api/registration/upload-slip/${eventId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // เปลี่ยนสถานะเป็น pending
      setEvents((prevEvents) =>
        prevEvents.map((ev) =>
          ev._id === eventId ? { ...ev, status: "pending" } : ev
        )
      );

      setSelectedFiles((prev) => ({ ...prev, [eventId]: null }));

      // ✅ แสดง popup สำเร็จ
      setShowSuccessPopup(true);
      setTimeout(() => setShowSuccessPopup(false), 3000);
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
    }
  };


  const handleDownloadCertificate = (eventTitle: string) => {
    const element = document.createElement('a');
    const file = new Blob(
      [
        `Certificate of Completion\n\nThis certifies that ${userProfile.name} has successfully completed ${eventTitle}\n\nDate: ${new Date().toLocaleDateString()}`
      ],
      { type: 'text/plain' }
    );
    element.href = URL.createObjectURL(file);
    element.download = `${eventTitle}_Certificate.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login"; // Redirect to login page
  };

  if (loading) return <div className="p-8 text-center">⏳ กำลังโหลดข้อมูล...</div>;
  if (!user) return <div className="p-8 text-center">⚠ ไม่พบข้อมูลผู้ใช้</div>;

  console.log("events state =", events); // <-- ใส่ตรงนี้จะเห็นทุกครั้งที่ render

  // Dashboard Tab
  const renderDashboardTab = () => {
    const completedEvents = events.filter(event => event.status === 'completed');
    const certificatesAvailable = events.filter(event => event.status === 'completed');
    const recentEvents = events.slice(0, 3);

    return (
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-900 to-purple-800 rounded-lg shadow-md p-6 text-white">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {userProfile.name}!</h1>
          <p className="text-blue-100">Here's your activity overview and quick actions.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Events</p>
                <p className="text-2xl font-bold text-gray-900">{events.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              <span className="text-green-600">+{events.length}</span> registered
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{completedEvents.length}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              <span className="text-green-600">
                {events.length > 0 ? Math.round((completedEvents.length / events.length) * 100) : 0}%
              </span> completion rate
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Certificates</p>
                <p className="text-2xl font-bold text-gray-900">{certificatesAvailable.length}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <Award className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Available for download
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Files Uploaded</p>
                <p className="text-2xl font-bold text-gray-900">{uploadedFiles.length}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <Upload className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Documentation files
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={() => setActiveTab('profile')}
              className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Edit className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-600">Edit Profile</span>
            </button>
            
            <button 
              onClick={() => setActiveTab('activity')}
              className="flex items-center gap-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <Upload className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-600">Upload Activity</span>
            </button>
            
            <button 
              onClick={() => setActiveTab('certificate')}
              className="flex items-center gap-3 p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
            >
              <Download className="h-5 w-5 text-yellow-600" />
              <span className="font-medium text-yellow-600">Download Certificates</span>
            </button>
          </div>
        </div>

        {/* Recent Events */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">Recent Events</h2>
            <button 
              onClick={() => setActiveTab('activity')}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View All
            </button>
          </div>
          
          <div className="space-y-3">
            {recentEvents.length > 0 ? (
              recentEvents.map((event) => (
                <div key={event._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <FileText className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-800">{getEventTitle(event.event)}</h3>
                      <p className="text-sm text-gray-600">{getEventDate(event.event?.date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      event.status === 'completed' ? 'bg-green-100 text-green-800' : 
                      event.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {event.status}
                    </span>
                    {event.status === 'completed' && (
                      <Award className="h-4 w-4 text-yellow-500" />
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No events registered yet</p>
            )}
          </div>
        </div>

        {/* Profile Summary */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Profile Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <User className="h-5 w-5 text-gray-600" />
                <span className="font-medium text-gray-700">Personal Info</span>
              </div>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Department:</span> {userProfile.department || 'Not specified'}</p>
                <p><span className="font-medium">Position:</span> {userProfile.position || 'Not specified'}</p>
                <p><span className="font-medium">Joined:</span> {userProfile.joinDate || 'Not specified'}</p>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-3">
                <TrendingUp className="h-5 w-5 text-gray-600" />
                <span className="font-medium text-gray-700">Activity Progress</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Completion Rate</span>
                  <span className="font-medium text-green-600">
                    {events.length > 0 ? Math.round((completedEvents.length / events.length) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full" 
                    style={{ 
                      width: `${events.length > 0 ? (completedEvents.length / events.length) * 100 : 0}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Profile Tab
  const renderProfileTab = () => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Profile Information</h2>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Edit size={16} />
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleProfileSave}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Save size={16} />
              Save
            </button>
            <button
              onClick={handleProfileCancel}
              className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <X size={16} />
              Cancel
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
          {isEditing ? (
            <input
              type="text"
              value={editedProfile.name}
              onChange={(e) => setEditedProfile({...editedProfile, name: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <p className="p-3 bg-gray-50 rounded-lg">{userProfile.name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          {isEditing ? (
            <input
              type="email"
              value={editedProfile.email}
              onChange={(e) => setEditedProfile({...editedProfile, email: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <p className="p-3 bg-gray-50 rounded-lg">{userProfile.email}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
          {isEditing ? (
            <input
              type="tel"
              value={editedProfile.phone}
              onChange={(e) => setEditedProfile({...editedProfile, phone: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <p className="p-3 bg-gray-50 rounded-lg">{userProfile.phone || 'Not specified'}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
          {isEditing ? (
            <input
              type="text"
              value={editedProfile.department}
              onChange={(e) => setEditedProfile({...editedProfile, department: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <p className="p-3 bg-gray-50 rounded-lg">{userProfile.department || 'Not specified'}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
          {isEditing ? (
            <input
              type="text"
              value={editedProfile.position}
              onChange={(e) => setEditedProfile({...editedProfile, position: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <p className="p-3 bg-gray-50 rounded-lg">{userProfile.position || 'Not specified'}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Join Date</label>
          <p className="p-3 bg-gray-50 rounded-lg">{userProfile.joinDate || 'Not specified'}</p>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
          {isEditing ? (
            <textarea
              value={editedProfile.bio}
              onChange={(e) => setEditedProfile({...editedProfile, bio: e.target.value})}
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <p className="p-3 bg-gray-50 rounded-lg">{userProfile.bio || 'No bio provided'}</p>
          )}
        </div>
      </div>
    </div>
  );
  

  // Activity Tab
  const renderActivityTab = () => {
    const statusLabelMap: Record<string, string> = {
      registered: "ยังไม่ได้อัปโหลดสลิป",
      slip_uploaded: "รอตรวจสอบ",
      pending: "รอตรวจสอบ",
      approved: "ผ่านการตรวจสอบแล้ว",
      rejected: "ไม่ผ่าน กรุณาอัปโหลดใหม่",
      completed: "เสร็จสิ้น",
    };

    const statusColorMap: Record<string, string> = {
      registered: "bg-gray-100 text-gray-800",
      slip_uploaded: "bg-yellow-100 text-yellow-800",
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-blue-100 text-blue-800",
      rejected: "bg-red-100 text-red-800",
      completed: "bg-green-100 text-green-800",
    };

    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Activity List</h2>

        {/* Success Popup */}
        {showSuccessPopup && (
          <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50">
            📤 อัปโหลดสลิปสำเร็จแล้ว!
          </div>
        )}

        {/* Events List */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Registered Events</h3>
          {events.length > 0 ? (
            events.map((e) => (
              <div key={e._id} className="flex flex-col gap-2 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-800">{e.event.title}</h4>
                    <p className="text-sm text-gray-600">Date: {e.event.date}</p>
                    {e.event.location && (
                      <p className="text-sm text-gray-500">Location: {e.event.location}</p>
                    )}
                    <span
                      className={`inline-block px-2 py-1 mt-1 rounded-full text-xs font-medium ${
                        statusColorMap[e.status] || "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {statusLabelMap[e.status] || e.status}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    {e.status === "registered" && (
                      <form
                        onSubmit={(ev) => {
                          ev.preventDefault();
                          handleSlipSubmit(e._id);
                        }}
                        className="flex items-center gap-2"
                      >
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={(event) => handleFileSelect(event, e._id)}
                          className="border p-1 text-sm rounded-md"
                          required
                        />
                        <button
                          type="submit"
                          className="bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700"
                        >
                          Submit
                        </button>
                      </form>
                    )}

                    {e.status === "completed" && (
                      <button
                        onClick={() => handleDownloadCertificate(getEventTitle(e.event))}
                        className="flex items-center gap-2 bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700"
                      >
                        <Download size={16} />
                        Certificate
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-8">No events registered yet</p>
          )}
        </div>
      </div>
    );
  };



  // Certificate Tab
  const renderCertificateTab = () => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Certificates</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {events.filter(event => event.status === 'completed').map((event) => (
          <div key={event._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <Award className="h-8 w-8 text-yellow-500" />
              <div>
                <h3 className="font-semibold text-gray-800">{getEventTitle(event.event)}</h3>
                <p className="text-sm text-gray-600">Completed on {getEventDate(event.event?.date)}</p>
                {event.event.location && (
                  <p className="text-xs text-gray-500">{event.event.location}</p>
                )}
              </div>
            </div>
            <button
              onClick={() => handleDownloadCertificate(getEventTitle(event.event))}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download size={16} />
              Download Certificate
            </button>
          </div>
        ))}
      </div>
      
      {events.filter(event => event.status === 'completed').length === 0 && (
        <div className="text-center py-12">
          <Award className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No certificates available yet.</p>
        </div>
      )}
    </div>
  );
  return (
    <>
      <Navbar />
      <div className="min-h-screen flex bg-gray-100 p-4">
        {/* Sidebar with rounded corners */}
        <aside className="w-64 h-screen bg-white shadow-lg rounded-2xl flex flex-col justify-between overflow-hidden">
          <div>
            <div className="flex items-center gap-3 px-6 py-4 border-b">
              <User className="h-8 w-8 text-blue-600" />
              <h1 className="text-lg font-bold text-gray-800">Profile Dashboard</h1>
            </div>
            <nav className="mt-4">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center gap-2 px-6 py-3 text-sm font-medium text-left ${
                  activeTab === 'dashboard'
                    ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-500'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Home size={16} />
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-2 px-6 py-3 text-sm font-medium text-left ${
                  activeTab === 'profile'
                    ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-500'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Settings size={16} />
                Manage Profile
              </button>
              <button
                onClick={() => setActiveTab('activity')}
                className={`w-full flex items-center gap-2 px-6 py-3 text-sm font-medium text-left ${
                  activeTab === 'activity'
                    ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-500'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <FileText size={16} />
                Activity List
               </button>
               <button
               onClick={() => setActiveTab('certificate')}
               className={`w-full flex items-center gap-2 px-6 py-3 text-sm font-medium text-left ${
                    activeTab === 'certificate'
                    ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-500'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                >
                <Award size={16} />
                Certificates
                </button>
            </nav>
            </div>
            <div className="px-6 py-4 border-t">
            <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-red-600 hover:text-red-800 text-sm"
            >
                <LogOut size={16} />
                Log Out
            </button>
            </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 h-full self-stretch ml-4 bg-white shadow-lg rounded-2xl px-6 py-8 overflow-auto">
            {activeTab === 'dashboard' && renderDashboardTab()}
            {activeTab === 'profile' && renderProfileTab()}
            {activeTab === 'activity' && renderActivityTab()}
            {activeTab === 'certificate' && renderCertificateTab()}
        </main>
        </div>
        <Footer />
    </>

  );
};

export default Profile;