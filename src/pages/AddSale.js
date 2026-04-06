
// src/pages/AddSale.js

import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { createSale } from '../features/sale/saleSlice';
import { getAllCustomers, createCustomer } from '../features/customer/customerSlice';
import { getAllProducts } from '../features/product/productSlice';
import { FaPlus, FaFileInvoice } from 'react-icons/fa';
import axios from 'axios';
import { debounce } from 'lodash';

// Import the new components
import CustomerInfo from '../components/addSale/CustomerInfo';
import SaleItem from '../components/addSale/SaleItem';
import Totals from '../components/addSale/Totals';
import DagImageUpload from '../components/addSale/DagImageUpload';
import CustomerModal from '../components/CustomerModal';
import SalePrintPage from '../components/Receipt';

/**
 * This is the main page for adding a new sale.
 * It brings together all the smaller components and manages the overall state.
 */
const AddSale = ({edit}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Get data from the Redux store
  const { data: customers = [] } = useSelector((state) => state.customer);
  const { data: products = [] } = useSelector((state) => state.product);

  // State for customer information
  const [customerId, setCustomerId] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isSearchingCustomer, setIsSearchingCustomer] = useState(false);
  const [customerTotalDue, setCustomerTotalDue] = useState(0);
  const [showSalesHistory, setShowSalesHistory] = useState(false);
  const [billNumberFilter, setBillNumberFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [customerNotFound, setCustomerNotFound] = useState(false);
  const [notes, setNotes] = useState('');
  // State for customer modal
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', address: '', whatsApp: '' });
  const [isFormValid, setIsFormValid] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Effect to read customer ID from URL query parameter
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const cusid = queryParams.get('cusid');
    if (cusid) {
      setCustomerId(cusid);
    }
  }, [location.search]);

  // State for sale items
  const [saleItems, setSaleItems] = useState([
    {
      product: '',
      productDetails: null,
      lot: { _id: '', latNumber: '', supplier: '', pendingQuantity: 0 },
      quantity: '',
      unitPrice: '',
      discount: '',
      totalAmount: '',
      paidOnline: '',
      paidOffline: '',
      dueAmount: '',
      displayQuantity: '',
      displayUnit: 'kg',
      bagQuantity: '',
      unitPriceMon: '',
      unitPriceKG: '',
      unitPriceBag: '',
      unitPricePeti: '',
      totalBags: ''
    },
  ]);

  // State for totals and payment
  const [discountTotal, setDiscountTotal] = useState(0);
  const [totalPayment, setTotalPayment] = useState('');

  // State for DAG image
  const [dagImage, setDagImage] = useState(null);

  // State for available lots
  const [lastList, setLastList] = useState({ index: null, lat: [] });

  // State for receipt
  const [billData, setBillData] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);

  // Fetch initial data (customers and products) when the component loads
  useEffect(() => {
    dispatch(getAllCustomers());
    dispatch(getAllProducts());
  }, [dispatch]);

  // When a customer is selected, find their details and total due amount
  useEffect(() => {
    if (customerId) {
      const customer = customers.find((c) => c._id === customerId);
      setSelectedCustomer(customer);
      // In a real app, you might need to fetch this from the backend
      setCustomerTotalDue(customer?.totalDue || 0);
    }
  }, [customerId, customers]);

  // Validate the new customer form
  useEffect(() => {
    const { name, phone, address } = newCustomer;
    setIsFormValid(name.trim() !== '' && phone.trim() !== '' && address.trim() !== '');
  }, [newCustomer]);

  // Handlers for the customer modal
  const handleOpenCustomerModal = () => {
    setNewCustomer({ name: '', phone: '', address: '', whatsApp: '' });
    setShowCustomerModal(true);
  };

  const handleCloseCustomerModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowCustomerModal(false);
      setIsClosing(false);
    }, 500); // Animation duration
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCustomer({ ...newCustomer, [name]: value });
  };

  const handleAddCustomer = async () => {
    if (!isFormValid) return;
    const resultAction = await dispatch(createCustomer(newCustomer));
    if (createCustomer.fulfilled.match(resultAction)) {
      const newCustomerData = resultAction.payload;
      dispatch(getAllCustomers()); // Refresh the customer list
      setCustomerId(newCustomerData._id);
      setSelectedCustomer(newCustomerData);
      setCustomerSearch(newCustomerData.name);
      setIsSearchingCustomer(false);
      handleCloseCustomerModal();
    }
  };

  /**
   * This function is called whenever a field in a sale item is changed.
   * It updates the state for that item and recalculates amounts.
   */

  const handleItemChangeBlur = (index, e) => {
    const { name, value } = e.target;
    if (name !== 'quantity') return;

    const items = [...saleItems];
    const item = items[index];
    const product = item.productDetails;

    let baseValue;

    //  Check if "+" exists and sum the numbers
    if (value.includes("+")) {
      baseValue = value
        .split("+")
        .map(num => parseFloat(num.trim()) || 0)
        .reduce((acc, curr) => acc + curr, 0);
    } else {
      baseValue = parseFloat(value) || 0;
    }

    // ✅ Limit by available quantity
    const available = item.lot?.pendingQuantity || Infinity;
    if (baseValue > available) baseValue = available;

    // ✅ Update item values
    item.quantity = baseValue.toString();

    if (product?.unitCategory === 'KG') {
      item.displayQuantity = (baseValue / 40).toString();
    } else if (product?.unitCategory === 'bag') {
      item.bagQuantity = baseValue.toString();
    } else if (product?.unitCategory === 'tray') {
      item.displayQuantity = (baseValue / 7).toString();
    }

    // ✅ Calculate totals
    const quantity = parseFloat(item.quantity) || 0;
    const unitPrice = parseFloat(item.unitPrice) || 0;
    const discount = parseFloat(item.discount) || 0;
    const total = quantity * unitPrice - discount;
    const paidOnline = parseFloat(item.paidOnline) || 0;
    const paidOffline = parseFloat(item.paidOffline) || 0;
    const due = total - paidOnline - paidOffline;

    item.totalAmount = total.toFixed(2);
    item.dueAmount = due.toFixed(2);

    // ✅ Update Notes
    if (value.includes("+")) item.lot && item.lot.latNumber && setNotes(item.lot?.latNumber + " :- " + value);

    // ✅ Update state
    items[index] = item;
    setSaleItems(items);
  };

  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const items = [...saleItems];
    const item = items[index];
    const product = item.productDetails;

    if (name === 'product') {
      const newProduct = products.find(p => p._id === value);
      items[index] = {
        ...saleItems[index],
        product: value,
        productDetails: newProduct,
        lot: { _id: '', latNumber: '', supplier: '', pendingQuantity: 0 },
        quantity: '',
        unitPrice: '',
        discount: '',
        totalAmount: '',
        paidOnline: '',
        paidOffline: '',
        dueAmount: '',
        displayQuantity: '',
        bagQuantity: '',
        unitPriceMon: '',
        unitPriceBag: '',
        unitPricePeti: '',
        totalBags: ''
      };
      setLastList({ index: null, lat: [] });
    } else if (name === 'totalBags') {
      items[index].totalBags = value.replace(/[^0-9]/g, '');
    } else if (!product || !['quantity', 'displayQuantity', 'bagQuantity', 'unitPrice', 'unitPriceMon', 'unitPriceKG', 'unitPriceBag', 'unitPricePeti', 'discount', 'paidOnline', 'paidOffline'].includes(name)) {
      item[name] = value;
    } else {
      const available = item.lot.pendingQuantity;
      let newQuantityInBase = parseFloat(item.quantity) || 0;

      const enteredValue = parseFloat(value) || 0;

      if (['quantity', 'displayQuantity', 'bagQuantity'].includes(name)) {
        let baseValue;
        if (name === 'quantity') {
          let values = value;
          baseValue = String(values);


        } else if (name === 'displayQuantity') {

          baseValue = product.unitCategory === 'tray' ? enteredValue * 7 : enteredValue * 40;
        } else if (name === 'bagQuantity') {
          baseValue = enteredValue / 50;
        }

        if (baseValue > available) {
          baseValue = available;
        }
        newQuantityInBase = baseValue;

        item.quantity = newQuantityInBase.toString();
        if (product.unitCategory === 'KG') {
          item.displayQuantity = (newQuantityInBase / 40).toString();
        } else if (product.unitCategory === 'bag') {
          item.bagQuantity = (newQuantityInBase * 50).toString();
        } else if (product.unitCategory === 'tray') {
          item.displayQuantity = (newQuantityInBase / 7).toString();
        }

        if (value === '') {
          item.quantity = '';
          item.displayQuantity = '';
          item.bagQuantity = '';
        }
      } else if (['unitPriceMon', 'unitPriceBag', 'unitPricePeti', 'unitPriceKG'].includes(name)) {
        let calculatedPrice;
        if (value.includes('+')) {
          calculatedPrice = value.split('+').reduce((acc, curr) => acc + (parseFloat(curr) || 0), 0);
          item[name] = calculatedPrice.toString();
        } else {
          calculatedPrice = parseFloat(value) || 0;
          item[name] = value;
        }

        const priceValue = calculatedPrice;
        if (name === 'unitPriceMon') {
          item.unitPrice = (priceValue / 40).toFixed(2);
          item.unitPriceKG = (priceValue / 40).toFixed(2);
        } else if (name === 'unitPriceBag') {
          item.unitPrice = (priceValue).toFixed(2);
        } else if (name === 'unitPricePeti') {
          item.unitPrice = (priceValue).toFixed(2);

        } else if (name === 'unitPriceKG') {
          item.unitPrice = priceValue.toFixed(2);
          item.unitPriceMon = (priceValue * 40).toFixed(2);
        }
      } else {
        item[name] = value;
      }
    }

    const quantity = parseFloat(items[index].quantity) || 0;
    const unitPrice = parseFloat(items[index].unitPrice) || 0;
    const discount = parseFloat(items[index].discount) || 0;
    const total = quantity * unitPrice - discount;
    const paidOnline = parseFloat(items[index].paidOnline) || 0;
    const paidOffline = parseFloat(items[index].paidOffline) || 0;
    const due = total - paidOnline - paidOffline;

    items[index].totalAmount = total.toFixed(2);
    items[index].dueAmount = due.toFixed(2);

    setSaleItems(items);
  };

  /**
   * Adds a new, empty item to the sale.
   */
  const handleAddItem = () => {
    setSaleItems([
      ...saleItems,
      {
        product: '',
        productDetails: null,
        lot: { _id: '', latNumber: '', supplier: '', pendingQuantity: 0 },
        quantity: '', unitPrice: '', discount: '', totalAmount: '',
        paidOnline: '', paidOffline: '', dueAmount: '',
        displayQuantity: '', displayUnit: 'kg', bagQuantity: '',
        unitPriceMon: '', unitPriceKG: '', unitPriceBag: '', unitPricePeti: '',
        totalBags: ''
      },
    ]);
  };

  /**
   * Removes an item from the sale.
   */
  const handleRemoveItem = (index) => {
    const items = [...saleItems];
    items.splice(index, 1);
    setSaleItems(items);
  };

  /**
   * This function is called when the product dropdown for an item is changed.
   * It fetches the available lots for the selected product.
   */
  const debouncedLatChange = useCallback(
    debounce(async (index, value) => {
      const product = products.find((p) => p._id === value);
      if (!product) return;
      
      try {
        const page = 1;
        const limit = 10;

        const getLatList = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/api/lats?id=${product._id}&page=${page}&limit=${limit}`
        );
        const formattedData = getLatList.data?.lats?.map((item) => ({
          _id: item._id,
          latNumber: item.latNumber,
          supplier: item.supplier?.name || 'N/A',
          pendingBags: item.pendingBag,
          pendingQuantity: item.pendingQuantity,
          unit: item.unit,
          date: item.purchase?.purchaseDate,
        }));

        setLastList({ index, lat: formattedData });
      } catch (error) {
        console.log(error);
      }
    }, 500),
    [products]
  );

  const handleProductChange = (index, e) => {
    const { value } = e.target;
    const items = [...saleItems];
    const product = products.find((p) => p._id === value);

    items[index] = {
      ...saleItems[index],
      product: value,
      productDetails: product,
      lot: { _id: '', latNumber: '', supplier: '', pendingQuantity: 0 },
      quantity: '',
      unitPrice: '',
      discount: '',
      totalAmount: '',
      paidOnline: '',
      paidOffline: '',
      dueAmount: '',
      displayQuantity: '',
      bagQuantity: '',
      unitPriceMon: '',
      unitPriceKG: '',
      unitPriceBag: '',
      unitPricePeti: '',
      totalBags: ''
    };

    if (product.unitCategory === 'KG') {
      items[index].displayUnit = 'kg';
    } else if (product.unitCategory === 'bag') {
      items[index].displayUnit = 'bag';
    } else if (product.unitCategory === 'tray') {
      items[index].displayUnit = 'tray';
    }

    setSaleItems(items);
    setLastList({ index: null, lat: [] });
    debouncedLatChange(index, value);
  };

  /**
   * This function is called when a lot is selected for an item.
   */
  const handleLotClick = (lotId, index) => {
    const items = [...saleItems];
    const selectedLot = lastList.lat.find((lot) => lot._id === lotId);
    const product = items[index].productDetails;

    if (!selectedLot || !product) return;

    const pendingQuantity = selectedLot.pendingQuantity;

    items[index].lot = {
      _id: lotId,
      latNumber: selectedLot.latNumber,
      supplier: selectedLot.supplier,
      pendingQuantity: pendingQuantity,
      pendingBags: selectedLot.pendingBags,
    };

    items[index].quantity = '';
    items[index].unitPrice = '';
    items[index].unitPriceMon = '';
    items[index].unitPriceKG = '';
    items[index].unitPriceBag = '';
    items[index].unitPricePeti = '';
    items[index].displayQuantity = '';
    items[index].bagQuantity = '';

    setSaleItems(items);
    setLastList({ index: null, lat: [] });
  };

  /**
   * Removes the selected lot from an item.
   */
  const handleRemoveLot = (index) => {
    const items = [...saleItems];
    items[index].lot = { _id: '', latNumber: '', supplier: '', pendingQuantity: 0 };
    items[index].quantity = '';
    items[index].displayQuantity = '';
    items[index].bagQuantity = '';
    items[index].unitPrice = '';
    items[index].unitPriceMon = '';
    items[index].unitPriceKG = '';
    items[index].unitPriceBag = '';
    items[index].unitPricePeti = '';
    setSaleItems(items);
    setLastList({ index: null, lat: [] });
  };

  useEffect(() => {
    const payment = parseFloat(totalPayment) || 0;
    const discount = parseFloat(discountTotal) || 0;
    const effectivePayment = payment + discount;

    let remainingPayment = effectivePayment;

    const updatedSaleItems = saleItems.map(item => {
      const newItem = { ...item };
      const itemTotal = parseFloat(newItem.totalAmount) || 0;
      const paidOnline = parseFloat(newItem.paidOnline) || 0;
      const dueOnItem = itemTotal - paidOnline;

      let paymentForItem = 0;
      if (remainingPayment > 0 && dueOnItem > 0) {
        paymentForItem = Math.min(remainingPayment, dueOnItem);
        remainingPayment -= paymentForItem;
      }

      newItem.paidOffline = paymentForItem.toFixed(2);
      newItem.dueAmount = (dueOnItem - paymentForItem).toFixed(2);
      return newItem;
    });

    if (JSON.stringify(updatedSaleItems) !== JSON.stringify(saleItems)) {
      setSaleItems(updatedSaleItems);
    }
  }, [totalPayment, discountTotal, saleItems]);

  /**
   * This function is called when the total payment amount is changed.
   * It distributes the payment among the sale items.
   */
  const handleTotalPaymentChange = (e) => {
    setTotalPayment(e.target.value);
  };

  const handleDiscountChange = (e) => {
    setDiscountTotal(e.target.value);
  };

  /**
   * This function is called when a DAG image is selected.
   */
  const handleDagImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      let reader = new FileReader();
      reader.onload = (e) => {
        setDagImage(e.target.result);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  /**
   * This function is called when the form is submitted.
   * It gathers all the data and sends it to the backend to create a new sale.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    let finalCustomerId = customerId;

    // If a new customer was created, first save the customer to get their ID
    if (!customerId && selectedCustomer) {
      const resultAction = await dispatch(createCustomer({ name: selectedCustomer.name }));
      if (createCustomer.fulfilled.match(resultAction)) {
        finalCustomerId = resultAction.payload._id;
      }
    }

    // Prepare the data to be sent to the backend
    const saleData = {
      customer: finalCustomerId,
      products: saleItems.map((item) => ({
        product: item.product,
        lot: item.lot._id,
        quantity: Number(item.quantity),
        Price_PerUnit: Number(item.unitPrice),
        discount: Number(item.discount),
        totalAmount: Number(item.totalAmount),
        paidAmountOnline: Number(item.paidOnline),
        paidAmountOffline: Number(item.paidOffline),
        dueAmount: Number(item.dueAmount),
        totalBags: Number(item.totalBags),
      })),
      notes: notes,
      saleDate: new Date().toISOString(),
      createdBy: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user'))._id : '',
      discountTotal: Number(discountTotal),
      totalAmount: saleItems.reduce((sum, item) => sum + parseFloat(item.totalAmount || 0), 0),
      dagImage: dagImage,
      payment: totalPayment,
      SaleDue: totalDue,
      customerOldDue: customerTotalDue,
      totalDue: finalTotalDue,
    };

    // Dispatch the action to create the sale

    const resultAction = await dispatch(createSale(saleData));
    if (createSale.fulfilled.match(resultAction)) {
      const newSale = resultAction.payload;
      const billData = {
        billNo: newSale.billNo,
        date: new Date(newSale.saleDate).toLocaleDateString(),
        customer: selectedCustomer?.name || 'N/A',
        items: saleItems.map(item => ({
          name: item.productDetails?.name || 'N/A',
          qty: item.quantity,
          weight: item.quantity, // Or some other logic for weight
          rate: item.unitPrice,
          amount: item.totalAmount,
        })),
        total: grandTotal,
        payment: totalPayment,
        rd: discountTotal,
        totalPayment: (parseFloat(totalPayment) || 0) + (parseFloat(discountTotal) || 0),
        notes: notes,
        customerTotalDue: customerTotalDue,
        totalDue: finalTotalDue,
      };
      setBillData(billData);
      setShowReceipt(true);
    } else {
      // Handle error case
      console.error("Failed to create sale:", resultAction.error);
      // Optionally, navigate back to sales page on failure too
      // navigate('/sales');
    }
  };

  // Calculate the grand total and total due amount for the entire sale
  const grandTotal = saleItems.reduce((sum, item) => sum + parseFloat(item.totalAmount || 0), 0);
  const totalDue = saleItems.reduce((sum, item) => sum + parseFloat(item.dueAmount || 0), 0);

  const totalPaidOnline = saleItems.reduce((sum, item) => sum + (parseFloat(item.paidOnline) || 0), 0);
  const saleDueBeforeOfflinePayment = grandTotal - totalPaidOnline;
  const effectivePayment = (parseFloat(totalPayment) || 0) + (parseFloat(discountTotal) || 0);
  const paymentAppliedToSale = saleDueBeforeOfflinePayment - totalDue;
  const extraPaymentForCustomer = effectivePayment - paymentAppliedToSale;
  const finalTotalDue = (customerTotalDue - extraPaymentForCustomer) + totalDue;

  return (
    <div className="container mx-auto p-2 max-w-full bg-gray-50 min-h-screen">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-lg shadow-md p-4">
              <h1 className="text-xl font-bold text-gray-800">Create a New Sale</h1>
              <p className="text-sm text-gray-500">Fill in the details below to record a new sale.</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <CustomerInfo
                customers={customers}
                customerId={customerId}
                setCustomerId={setCustomerId}
                customerSearch={customerSearch}
                setCustomerSearch={setCustomerSearch}
                selectedCustomer={selectedCustomer}
                setSelectedCustomer={setSelectedCustomer}
                isSearchingCustomer={isSearchingCustomer}
                setIsSearchingCustomer={setIsSearchingCustomer}
                customerTotalDue={customerTotalDue}
                showSalesHistory={showSalesHistory}
                setShowSalesHistory={setShowSalesHistory}
                billNumberFilter={billNumberFilter}
                setBillNumberFilter={setBillNumberFilter}
                dateFilter={dateFilter}
                setDateFilter={setDateFilter}
                customerNotFound={customerNotFound}
                setCustomerNotFound={setCustomerNotFound}
                handleOpenCustomerModal={handleOpenCustomerModal}
              />
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="space-y-4">
                {saleItems.map((item, index) => (
                  <SaleItem
                    key={index}
                    item={item}
                    index={index}
                    products={products}
                    lastList={lastList}
                    saleItems={saleItems}
                    handleItemChangeBlur={handleItemChangeBlur}
                    handleItemChange={handleItemChange}
                    handleProductChange={handleProductChange}
                    handleLotClick={handleLotClick}
                    handleRemoveLot={handleRemoveLot}
                    handleRemoveItem={handleRemoveItem}
                  />
                ))}
              </div>
              <div className="flex justify-start mt-4">
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="flex items-center justify-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-md hover:bg-blue-200 transition-all text-sm font-semibold"
                >
                  <FaPlus size={12} /> Add Another Item
                </button>
              </div>
            </div>
          </div>

          {/* Right Column (Sticky) */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-4">
              {saleItems.length >= 1 && (
                <div className="bg-white rounded-lg shadow-md p-4">
                  <Totals
                    discountTotal={discountTotal}
                    setDiscountTotal={handleDiscountChange}
                    totalPayment={totalPayment}
                    handleTotalPaymentChange={handleTotalPaymentChange}
                    totalDue={totalDue}
                    customerTotalDue={customerTotalDue}
                    finalTotalDue={finalTotalDue}
                  />
                </div>
              )}
              <div className="bg-white rounded-lg shadow-md p-4">
                <DagImageUpload dagImage={dagImage} handleDagImageChange={handleDagImageChange} />

                <div>
                  <label>Notes</label>
                  <textarea className='w-full border shadow-md rounded p-1 px-2 text-sm text-zinc-600' rows="6" placeholder='Notes' value={notes} onChange={(e) => setNotes(e.target.value)}  >   </textarea>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4">
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => navigate('/sales')}
                    className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-all font-semibold text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-all font-semibold flex items-center gap-2 text-sm"
                  >
                    <FaFileInvoice size={14} /> Save Sale
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Modals */}
      <CustomerModal
        showModal={showCustomerModal}
        handleCloseModal={handleCloseCustomerModal}
        handleAddCustomer={handleAddCustomer}
        newCustomer={newCustomer}
        handleInputChange={handleInputChange}
        isFormValid={isFormValid}
        isClosing={isClosing}
      />
      {showReceipt && billData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-lg">
            <SalePrintPage billData={billData} />
            <button
              onClick={() => {
                setShowReceipt(false);
                navigate('/sales');
              }}
              className="mt-4 bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-all font-semibold text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddSale;
