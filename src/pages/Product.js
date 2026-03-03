import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  getAllProducts,
  createProduct,
  deleteProductById,
  updateProductById
} from '../features/product/productSlice';
import { FaEdit, FaTrash, FaArrowRight, FaPlus, FaBox, FaWarehouse } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import DataTable from '../components/DataTable';
import ProductModal from '../components/ProductModal';

// Conversion constants
const MON_TO_KG = 40;      // 1 Mon = 40 KG
const BAG_TO_KG = 50;      // 1 Bag = 50 KG
const TRAY_TO_PETI = 7;    // 7 Tray = 1 Peti

const Product = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { data: products = [], loading, error, currentPage, totalPages } = useSelector((state) => state.product);
  const [isClosing, setIsClosing] = useState(false);
  const [productUpdateId, setProductUpdateId] = useState(null);
  const [newProduct, setNewProduct] = useState({
    name: '',
    unitCategory: 'KG',
    currentStock: '',
    currentStock_bag: '',
  });
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    dispatch(getAllProducts());
  }, [dispatch]);

  const handleAddProduct = () => {
    if (productUpdateId) {
      dispatch(updateProductById({ id: productUpdateId, productData: newProduct }));
    } else {
      dispatch(createProduct(newProduct));
    }
    resetForm();
    setShowModal(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      dispatch(deleteProductById(id));
    }
  };

  const handleProductJourney = (id) => {
    navigate(`/products/${id}`);
  };

  const handleUpdate = (product) => {
    setProductUpdateId(product._id);
    setNewProduct({
      name: product.name,
      unitCategory: product.unitCategory,
      currentStock: product.currentStock,
      currentStock_bag: product.currentStock_bag,
      currentStock_tray: product.currentStock_tray
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setNewProduct({
      name: '',
      unitCategory: 'KG',
      currentStock: '',
      currentStock_bag: '',
      currentStock_tray: ''
    });
    setProductUpdateId(null);
  };

  const handleCloseModal = () => {
    setIsClosing(true);
    resetForm();
    setTimeout(() => {
      setShowModal(false);
      setIsClosing(false);
    }, 200);
  };

  // Function to calculate converted values for display
  const getConvertedValues = (product) => {
    const stockValue = parseFloat(product.currentStock) || 0;
    switch (product.unitCategory) {
      case 'KG':
        return {
          converted: (stockValue / MON_TO_KG).toFixed(3) + ' Mon',
          unit: 'kg'
        };
      case 'bag':
        return {
          converted: (stockValue * BAG_TO_KG).toFixed(2) + ' KG',
          unit: 'bags'
        };
      case 'tray':
        return {
          converted: (stockValue / TRAY_TO_PETI).toFixed(3) + ' Peti',
          unit: 'trays'
        };
      default:
        return {
          converted: '',
          unit: ''
        };
    }
  };

  const columns = React.useMemo(
    () => [
      {
        Header: 'Name',
        accessor: 'name',
        Cell: ({ row }) => <span className="font-medium">{row.original.name}</span>
      },
      {
        Header: 'Unit',
        accessor: 'unitCategory',
        Cell: ({ row }) => {
          const unitMap = { 'KG': 'KG', 'bag': 'Bag', 'tray': 'Tray' };
          return unitMap[row.original.unitCategory] || row.original.unitCategory;
        }
      },
      {
        Header: 'Main Stock',
        accessor: 'currentStock',
        Cell: ({ row }) => {
          const converted = getConvertedValues(row.original);
          return (
            <div>
              <div>{row.original.currentStock || 0} {converted.unit}</div>
              <div className="text-sm text-gray-500">{converted.converted}</div>
            </div>
          );
        }
      },
      {
        Header: 'Bags',
        accessor: 'currentStock_bag',
        Cell: ({ row }) => row.original.currentStock_bag ? `${row.original.currentStock_bag} bags` : '-'
      },
      // ... (action columns remain the same)
    ],
    []
  );
  return (
    <div className="container mx-auto p-6 bg-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Product Inventory</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-app-primary-600 text-white px-4 py-2 rounded-lg transition"
        >
          <FaPlus /> Add Product
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Loading products...</p>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-500">Error: {error}</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <DataTable
            columns={columns}
            data={products}
            emptyMessage="No products found. Add your first product!"
            currentPage={currentPage}
            totalPages={totalPages}
            isLoading={loading}
            onLoadMore={(nextPage) => {

              dispatch(getAllProducts({ page: nextPage, limit: 10 }));
            }}
          />
        </div>
      )}

      <ProductModal
        showModal={showModal}
        handleCloseModal={handleCloseModal}
        handleAddProduct={handleAddProduct}
        newProduct={newProduct}
        setNewProduct={setNewProduct}
        isClosing={isClosing}
      />
    </div>
  );
};

export default Product;