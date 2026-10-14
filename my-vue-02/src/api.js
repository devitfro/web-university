import axios from 'axios'
const api = axios.create({ baseURL: 'http://localhost:5174' })
export const getSongs = async () => (await api.get('/songs')).data
export const getSong = async id => (await api.get(`/songs/${id}`)).data
export const createSong = async song => (await api.post('/songs', song)).data
export const updateSong = async (id, song) => (await api.put(`/songs/${id}`, song)).data
export const deleteSong = async id => api.delete(`/songs/${id}`)
