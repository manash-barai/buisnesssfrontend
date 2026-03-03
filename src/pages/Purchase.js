import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  getAllPurchases,
  createPurchase,
  deletePurchaseById,
  updatePurchaseById
} from '../features/purchase/purchaseSlice';
import { FaEdit, FaTrash, FaArrowRight, FaPlus, FaSearch, FaRedo, FaShoppingBasket, FaCalendarAlt, FaUserTie, FaBoxOpen, FaBoxes, FaTags, FaCalculator, FaCheckCircle, FaExclamationCircle, FaUserCircle, FaCogs } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import DataTable from '../components/DataTable';
import PurchaseModal from '../components/PurchaseModal';

// Conversion constants
const KG_PER_MON = 40; // 1 mon = 40 kg
const KG_PER_BAG = 50; // 1 bag = 50 kg
const TRAY_PER_PATI = 7; // 1 pati = 7 tray


const Purchase = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { data: purchases = [], loading, error,currentPage, totalPages  } = useSelector((state) => state?.purchase);
  const { data: products = []} = useSelector((state) => state?.product);
  const [isClosing, setIsClosing] = useState(false);
  const [purchaseUpdateId, setPurchaseUpdateId] = useState(null);
  const [unitCategory, setUnitCategory] = useState("KG");

  const [purchasesList, setPurchasesList] = useState([]);
  const [paymentOption, setPaymentOption] = useState(null);
  const [currentPayment, setCurrentPayment] = useState([]);
  const [newPayment, setNewPayment] = useState(0);
  const [paymentDate, setPaymentDate] = useState(new Date());



  const [newPurchase, setNewPurchase] = useState({
    supplier: '',
    products: null,
    quantity: '',
    Price_PerUnit: '',
    totalAmount: '',
    paidAmount: [],
    paidAmountValue: '', // for modal input
    dueAmount: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    totalBag: '',
  });

  const [showModal, setShowModal] = useState(false);
  const [filterSupplier, setFilterSupplier] = useState('');
  const [filterProduct, setFilterProduct] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  // Helper function to format numbers
  const formatNumber = (num) => {
    if (num === null || num === undefined || isNaN(num) || num === '') return '';
    const parsedNum = parseFloat(num);
    return parsedNum.toFixed(2);
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
      case 'tray':
        return `${formatNumber(quantity)} tray (${formatNumber(quantity / TRAY_PER_PATI)} pati)`;
      case 'bag':
        return `${formatNumber(quantity)} bag (${formatNumber(quantity * KG_PER_BAG)} kg)`;
      default:
        return formatNumber(quantity);
    }
  };

  // Function to format price display based on unit category
  const formatPriceDisplaySpecial = (price, unitCategory) => {



    switch (unitCategory) {
      case 'KG':
        return `₹${formatNumber(price) * 40} / mon`;
      case 'tray':
        return `₹${formatNumber(price) * 7} / Pt`;
      case 'bag':
        return `₹${formatNumber(price)}/bag`;
      default:
        return `₹${formatNumber(price)}`;
    }
  };
  const formatPriceDisplay = (price, productId) => {

    switch (productId) {
      case 'KG':
        return `₹${formatNumber(price)} / Kg`;
      case 'tray':
        return `₹${formatNumber(price)} / Tr`;
      case 'bag':
        return `₹${formatNumber(price)}/Bag`;
      default:
        return `₹${formatNumber(price)}`;
    }
  };

  // Calculate totals
  const totalPaid = purchases.reduce((acc, purchase) =>
    acc + (purchase.paidAmount || []).reduce((sum, p) => sum + p.amount, 0), 0);
  const totalDue = purchases.reduce((acc, purchase) => acc + (purchase.dueAmount || 0), 0);
  const totalAmount = totalPaid + totalDue;

  // Sort purchases by date (newest first)


  useEffect(() => {
    dispatch(getAllPurchases({}));
  }, [dispatch]);

  // Filter handlers
  const handleSearch = () => {
    dispatch(getAllPurchases({
      supplier: filterSupplier,
      product: filterProduct,
      startDate: filterStartDate,
      endDate: filterEndDate,
    }));
  };

  const handleReset = () => {
    setFilterSupplier('');
    setFilterProduct('');
    setFilterStartDate('');
    setFilterEndDate('');
    dispatch(getAllPurchases({}));
  };

  // Input change handler
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    const processedValue = value === '' ? null : value;

    setNewPurchase(prev => {
      let updated = { ...prev, [name]: processedValue };

      if (unitCategory === 'bag' && name === 'quantity' && processedValue !== null) {
        updated.totalBag = processedValue;
      }

      if (name === 'paidAmountValue') {
        const payment = parseFloat(processedValue) || 0;
        if (payment > 0) {
          updated.paidAmount = [{ amount: payment, Date: new Date() }];
        } else {
          updated.paidAmount = [];
        }
      }

      // Calculate total and due amounts
      if (['quantity', 'Price_PerUnit', 'paidAmountValue'].includes(name)) {
        const quantity = parseFloat(updated.quantity) || 0;
        const price = parseFloat(updated.Price_PerUnit) || 0;
        const total = quantity * price;
        const totalPaid = (updated.paidAmount || []).reduce((acc, p) => acc + p.amount, 0);
        const due = total - totalPaid;

        updated.totalAmount = formatNumber(total);
        updated.dueAmount = formatNumber(due);
      }

      return updated;
    });
  };

  // Add/update purchase
  const handleAddPurchase = async () => {
    const purchaseData = {
      supplier: newPurchase.supplier,
      products: newPurchase.products?._id,
      quantity: Number(newPurchase.quantity || 0),
      Price_PerUnit: Number(newPurchase.Price_PerUnit || 0),
      totalAmount: Number(newPurchase.totalAmount || 0),
      paidAmount: newPurchase.paidAmount,
      dueAmount: Number(newPurchase.dueAmount || 0),
      purchaseDate: newPurchase.purchaseDate,
      totalBag: Number(newPurchase.totalBag || 0),
      createdBy: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user'))._id : ''
    };
    if (purchaseUpdateId) {
      await dispatch(updatePurchaseById({ id: purchaseUpdateId, purchaseData }));
    } else {
      await dispatch(createPurchase(purchaseData));
    }

    dispatch(getAllPurchases({}));
    resetForm();
    setShowModal(false);
  };

  // Reset form
  const resetForm = () => {
    setNewPurchase({
      supplier: '',
      products: null,
      quantity: '',
      Price_PerUnit: '',
      totalAmount: '',
      paidAmount: [],
      paidAmountValue: '',
      dueAmount: '',
      totalBag: '',
      purchaseDate: new Date().toISOString().split('T')[0],
    });
    setPurchaseUpdateId(null);
  };

  // Close modal with animation
  const handleCloseModal = () => {
    setIsClosing(true);
    resetForm();
    setTimeout(() => {
      setShowModal(false);
      setIsClosing(false);
    }, 200);
  };

  // Action handlers
  const handleDelete = (id) => dispatch(deletePurchaseById(id));
  const handlePurchaseJourney = (id) => navigate(`/purchases/${id}`);
  const openModal = () => setShowModal(true);

  const handleUpdate = (purchase) => {
    setPurchaseUpdateId(purchase._id);
    const totalPaid = (purchase.paidAmount || []).reduce((sum, p) => sum + p.amount, 0);
    setNewPurchase({
      supplier: purchase.supplier._id,
      products: purchase.products,
      quantity: purchase.quantity || '',
      Price_PerUnit: purchase.Price_PerUnit || '',
      totalAmount: purchase.totalAmount || '',
      paidAmount: purchase.paidAmount || [],
      paidAmountValue: totalPaid, // for the modal input
      dueAmount: purchase.dueAmount || '',
      purchaseDate: purchase.purchaseDate.split('T')[0],
    });
    setShowModal(true);
  };

  // Table columns
  const columns = React.useMemo(
    () => [
      {
        Header: () => <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><FaCalendarAlt /> Date</div>,
        accessor: 'purchaseDate',
        Cell: ({ value }) => new Date(value).toLocaleDateString(),
        width: 100
      },
      {
        Header: () => <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><FaUserTie /> Supplier</div>,
        accessor: 'supplier.name',
        Cell: ({ value }) => <span className="font-medium">{value}</span>
      },
      {
        Header: () => <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><FaBoxOpen /> Product</div>,
        accessor: 'products',
        Cell: ({ value, row }) => (
          <div>
            <span className="font-medium">{value?.name || 'N/A'}</span>
            <div className="text-xs text-gray-500">
              {getProductUnitCategory(value?._id) && `(${getProductUnitCategory(value?._id)})`}
            </div>
          </div>
        )
      },
      {
        Header: () => <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><FaBoxes /> Quantity</div>,
        accessor: 'quantity',
        Cell: ({ value, row }) => (
          <div>
            {formatQuantityDisplay(value, row.original.products?._id)}
          </div>
        )
      },
      {
        Header: () => <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><FaTags /> Price</div>,
        accessor: 'Price_PerUnit',
        Cell: ({ value, row }) => (
          <div>
            {formatPriceDisplay(value, row.original.products.unitCategory)}
          </div>
        )
      },
      {
        Header: () => <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><FaTags /> Price</div>,
        accessor: 'Price_PerUnitSpecial',
        Cell: ({ value, row }) => (
          <div>
            {formatPriceDisplaySpecial(value, row.original.products.unitCategory)}
          </div>
        )
      },
      {
        Header: () => <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><FaCalculator /> Total</div>,
        accessor: 'totalAmount',
        Cell: ({ value }) => `₹${formatNumber(value)}`
      },
      {
        Header: () => (
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <FaCheckCircle /> Paid
          </div>
        ),
        accessor: 'payment',
        Cell: ({ value }) => value   // ✅ shows "ddd"
      },
      {
        Header: () => (
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <FaExclamationCircle /> Due
          </div>
        ),
        accessor: 'dueAmount',
        Cell: ({ value }) => (
          <div
            className={`w-full h-full px-5 py-2 font-bold text-white ${value === 0 ? 'bg-green-800' : 'bg-red-800'
              }`}
          >
            ₹{formatNumber(value)}
          </div>
        )
      },

      // {
      //   Header: () => <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><FaUserCircle /> Created By</div>,
      //   accessor: 'createdBy',
      //   Cell: ({ value }) => (
      //     <span className="font-medium">{value?.name || 'N/A'}</span>
      //   )
      // },
      // {
      //   Header: () => <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><FaCogs /> Actions</div>,
      //   accessor: 'actions',
      //   Cell: ({ row }) => (
      //     <div className="flex gap-3">
      //       <button onClick={() => handleUpdate(row.original)} className="text-blue-600 hover:text-blue-800">
      //         <FaEdit />
      //       </button>
      //       <button onClick={() => handleDelete(row.original._id)} className="text-primary-600 hover:text-primary-800">
      //         <FaTrash />
      //       </button>
      //       <button onClick={() => handlePurchaseJourney(row.original._id)} className="text-green-600 hover:text-green-800">
      //         <FaArrowRight />
      //       </button>
      //     </div>
      //   ),
      //   width: 120
      // }
    ],
    [products]
  );

  const handleSavePayment = async () => {
    const purchaseToUpdate = purchases.find(p => p._id === paymentOption);
    if (!purchaseToUpdate) return;

    const amountToAdd = parseFloat(newPayment) || 0;
    if (amountToAdd <= 0) return;

    const paymentObj = { amount: amountToAdd, paymentDate: paymentDate };
    const updatedPaidAmount = [...(purchaseToUpdate.paidAmount || []), paymentObj];
    const totalPaid = updatedPaidAmount.reduce((sum, p) => sum + p.amount, 0);
    const newDueAmount = purchaseToUpdate.totalAmount - totalPaid;

    const purchaseData = {
      supplier: purchaseToUpdate.supplier._id,
      products: purchaseToUpdate.products._id,
      quantity: purchaseToUpdate.quantity,
      Price_PerUnit: purchaseToUpdate.Price_PerUnit,
      totalAmount: purchaseToUpdate.totalAmount,
      paidAmount: updatedPaidAmount,
      dueAmount: newDueAmount,
      purchaseDate: purchaseToUpdate.purchaseDate,
      totalBag: purchaseToUpdate.totalBag,
      createdBy: purchaseToUpdate.createdBy?._id || (localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user'))._id : '')
    };

    await dispatch(updatePurchaseById({ id: paymentOption, purchaseData }));
    setPaymentOption(null);
    dispatch(getAllPurchases({}));
  };


  const handlePaymentClick = (purchase) => {
    setPaymentOption(purchase._id);
    setCurrentPayment(purchase.paidAmount || []);
    // You can open a payment modal here if needed
  }

  useEffect(() => {
    const structureData = purchases.map((value) => ({
      ...value, // keep all fields intact
      payment: <button onClick={() => handlePaymentClick(value)}>{(value.paidAmount || []).reduce((sum, p) => sum + p.amount, 0)}</button>,
    }));

    setPurchasesList(structureData);
  }, [purchases]);
  
  return (
    <div className="container mx-auto p-4 bg-white">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FaShoppingBasket /> Purchase Records
        </h1>
        <div className="flex gap-3">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition"
          >
            <FaRedo /> Refresh
          </button>
          <button
            onClick={openModal}
            className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
          >
            <FaPlus /> New Purchase
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6 grid grid-cols-1 md:grid-cols-4 gap-4 hidden">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
          <input
            type="text"
            value={filterSupplier}
            onChange={(e) => setFilterSupplier(e.target.value)}
            className="w-full border px-3 py-2 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Search supplier..."
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
      
        <>
          <DataTable
            columns={columns}
            data={purchasesList}
            currentPage={currentPage}
            totalPages={totalPages}
            isLoading={loading}
            onLoadMore={(nextPage) => {
              
              dispatch(getAllPurchases({ page: nextPage, limit: 10 }));
            }}
          />
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg shadow border">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Total Purchases</h3>
              <p className="text-2xl font-bold">₹{formatNumber(totalAmount)}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Total Paid</h3>
              <p className="text-2xl font-bold text-green-600">₹{formatNumber(totalPaid)}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Total Due</h3>
              <p className="text-2xl font-bold text-red-600">₹{formatNumber(totalDue)}</p>
            </div>
          </div>
        </>
      

      {/* Purchase Modal */}
      <PurchaseModal
        showModal={showModal}
        handleCloseModal={handleCloseModal}
        handleAddPurchase={handleAddPurchase}
        newPurchase={newPurchase}
        handleInputChange={handleInputChange}
        isFormValid={true}
        isClosing={isClosing}
        purchaseUpdateId={purchaseUpdateId}
        handleUnitCategoryChange={(value) => { setUnitCategory(value) }}
      />

      {paymentOption && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h2 className="text-xl font-semibold text-gray-800">Payment History</h2>
              <button
                onClick={() => setPaymentOption(null)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                ✕
              </button>
            </div>

            {/* History List */}
            <ul className="max-h-64 overflow-y-auto space-y-3 pr-2">
              {currentPayment.map((payment, index) => (
                <li
                  key={index}
                  className="bg-gray-50 rounded-xl border flex flex-col gap-1 p-3 hover:shadow transition"
                >
                  <span className="text-base font-semibold text-primary-600">
                    ₹{formatNumber(payment.amount)}
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(payment.paymentDate).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>

            {/* New Payment Form */}
            <div className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="paymentAmount"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  New Payment Amount
                </label>
                <input
                  type="number"
                  id="paymentAmount"
                  value={newPayment}
                  onChange={(e) => setNewPayment(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm 
                     focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="paymentDate"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Payment Date
                </label>
                <input
                  type="date"
                  id="paymentDate"
                  value={paymentDate.toISOString().split("T")[0]}
                  onChange={(e) => setPaymentDate(new Date(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm 
                     focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                />
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setPaymentOption(null)}
                className="px-4 py-2 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePayment}
                className="px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
              >
                Save
              </button>
            </div>
          </div>
        </div>

      )}
    </div>
  );
};



export default Purchase;