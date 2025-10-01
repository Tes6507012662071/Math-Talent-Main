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

// NEW: Submit survey response
// (Need to implement)
export const submitSurveyResponse = async (
  eventId: string, 
  surveyId: string, 
  answers: any[], 
  userCode: string,
  token: string
) => {
  const response = await axios.post(
    `${API_BASE_URL}/survey-response/${eventId}/submit`,
    { surveyId, answers, userCode },
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return response.data;
};

// NEW: Check if user submitted
export const checkSurveyResponse = async (surveyId: string, token: string) => {
  const response = await axios.get(
    `${API_BASE_URL}/survey-response/${surveyId}/check`,
    {
      headers: { Authorization: `Bearer ${token}` }
    }
  );
  return response.data;
};