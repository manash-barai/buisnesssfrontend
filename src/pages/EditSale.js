// src/pages/EditSale.js

import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { getSaleById, updateSaleById } from '../features/sale/saleSlice';
import { getAllCustomers, createCustomer } from '../features/customer/customerSlice';
import { getAllProducts } from '../features/product/productSlice';
import { FaPlus, FaFileInvoice, FaSpinner } from 'react-icons/fa';
import axios from 'axios';
import { debounce } from 'lodash';

// Import components
import CustomerInfo from '../components/addSale/CustomerInfo';
import SaleItem from '../components/addSale/SaleItem';
import Totals from '../components/addSale/Totals';
import DagImageUpload from '../components/addSale/DagImageUpload';
import CustomerModal from '../components/CustomerModal';
import SalePrintPage from '../components/Receipt';

const EditSale = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id: saleId } = useParams();

  // Get data from Redux store
  const { data: customers = [] } = useSelector((state) => state.customer);
  const { data: products = [] } = useSelector((state) => state.product);
  const { saleDetails, isLoading: saleLoading } = useSelector((state) => state.sale);

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
  const [originalSaleDue, setOriginalSaleDue] = useState(0); // New state for original sale due
  
  // State for customer modal
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', address: '', whatsApp: '' });
  const [isFormValid, setIsFormValid] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // State for sale items
  const [saleItems, setSaleItems] = useState([]);

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

  // State for form submission
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch initial data
  useEffect(() => {
    dispatch(getAllCustomers());
    dispatch(getAllProducts());
  }, [dispatch]);

  // Fetch sale data when saleId changes
  useEffect(() => {
    if (saleId) {
      dispatch(getSaleById(saleId));
    }
  }, [saleId, dispatch]);

  // Populate form fields when selectedSale data is available
  useEffect(() => {
    if (saleDetails && products.length > 0) {
      // Set customer information
      const customer = saleDetails.customer;
      setCustomerId(customer?._id || '');
      setCustomerSearch(customer?.name || '');
      setSelectedCustomer(customer || null);
      setCustomerTotalDue(customer?.totalDue || 0);
      setNotes(saleDetails.notes || '');
      setDiscountTotal(saleDetails.discountTotal || 0);
      setOriginalSaleDue(saleDetails.dueAmount || 0); // Set original sale due
      
      // Calculate total payment (paidAmount + discountTotal)
      const paidAmount = saleDetails.paidAmount || 0;
      const discount = saleDetails.discountTotal || 0;
      setTotalPayment((paidAmount - discount).toString());
      
      setDagImage(saleDetails.dagImage || null);

      // Map products to saleItems format
      const mappedItems = saleDetails.products.map(item => {
        const productDetails = products.find(p => p._id === item.product?._id) || item.product;
        const unitCategory = productDetails?.unitCategory || 'KG';
        
        // Calculate display quantities based on unit category
        let displayQuantity = '';
        let bagQuantity = '';
        let unitPriceMon = '';
        let unitPriceKG = '';
        let unitPriceBag = '';
        let unitPricePeti = '';

        const quantity = item.quantity || 0;
        const unitPrice = item.unitPrice || 0;

        if (unitCategory === 'KG') {
          displayQuantity = (quantity / 40).toString();
          unitPriceMon = (unitPrice * 40).toFixed(2);
          unitPriceKG = unitPrice.toString();
        } else if (unitCategory === 'bag') {
          bagQuantity = quantity.toString();
          unitPriceBag = unitPrice.toString();
        } else if (unitCategory === 'tray') {
          displayQuantity = (quantity / 7).toString();
          unitPricePeti = unitPrice.toString();
        }

        return {
          product: item.product?._id || '',
          productDetails: productDetails,
          lot: {
            _id: item.latId?._id || '',
            latNumber: item.latId?.latNumber || '',
            supplier: item.latId?.supplier?.name || 'N/A',
            pendingQuantity: item.latId?.pendingQuantity || 0,
            pendingBags: item.latId?.pendingBag || 0
          },
          quantity: quantity.toString(),
          unitPrice: unitPrice.toString(),
          discount: item.discount?.toString() || '0',
          totalAmount: item.totalAmount?.toString() || (quantity * unitPrice).toString(),
          paidOnline: item.paidAmountOnline?.toString() || '0',
          paidOffline: item.paidAmountOffline?.toString() || '0',
          dueAmount: item.dueAmount?.toString() || (item.totalAmount - (item.paidAmountOnline || 0) - (item.paidAmountOffline || 0)).toString(),
          displayQuantity: displayQuantity,
          displayUnit: unitCategory === 'KG' ? 'kg' : unitCategory === 'bag' ? 'bag' : 'tray',
          bagQuantity: bagQuantity,
          unitPriceMon: unitPriceMon,
          unitPriceKG: unitPriceKG,
          unitPriceBag: unitPriceBag,
          unitPricePeti: unitPricePeti,
          totalBags: item.totalBag?.toString() || ''
        };
      });

      setSaleItems(mappedItems);
    }
  }, [saleDetails, products]);

  // When customer is selected, find their details
  useEffect(() => {
    if (customerId) {
      const customer = customers.find((c) => c._id === customerId);
      setSelectedCustomer(customer);
      setCustomerTotalDue(customer?.totalDue || 0);
    }
  }, [customerId, customers]);

  // Validate new customer form
  useEffect(() => {
    const { name, phone, address } = newCustomer;
    setIsFormValid(name.trim() !== '' && phone.trim() !== '' && address.trim() !== '');
  }, [newCustomer]);

  // Handle payment distribution
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
  }, [totalPayment, discountTotal]);

  // Customer modal handlers
  const handleOpenCustomerModal = () => {
    setNewCustomer({ name: '', phone: '', address: '', whatsApp: '' });
    setShowCustomerModal(true);
  };

  const handleCloseCustomerModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowCustomerModal(false);
      setIsClosing(false);
    }, 500);
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
      dispatch(getAllCustomers());
      setCustomerId(newCustomerData._id);
      setSelectedCustomer(newCustomerData);
      setCustomerSearch(newCustomerData.name);
      setIsSearchingCustomer(false);
      handleCloseCustomerModal();
    }
  };

  // Sale item handlers
  const handleItemChangeBlur = (index, e) => {
    const { name, value } = e.target;
    if (name !== 'quantity') return;

    const items = [...saleItems];
    const item = items[index];
    const product = item.productDetails;

    let baseValue;

    if (value.includes("+")) {
      baseValue = value
        .split("+")
        .map(num => parseFloat(num.trim()) || 0)
        .reduce((acc, curr) => acc + curr, 0);
    } else {
      baseValue = parseFloat(value) || 0;
    }

    const available = item.lot?.pendingQuantity || 0; // Default to 0 if not available

    let increaseBy = 0;
    if (baseValue > available) {
      increaseBy = baseValue - available;
      // The user mentioned "increase by 2 or 3". Assuming this means if the difference is 2 or 3, send that.
      // If it's any other value, send that difference too.
      // If a fixed value (e.g., always 2) is desired, this logic needs adjustment.
    }
    item.increaseBy = increaseBy > 0 ? increaseBy : undefined; // Only set if greater than 0

    item.quantity = baseValue.toString();

    if (product?.unitCategory === 'KG') {
      item.displayQuantity = (baseValue / 40).toString();
    } else if (product?.unitCategory === 'bag') {
      item.bagQuantity = baseValue.toString();
    } else if (product?.unitCategory === 'tray') {
      item.displayQuantity = (baseValue / 7).toString();
    }

    const quantity = parseFloat(item.quantity) || 0;
    const unitPrice = parseFloat(item.unitPrice) || 0;
    const discount = parseFloat(item.discount) || 0;
    const total = quantity * unitPrice - discount;
    const paidOnline = parseFloat(item.paidOnline) || 0;
    const paidOffline = parseFloat(item.paidOffline) || 0;
    const due = total - paidOnline - paidOffline;

    item.totalAmount = total.toFixed(2);
    item.dueAmount = due.toFixed(2);

    if (value.includes("+") && item.lot?.latNumber) {
      setNotes(item.lot.latNumber + " :- " + value);
    }

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
        unitPriceKG: '',
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
          baseValue = String(value);
        } else if (name === 'displayQuantity') {
          baseValue = product.unitCategory === 'tray' ? enteredValue * 7 : enteredValue * 40;
        } else if (name === 'bagQuantity') {
          baseValue = enteredValue / 50;
        }

        if (baseValue > available) {
          alert('out of stock increse quentity in your lat');
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

  const handleRemoveItem = (index) => {
    const items = [...saleItems];
    items.splice(index, 1);
    setSaleItems(items);
  };

  // Debounced lot fetch
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

    if (product?.unitCategory === 'KG') {
      items[index].displayUnit = 'kg';
    } else if (product?.unitCategory === 'bag') {
      items[index].displayUnit = 'bag';
    } else if (product?.unitCategory === 'tray') {
      items[index].displayUnit = 'tray';
    }

    setSaleItems(items);
    setLastList({ index: null, lat: [] });
    debouncedLatChange(index, value);
  };

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

  const handleTotalPaymentChange = (e) => {
    setTotalPayment(e.target.value);
  };

  const handleDiscountChange = (e) => {
    setDiscountTotal(e.target.value);
  };

  const handleDagImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      let reader = new FileReader();
      reader.onload = (e) => {
        setDagImage(e.target.result);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Prepare data according to backend structure
    const saleData = {
      customer: customerId,
      saleDate: saleDetails?.saleDate || new Date().toISOString(),
      products: saleItems.map((item) => ({
        product: item.product,
        lot: item.lot._id,
        quantity: Number(item.quantity),
        Price_PerUnit: Number(item.unitPrice),
        discount: Number(item.discount) || 0,
        totalAmount: Number(item.totalAmount),
        paidAmountOnline: Number(item.paidOnline) || 0,
        paidAmountOffline: Number(item.paidOffline) || 0,
        dueAmount: Number(item.dueAmount),
        totalBags: Number(item.totalBags) || 0,
        ...(item.increaseBy && { increaseBy: item.increaseBy }), // Conditionally add increaseBy
      })),
      notes: notes,
      discountTotal: Number(discountTotal),
      totalAmount: saleItems.reduce((sum, item) => sum + parseFloat(item.totalAmount || 0), 0),
      dagImage: dagImage,
      paidAmount: (parseFloat(totalPayment) || 0) + (parseFloat(discountTotal) || 0),
      dueAmount: finalTotalDue,
      customerOldDue: customerTotalDue - originalSaleDue
    };

    // Find changes
    const originalProducts = saleDetails.products.map(item => {
        return {
          product: item.product?._id || '',
          lot: item.latId?._id || '',
          quantity: Number(item.quantity),
          Price_PerUnit: Number(item.unitPrice),
          discount: Number(item.discount) || 0,
          totalAmount: Number(item.totalAmount),
          paidAmountOnline: Number(item.paidAmountOnline) || 0,
          paidAmountOffline: Number(item.paidAmountOffline) || 0,
          dueAmount: Number(item.dueAmount),
          totalBags: Number(item.totalBag) || 0,
        }
    });

    const changes = {};

    if (saleData.notes !== saleDetails.notes) {
      changes.notes = saleData.notes;
    }
    if (saleData.discountTotal !== saleDetails.discountTotal) {
      changes.discountTotal = saleData.discountTotal;
    }
    if (saleData.paidAmount !== saleDetails.paidAmount) {
      changes.paidAmount = saleData.paidAmount;
    }

    const productChanges = [];
    saleData.products.forEach((newProduct, index) => {
      const oldProduct = originalProducts[index];
      const productChange = {};
      let hasChanges = false;

      if (oldProduct) {
        Object.keys(newProduct).forEach(key => {
          if (newProduct[key] !== oldProduct[key]) {
            productChange[key] = newProduct[key];
            hasChanges = true;
          }
        });
      } else {
        // New product added
        hasChanges = true;
        Object.assign(productChange, newProduct);
      }

      if (hasChanges) {
        productChanges.push({ 
            product: newProduct.product, 
            lat_id: newProduct.lot,
            ...productChange
        });
      }
    });

    if (productChanges.length > 0) {
      changes.products = productChanges;
    }
    
    const finalChangesObject = {
        _id: saleId,
        previous: {
            notes: saleDetails.notes,
            discountTotal: saleDetails.discountTotal,
            paidAmount: saleDetails.paidAmount,
            products: originalProducts
        },
        new: changes
    }
    
    console.log("Changed Items:", finalChangesObject);

    // const resultAction = await dispatch(updateSaleById({ id: saleId, saleData }));
    
    // if (updateSaleById.fulfilled.match(resultAction)) {
    //   const updatedSale = resultAction.payload;
    //   const billData = {
    //     billNo: updatedSale.billNo || saleDetails?.billNo,
    //     date: new Date(updatedSale.saleDate || saleDetails?.saleDate).toLocaleDateString(),
    //     customer: selectedCustomer?.name || 'N/A',
    //     items: saleItems.map(item => ({
    //       name: item.productDetails?.name || 'N/A',
    //       qty: item.quantity,
    //       weight: item.quantity,
    //       rate: item.unitPrice,
    //       amount: item.totalAmount,
    //     })),
    //     total: grandTotal,
    //     payment: totalPayment,
    //     rd: discountTotal,
    //     totalPayment: (parseFloat(totalPayment) || 0) + (parseFloat(discountTotal) || 0),
    //     notes: notes,
    //     customerTotalDue: customerTotalDue,
    //     totalDue: finalTotalDue,
    //   };
    //   setBillData(billData);
    //   setShowReceipt(true);
    // } else {
    //   console.error("Failed to update sale:", resultAction.error);
    // }
    
    setIsSubmitting(false);
  };

  // Calculations
  const grandTotal = saleItems.reduce((sum, item) => sum + parseFloat(item.totalAmount || 0), 0);
  const totalDue = saleItems.reduce((sum, item) => sum + parseFloat(item.dueAmount || 0), 0);
  const totalPaidOnline = saleItems.reduce((sum, item) => sum + (parseFloat(item.paidOnline) || 0), 0);
  const saleDueBeforeOfflinePayment = grandTotal - totalPaidOnline;
  const effectivePayment = (parseFloat(totalPayment) || 0) + (parseFloat(discountTotal) || 0);
  const paymentAppliedToSale = saleDueBeforeOfflinePayment - totalDue;
  const extraPaymentForCustomer = effectivePayment - paymentAppliedToSale;

  // Adjusted logic for finalTotalDue to avoid double-counting
  const originalSaleTotalAmount = saleDetails?.totalAmount || 0;
  const originalSalePaidAmount = saleDetails?.paidAmount || 0;
  const originalSaleDueAmount = originalSaleTotalAmount - originalSalePaidAmount;

  // customerTotalDue from state already includes the original sale's due.
  // First, subtract the original sale's due, then add the new sale's due.
  const finalTotalDue = (customerTotalDue - originalSaleDue) + totalDue;

  if (saleLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <FaSpinner className="animate-spin text-4xl text-blue-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-2 max-w-full bg-gray-50 min-h-screen">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-lg shadow-md p-4">
              <h1 className="text-xl font-bold text-gray-800">Edit Sale</h1>
              <p className="text-sm text-gray-500">Modify the details below to update the sale.</p>
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
                disabled={true}
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
                    disableProductSelection={true} // Disable product selection
                    disabled={false} // Enable editing of sale item fields
                  />
                ))}
              </div>
              {/* <div className="flex justify-start mt-4">
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="flex items-center justify-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-md hover:bg-blue-200 transition-all text-sm font-semibold"
                >
                  <FaPlus size={12} /> Add Another Item
                </button>
              </div> */}
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-4">
              {/* {saleItems.length >= 1 && (
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
              )} */}
              
              <div className="bg-white rounded-lg shadow-md p-4">
                <DagImageUpload dagImage={dagImage} handleDagImageChange={handleDagImageChange} />
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea 
                    className="w-full border shadow-md rounded p-1 px-2 text-sm text-zinc-600" 
                    rows="4" 
                    placeholder="Add notes here..." 
                    value={notes} 
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-4">
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => navigate('/sales')}
                    className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-all font-semibold text-sm"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-all font-semibold flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? <FaSpinner className="animate-spin" /> : <FaFileInvoice size={14} />}
                    {isSubmitting ? 'Updating...' : 'Update Sale'}
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
        editmode={true}
      />

      {showReceipt && billData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg max-w-4xl max-h-[90vh] overflow-y-auto">
            <SalePrintPage billData={billData} />
            <div className="flex justify-end mt-4">
              <button
                onClick={() => {
                  setShowReceipt(false);
                  navigate('/sales');
                }}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-all font-semibold text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditSale;