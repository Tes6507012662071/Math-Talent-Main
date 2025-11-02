import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL;

export interface Solution {
  id: string;
  eventId: string;
  fileUrl: string;
  uploadedAt: string;
  event: { 
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