import axios from 'axios';

const API_URL = process.env.REACT_APP_BASE_URL;

const createSale = async (saleData) => {
  const response = await axios.post(`${API_URL}/api/sales`, saleData);
  return response.data;
};

const getAllSales = async (filters) => {
  const params = new URLSearchParams(filters).toString();
  const response = await axios.get(`${API_URL}/api/sales?${params}`);
  return response.data;
};

const getSaleById = async (id) => {
  const response = await axios.get(`${API_URL}/api/sales/${id}`);
  return response.data;
};

const updateSaleById = async (id, saleData) => {
  const response = await axios.put(`${API_URL}/api/sales/${id}`, saleData);
  return response.data;
};

const deleteSaleById = async (id) => {
  const response = await axios.delete(`${API_URL}/api/sales/${id}`);
  return response.data;
};

const getSalesByCustomer = async (customerId) => {
  const response = await axios.get(`${API_URL}/api/sales/customer/${customerId}`);
  return response.data;
};

const saleService = {
  createSale,
  getAllSales,
  getSaleById,
  updateSaleById,
  deleteSaleById,
  getSalesByCustomer,
};

export default saleService;