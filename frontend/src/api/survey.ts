// frontend/src/api/survey.ts
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export const saveSurvey = async (eventId: string, surveyData: any, token: string) => {
  const response = await axios.post(
    `${API_BASE_URL}/survey/${eventId}`,
    surveyData,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return response.data;
};

export const fetchSurvey = async (eventId: string) => {
  const response = await axios.get(`${API_BASE_URL}/survey/${eventId}`);
  return response.data;
};