const API_URL = "http://localhost:5000/api/registration";

export const registerIndividual = async (eventId: string, student: any, token: string) => {
  const res = await fetch(`${API_URL}/individual`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ eventId, ...student }),
  });
  return res.json();
};

export const registerSchool = async (eventId: string, students: any[], token: string) => {
  const res = await fetch(`${API_URL}/school`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ eventId, students }),
  });
  return res.json();
};
