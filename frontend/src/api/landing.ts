const API_URL = "http://localhost:5000/api";
export interface LandingData {
  historyTitle: string;
  historyContent: string;
  objectiveTitle: string;
  objectives: string[];
}

export const fetchLandingContent = async (): Promise<LandingData> => {
  console.log('Fetching landing content from:', `${API_URL}/landing`);
  const res = await fetch(`${API_URL}/landing`);
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || 'ไม่สามารถโหลดข้อมูลได้');
  }
  return res.json();
};

export const updateLandingContent = async (
  data: Partial<LandingData>,
  token: string
): Promise<LandingData> => {
  console.log('Updating landing content...');
  const res = await fetch(`${API_URL}/landing`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || 'ไม่สามารถอัปเดตข้อมูลได้');
  }
  return res.json();
};