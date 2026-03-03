import axios from 'axios';

const API_URL = process.env.REACT_APP_BASE_URL;

const createSupplier = async (supplierData) => {
  const response = await axios.post(`${API_URL}/api/suppliers`, supplierData);
  return response.data;
};

const getAllSuppliers = async (filters) => {
  const params = new URLSearchParams(filters).toString();
  const response = await axios.get(`${API_URL}/api/suppliers?${params}`);
  return response.data;
};

const getSupplierById = async (id) => {
  const response = await axios.get(`${API_URL}/api/suppliers/${id}`);
  return response.data;
};

const updateSupplierById = async (id, supplierData) => {
  const response = await axios.put(`${API_URL}/api/suppliers/${id}`, supplierData);
  return response.data;
};

const deleteSupplierById = async (id) => {
  const response = await axios.delete(`${API_URL}/api/suppliers/${id}`);
  return response.data;
};

const supplierService = {
  createSupplier,
  getAllSuppliers,
  getSupplierById,
  updateSupplierById,
  deleteSupplierById,
};

export default supplierService;