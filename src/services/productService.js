import axios from 'axios';

const API_URL = process.env.REACT_APP_BASE_URL;

const createProduct = async (productData) => {
  const response = await axios.post(`${API_URL}/api/products`, productData);
  return response.data;
};

const getAllProducts = async (filters) => {
  const params = new URLSearchParams(filters).toString();
  const response = await axios.get(`${API_URL}/api/products?${params}`);
  return response.data;
};

const getProductById = async (id) => {
  const response = await axios.get(`${API_URL}/api/products/${id}`);
  return response.data;
};

const updateProductById = async (id, productData) => {
  const response = await axios.put(`${API_URL}/api/products/${id}`, productData);
  return response.data;
};

const deleteProductById = async (id) => {
  const response = await axios.delete(`${API_URL}/api/products/${id}`);
  return response.data;
};

const adjustProductStock = async (id, stockData) => {
  const response = await axios.patch(`${API_URL}/api/products/${id}/stock`, stockData);
  return response.data;
};

const productService = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProductById,
  deleteProductById,
  adjustProductStock,
};

export default productService;