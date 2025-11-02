const API_BASE_URL = process.env.REACT_APP_API_URL;

export const getMyRegisteredEvents = async (token: string) => {
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

export const uploadPaymentSlip = async (token: string, registrationId: string, file: File) => {
  const formData = new FormData();
  formData.append("slip", file); 

  const res = await fetch(`${API_BASE_URL}/api/individual-registration/${registrationId}/slip`, {
    method: "PATCH", 
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: "Upload failed" }));
    throw new Error(errorData.message || "Upload failed");
  }

  return res.json();
};