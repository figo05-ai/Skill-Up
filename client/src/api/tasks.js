import api from './axios';

export const getTasks = () => api.get('/tasks');
export const createTask = (data) => api.post('/tasks', data);
export const updateTask = (id, patch) => api.put(`/tasks/${id}`, patch);
export const deleteTask = (id) => api.delete(`/tasks/${id}`);
