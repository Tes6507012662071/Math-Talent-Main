const REACT_APP_API_URL="http://localhost:5000/api"

export const uploadPaymentSlip = async (token: string, registrationId: string, file: File) => {
  const formData = new FormData();
  formData.append("slip", file);

  const res = await fetch(`${REACT_APP_API_URL}/registration/upload-slip/${registrationId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!res.ok) {
    throw new Error("Upload failed");
  }

  return res.json();
};

export const getMyRegisteredEvents = async (token: string) => {
  const res = await fetch(`${REACT_APP_API_URL}/registration/myevents`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Failed to fetch registered events");
  return res.json();
};

