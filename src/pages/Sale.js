import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  getAllSales,
  createSale,
  deleteSaleById,
  updateSaleById
} from '../features/sale/saleSlice';
import { FaTrash, FaArrowRight, FaPlus, FaSearch, FaRedo, FaShoppingCart, FaCalendarAlt, FaUser, FaBoxOpen, FaBoxes, FaTags, FaCalculator, FaCheckCircle, FaExclamationCircle, FaUserCircle, FaCogs } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import DataTable from '../components/DataTable';


// Conversion constants
const KG_PER_MON = 40; // 1 mon = 40 kg
const KG_PER_BAG = 50; // 1 bag = 50 kg
const TRAY_PER_PATI = 7; // 1 pati = 7 tray

const Sale = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { data: sales = [], loading, error } = useSelector((state) => state.sale);
  const { data: products = [] } = useSelector((state) => state.product);
  const { data: customers = [] } = useSelector((state) => state.customer);
  const [filterCustomer, setFilterCustomer] = useState('');
  const [filterProduct, setFilterProduct] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [saleList, setSaleList] = useState([]);

  useEffect(() => {
    const formatData = sales.map(sale => ({
      ...sale,
      productList: sale.products.map(
        product => products.find(p => p._id === product.product)?.name
      ) || [],
      quantityList: sale.products.map(product => ({
        quantity: product.quantity,
        unitCategory: products.find(p => p._id === product.product)?.unitCategory,
        pricePerUnit: product.unitPrice
      })) || [],

      totalAmountList: sale.products.map(product => product.totalAmount) || []

    }));

    setSaleList(formatData);
  }, [sales, products]);


  // Helper function to format numbers
  const formatNumber = (num) => {
    if (num === null || num === undefined || isNaN(num) || num === '') return '';
    const parsedNum = parseFloat(num);
    return parsedNum % 1 === 0 ? parsedNum.toString() : parsedNum.toFixed(2);
  };

  // Function to get product unit category
  const getProductUnitCategory = (productId) => {
    const product = products.find(p => p._id === productId);
    return product?.unitCategory || '';
  };

  // Function to format quantity display based on unit category
  const formatQuantityDisplay = (quantity, productId) => {
    const unitCategory = getProductUnitCategory(productId);
    switch (unitCategory) {
      case 'Kg':
        return `${formatNumber(quantity)} kg (${formatNumber(quantity / KG_PER_MON)} mon)`;
      case 'Tray':
        return `${formatNumber(quantity)} tray (${formatNumber(quantity / TRAY_PER_PATI)} pati)`;
      case 'Bag':
        return `${formatNumber(quantity)} bag (${formatNumber(quantity * KG_PER_BAG)} kg)`;
      default:
        return formatNumber(quantity);
    }
  };

  // Function to format price display based on unit category
  const formatPriceDisplay = (price, productId) => {
    const unitCategory = getProductUnitCategory(productId);
    switch (unitCategory) {
      case 'Kg':
        return `₹${formatNumber(price)}/kg`;
      case 'Tray':
        return `₹${formatNumber(price)}/tray`;
      case 'Bag':
        return `₹${formatNumber(price)}/bag`;
      default:
        return `₹${formatNumber(price)}`;
    }
  };

  // Calculate totals
  const totalPaid = sales.reduce((acc, sale) =>
    acc + (sale.paidAmountOnline || 0) + (sale.paidAmountOffline || 0), 0);
  const totalDue = sales.reduce((acc, sale) => acc + (sale.dueAmount || 0), 0);
  const totalAmount = totalPaid + totalDue;

  // Sort sales by date (newest first)
  const sortedSales = [...sales].sort((a, b) =>
    new Date(b.saleDate) - new Date(a.saleDate));

  useEffect(() => {
    dispatch(getAllSales({}));
  }, [dispatch]);

  // Filter handlers
  const handleSearch = () => {
    dispatch(getAllSales({
      customer: filterCustomer,
      product: filterProduct,
      startDate: filterStartDate,
      endDate: filterEndDate,
    }));
  };

  const handleReset = () => {
    setFilterCustomer('');
    setFilterProduct('');
    setFilterStartDate('');
    setFilterEndDate('');
    dispatch(getAllSales({}));
  };
  const handleSaleJourney = (saleId) => {
    navigate(`/sales/${saleId}/return`);
  }

  console.log("saleList", saleList);



  // Table columns
  const columns = React.useMemo(
    () => [
      {
        Header: () => <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><FaCalendarAlt /> Date</div>,
        accessor: 'saleDate',
        Cell: ({ value }) => new Date(value).toLocaleDateString(),
        width: 100
      },
      {
        Header: () => <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><FaUser /> Customer</div>,
        accessor: 'customer.name',
        Cell: ({ value }) => <span className="font-medium">{value}</span>
      },
      {
        Header: () => <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><FaBoxOpen /> Product</div>,
        accessor: 'productList',
        Cell: ({ value, row }) => (
          <ul className="list-disc list-inside">
            {value.map((item, i) => (
              <ol key={i}>
                <span className="font-medium"> {item}</span>
              </ol>
            ))}
          </ul>
        )
      },
      {
        Header: () => <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><FaBoxes /> Quantity</div>,
        accessor: 'quantityList',
        Cell: ({ value, row }) => (
          <ul className="list-disc list-inside">
            {value.map((item, i) => (
              <ol key={i}>
                <span className="font-medium">  {item.quantity} {item.unitCategory} x {item.pricePerUnit} </span>
              </ol>
            ))}
          </ul>
        )
      },
      {
        Header: () => <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><FaTags /> Price</div>,
        accessor: 'totalAmountList',
        Cell: ({ value, row }) => (
          <ul className="list-disc list-inside">
            {value.map((item, i) => (
              <ol key={i}>
                <span className="font-medium"> ₹ {item} /- </span>
              </ol>
            ))}
          </ul>
        )
      },

      {
        Header: () => <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><FaCalculator /> Total</div>,
        accessor: 'totalAmount',
        Cell: ({ value }) => `₹${formatNumber(value)}`
      },
      {
        Header: () => <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><FaCheckCircle /> Paid</div>,
        accessor: 'paid',
        Cell: ({ row }) => {
          const paidAmount = row.original.paidAmount || 0;
          const totalAmount = row.original.totalAmount || 0;
          const isFullyPaid = paidAmount === totalAmount;

          return (
            <div className={`flex items-center justify-center p-1 rounded-md min-w-[80px] ${isFullyPaid
                ? 'bg-green-100 border border-green-600 text-green-800'
                : 'bg-gray-50 border border-gray-200 text-gray-600'
              }`}>
              <span className="font-medium">
                ₹{formatNumber(paidAmount)}
              </span>
            </div>
          );
        },
        width: 100
      },
      {
        Header: () => <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><FaExclamationCircle /> Due</div>,
        accessor: 'dueAmount',
        Cell: ({ value }) => {
          const dueAmount = value || 0;
          const hasDue = dueAmount > 0;

          return (
            <div className={`flex items-center justify-center p-1 rounded-md min-w-[80px] ${hasDue
                ? 'bg-red-100 border-2 border-red-600 text-red-800'
                : 'bg-gray-50 border border-gray-200 text-gray-600'
              }`}>
              <span className="font-medium">
                ₹{formatNumber(dueAmount)}
              </span>
            </div>
          );
        },
        width: 100
      },
      {
        Header: () => <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><FaUserCircle /> Created By</div>,
        accessor: 'createdBy',
        Cell: ({ value }) => (
          <span className="font-medium">{value?.name || 'N/A'}</span>
        )
      },
      {
        Header: () => <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><FaCogs /> Return</div>,
        accessor: 'actions',
        Cell: ({ row }) => (
          <div className="flex gap-3">

            <button onClick={() => handleSaleJourney(row.original._id)} className="text-green-600 hover:text-green-800">
              <FaArrowRight />
            </button>
          </div>
        ),
        width: 120
      }
    ],
    [products, handleSaleJourney]
  );

  return (
    <div className="container mx-auto p-4 bg-white">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FaShoppingCart /> Sale Records
        </h1>
        <div className="flex gap-3">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition"
          >
            <FaRedo /> Refresh
          </button>
          <button
            onClick={() => navigate('/sales/new')}
            className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
          >
            <FaPlus /> New Sale
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
          <input
            type="text"
            value={filterCustomer}
            onChange={(e) => setFilterCustomer(e.target.value)}
            className="w-full border px-3 py-2 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Search customer..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
          <input
            type="text"
            value={filterProduct}
            onChange={(e) => setFilterProduct(e.target.value)}
            className="w-full border px-3 py-2 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Search product..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
          <input
            type="date"
            value={filterStartDate}
            onChange={(e) => setFilterStartDate(e.target.value)}
            className="w-full border px-3 py-2 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
          <input
            type="date"
            value={filterEndDate}
            onChange={(e) => setFilterEndDate(e.target.value)}
            min={filterStartDate}
            className="w-full border px-3 py-2 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            disabled={!filterStartDate}
          />
        </div>
        <div className="md:col-span-4 flex justify-end gap-3">
          <button
            onClick={handleSearch}
            className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
          >
            <FaSearch /> Search
          </button>
        </div>
      </div>

      {/* Data Table */}
      {loading ? (
        <div className="text-center py-8">Loading sales...</div>
      ) : error ? (
        <div className="text-center text-primary-600 py-8">Error: {error}</div>
      ) : (
        <>
          <DataTable
            columns={columns}
            data={saleList}
            className="border rounded-lg overflow-hidden shadow-sm "
          />

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg shadow border">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Total Sales</h3>
              <p className="text-2xl font-bold">₹{formatNumber(totalAmount)}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Total Paid</h3>
              <p className="text-2xl font-bold text-green-600">₹{formatNumber(totalPaid)}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Total Due</h3>
              <p className="text-2xl font-bold text-primary-600">₹{formatNumber(totalDue)}</p>
            </div>
          </div>
        </>
      )}


    </div>
  );
};

export default Sale;
