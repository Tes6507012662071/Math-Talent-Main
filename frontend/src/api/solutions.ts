// frontend/src/api/solutions.ts
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// (สร้าง Type ให้ตรงกับข้อมูลที่ Backend ส่งมา)
export interface Solution {
  id: string;
  eventId: string;
  fileUrl: string;
  uploadedAt: string;
  event: { // (ข้อมูล Event ที่เรา include มา)
    nameEvent: string;
    dateAndTime: string;
  };
}

export const fetchAllSolutions = async (): Promise<Solution[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/solutions`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch solutions:', error);
    throw error;
  }
};