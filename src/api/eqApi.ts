import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8001';

export const getTopics = () => axios.get(`${API_BASE}/topics`);
export const getSituations = (topicId: number) => axios.get(`${API_BASE}/situations?topic_id=${topicId}`);
export const analyzeAnswer = (data: any) => axios.post(`${API_BASE}/analyze`, data);
export const saveResult = (data: any) => axios.post(`${API_BASE}/results`, data);
export const contributeSituation = (data: any) => axios.post(`${API_BASE}/contribute-situation`, data, {withCredentials:true});
export const getContributedSituations = () => axios.get(`${API_BASE}/contributed-situations`);
export const getAnswersBySituation = (situationId: number) => axios.get(`${API_BASE}/answers-by-situation?situation_id=${situationId}`); 