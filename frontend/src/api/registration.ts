// frontend/src/api/registration.ts

// 1. ✅ ดึง Base URL (ที่ไม่มี /api)
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// ✅ SIMPLIFIED: แก้ไข API call
export const getMyRegisteredEvents = async (token: string) => {
  // 2. ‼️ แก้ไข URL ให้เป็น 'my-registrations' (ตามที่เราแก้ Route ใน Backend) ‼️
  const res = await fetch(`${API_BASE_URL}/api/individual-registration/my-registrations`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  
  if (!res.ok) {
     const errorData = await res.json().catch(() => ({ message: "Failed to fetch" }));
     throw new Error(errorData.message || "Failed to fetch registered events");
  }
  return res.json();
};

// ✅ UPDATED: Upload slip to IndividualRegistration
export const uploadPaymentSlip = async (token: string, registrationId: string, file: File) => {
  const formData = new FormData();
  // ‼️ (สำคัญ) ชื่อ 'slip' ต้องตรงกับ Multer Middleware (uploadSlip.single('slip'))
  formData.append("slip", file); 

  // 3. ‼️ แก้ไข Method เป็น 'PATCH' และ URL ให้ถูกต้อง ‼️
  const res = await fetch(`${API_BASE_URL}/api/individual-registration/${registrationId}/slip`, {
    method: "PATCH", // 👈 เปลี่ยนเป็น PATCH
    headers: {
      Authorization: `Bearer ${token}`,
      // (ไม่ต้องใส่ 'Content-Type', fetch จะจัดการให้เองสำหรับ FormData)
    },
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: "Upload failed" }));
    throw new Error(errorData.message || "Upload failed");
  }

  return res.json();
};