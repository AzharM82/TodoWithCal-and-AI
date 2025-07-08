import axios from 'axios';

const API_BASE = 'http://localhost:4000';

export async function createTask(task) {
  const response = await axios.post(`${API_BASE}/tasks`, task);
  return response.data;
}

export async function fetchTasks() {
  const response = await axios.get(`${API_BASE}/tasks`);
  return response.data;
}

export async function deleteTask(id) {
  const response = await axios.delete(`${API_BASE}/tasks/${id}`);
  return response.data;
}

export async function updateTask(id, updates) {
  const response = await axios.put(`${API_BASE}/tasks/${id}`, updates);
  return response.data;
}

