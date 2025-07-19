import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8001';

export const getTopics = () => axios.get(`${API_BASE}/topics`);
export const getSituations = (topicId: number) => axios.get(`${API_BASE}/situations?topic_id=${topicId}`);
export const analyzeAnswer = (data: any) => axios.post(`${API_BASE}/analyze`, data);
export const saveResult = (data: any) => axios.post(`${API_BASE}/results`, data);
export const contributeSituation = (data: any) => axios.post(`${API_BASE}/contribute-situation`, data, {withCredentials:true});
export const getContributedSituations = () => axios.get(`${API_BASE}/contributed-situations`);
export const getAnswersBySituation = (situationId: number) => axios.get(`${API_BASE}/answers-by-situation?situation_id=${situationId}`); 

export async function getComments(situationId: number, limit: number | 'all' = 5) {
  const url = `${process.env.REACT_APP_API_URL || 'http://localhost:8001'}/situations/${situationId}/comments`;
  const res = await fetch(url, { credentials: 'include' });
  const data = await res.json();
  if (limit === 'all') return data;
  return data.slice(-limit);
}

export async function postComment(situationId: number, content: string) {
  const url = `${process.env.REACT_APP_API_URL || 'http://localhost:8001'}/situations/${situationId}/comments`;
  const res = await fetch(url, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ situation_id: situationId, content }),
  });
  return res.json();
}

export async function getReactions(situationId: number) {
  const url = `${process.env.REACT_APP_API_URL || 'http://localhost:8001'}/situations/${situationId}/reactions`;
  const res = await fetch(url, { credentials: 'include' });
  return res.json();
}

export async function postReaction(situationId: number, reaction_type: 'upvote' | 'downvote') {
  const url = `${process.env.REACT_APP_API_URL || 'http://localhost:8001'}/situations/${situationId}/reactions`;
  const res = await fetch(url, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ situation_id: situationId, reaction_type }),
  });
  return res.json();
} 

export async function deleteReaction(situationId: number, reactionType: string) {
  const url = `${process.env.REACT_APP_API_URL || 'http://localhost:8001'}/situations/${situationId}/reactions`;
  const res = await fetch(url, {
    method: 'DELETE',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reaction_type: reactionType }),
  });
  return res.json();
} 

export async function analyzeSentiment(content: string) {
  const url = `${process.env.REACT_APP_API_URL || 'http://localhost:8001'}/analyze-sentiment`;
  const res = await fetch(url, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });
  return res.json();
}

export async function searchUsers(query: string) {
  const url = `${process.env.REACT_APP_API_URL || 'http://localhost:8001'}/users/search?query=${encodeURIComponent(query)}`;
  const res = await fetch(url, { credentials: 'include' });
  const data = await res.json();
  console.log('API searchUsers response:', data);
  return data;
}

export async function getUserProfile(userId: number) {
  const url = `${process.env.REACT_APP_API_URL || 'http://localhost:8001'}/users/${userId}`;
  const res = await fetch(url, { credentials: 'include' });
  const data = await res.json();
  console.log('API getUserProfile response:', data);
  return data;
} 