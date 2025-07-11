export const uploadPaymentSlip = async (token: string, registrationId: string, file: File) => {
  const formData = new FormData();
  formData.append("slip", file);

  const res = await fetch(`${process.env.REACT_APP_API_BASE}/api/registration/upload-slip/${registrationId}`, {
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
  const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/registration/my`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Failed to fetch registered events");
  return res.json();
};