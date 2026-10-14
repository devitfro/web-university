import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5174',
  headers: {
    'Content-Type': 'application/json'
  }
});

export const Songs = {
  list: (params = {}) =>
    api.get('/songs', { params }).then(r => r.data),

  create: (payload) =>
    api.post('/songs', payload).then(r => r.data),

  update: (id, payload) =>
    api.patch(`/songs/${id}`, payload).then(r => r.data),

  remove: (id) =>
    api.delete(`/songs/${id}`)
};