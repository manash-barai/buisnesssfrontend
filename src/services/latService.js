import axios from 'axios';

const API_URL = process.env.REACT_APP_BASE_URL;

const createLat = async (latData) => {
  const response = await axios.post(`${API_URL}/api/lats`, latData);
  return response.data;
};

const getAllLats = async (filter) => {
  const params = new URLSearchParams(filter).toString();

  const response = await axios.get(`${API_URL}/api/lats?${params}`);
  return response.data;
};

const getLatById = async (id) => {
  const response = await axios.get(`${API_URL}/api/lats/${id}`);
  return response.data;
};

const updateLatById = async (id, latData) => {
  const response = await axios.put(`${API_URL}/api/lats/${id}`, latData);
  return response.data;
};

const deleteLatById = async (id) => {
  const response = await axios.delete(`${API_URL}/api/lats/${id}`);
  return response.data;
};

const latService = {
  createLat,
  getAllLats,
  getLatById,
  updateLatById,
  deleteLatById,
};

export default latService;
