import axios from 'axios'
const api = axios.create({ baseURL: 'http://localhost:5174' })
export const Songs = {
  list: () => api.get('/songs').then(r => r.data),
  get: id => api.get(`/songs/${id}`).then(r => r.data),
  create: data => api.post('/songs', data).then(r => r.data),
  update: (id, data) => api.patch(`/songs/${id}`, data).then(r => r.data),
  remove: id => api.delete(`/songs/${id}`)
}
