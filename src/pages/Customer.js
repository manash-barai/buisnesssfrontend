import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  getAllCustomers,
  createCustomer,
  updateCustomerById
} from '../features/customer/customerSlice';
import { FaEdit, FaPlus, FaUser, FaPhone, FaMapMarkerAlt, FaWhatsapp, FaMoneyBillWave, FaCalendarAlt, FaShoppingCart, FaBook, FaLongArrowAltRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import DataTable from '../components/DataTable';
import CustomerModal from '../components/CustomerModal';
import moment from 'moment';

const Customer = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { data: customers = [], loading, error } = useSelector((state) => state.customer);
  const [isClosing, setIsClosing] = useState(false);
  const [customerUpdateId, setCustomerUpdateId] = useState(null);
  const [newCustomer, setNewCustomer] = useState({ 
    name: '', 
    phone: '', 
    whatsApp: '', 
    address: '', 
    lastPayment: '', 
    lastPaymentDate: '', 
    totalDue: '', 
    lastShop: '', 
    notes: '' 
  });
  const [showModal, setShowModal] = useState(false);
  
  useEffect(() => {
    dispatch(getAllCustomers());
  }, [dispatch]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCustomer({ ...newCustomer, [name]: value });
  };

  const handleAddCustomer = () => {
    const customerData = {
      ...newCustomer,
      lastPayment: newCustomer.lastPayment ? Number(newCustomer.lastPayment) : 0,
      totalDue: newCustomer.totalDue ? Number(newCustomer.totalDue) : 0,
      lastShop: newCustomer.lastShop ? Number(newCustomer.lastShop) : 0,
      lastPaymentDate: newCustomer.lastPaymentDate || new Date()
    };

    if (customerUpdateId) {
      dispatch(updateCustomerById({ id: customerUpdateId, customerData }));
      setCustomerUpdateId(null);
      setNewCustomer({ name: '', phone: '', whatsApp: '', address: '', lastPayment: '', lastPaymentDate: '', totalDue: '', lastShop: '', notes: '' });
      setShowModal(false);
    } else {
      dispatch(createCustomer(customerData));
      setNewCustomer({ name: '', phone: '', whatsApp: '', address: '', lastPayment: '', lastPaymentDate: '', totalDue: '', lastShop: '', notes: '' });
      setShowModal(false);
    }
  };

  

  const handleUpdate = (customer) => {
    setCustomerUpdateId(customer._id);
    setNewCustomer({ 
      name: customer.name || '', 
      phone: customer.phone || '', 
      whatsApp: customer.whatsApp || '', 
      address: customer.address || '', 
      lastPayment: customer.lastPayment || '', 
      lastPaymentDate: customer.lastPaymentDate ? moment(customer.lastPaymentDate).format('YYYY-MM-DD') : '', 
      totalDue: customer.totalDue || '', 
      lastShop: customer.lastShop || '', 
      notes: customer.notes || '' 
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setIsClosing(true);
    setNewCustomer({ name: '', phone: '', whatsApp: '', address: '', lastPayment: '', lastPaymentDate: '', totalDue: '', lastShop: '', notes: '' });
    setCustomerUpdateId(null);
    setTimeout(() => {
      setShowModal(false);
      setIsClosing(false);
    }, 200);
  };

  const columns = React.useMemo(
    () => [
      { Header: <div className="flex items-center gap-2"><FaUser /> Name</div>, accessor: 'name', ThClass: "justify-start" },
      { Header: <div className="flex items-center gap-2"><FaPhone /> Phone</div>, accessor: 'phone', ThClass: "justify-start" },
      { Header: <div className="flex items-center gap-2"><FaWhatsapp /> WA</div>, accessor: 'whatsApp', ThClass: "justify-start" },
      { Header: <div className="flex items-center gap-2"><FaMapMarkerAlt /> Address</div>, accessor: 'address', ThClass: "justify-start" },
     
     
      { 
        Header: <div className="flex items-center gap-2"><FaMoneyBillWave />Total Due</div>, 
        accessor: 'totalDue', 
        ThClass: "justify-start",
        Cell: ({ value }) => value ? <b>₹{value}</b> : 'N/A'
      },
      
      {
        Header: 'Edit',
        accessor: 'Update',
        ThClass: "justify-center",
        Cell: ({ row }) => (
          <div className="flex gap-2 justify-center ">
            <button onClick={() => handleUpdate(row.original)} className="text-primary-600 hover:text-primary-800">
              <FaEdit />
            </button>
          </div>
        )
      },
      {
        Header: 'Details',
        accessor: 'Details',
        ThClass: "justify-center",
        Cell: ({ row }) => (
          <div className="flex gap-2 justify-center ">
            <button onClick={() => navigate(`/customer-sale-list/${row.original.name}/${row.original._id}`)} className="text-primary-600 hover:text-primary-800">
              <FaLongArrowAltRight />
            </button>
          </div>
        ),
      }
    ],
    [handleUpdate]
  );

  const isFormValid = newCustomer.name && newCustomer.phone ;

  return (
    <div className="container mx-auto p-6 bg-white">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-semibold text-gray-800">Customers</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-800 transition"
        >
          <FaPlus /> Add Customer
        </button>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : error ? (
        <p className="text-center text-app-primary-500">Error: {error}</p>
      ) : (
        <DataTable columns={columns} data={customers} />
      )}

      <CustomerModal
        showModal={showModal}
        handleCloseModal={handleCloseModal}
        handleAddCustomer={handleAddCustomer}
        newCustomer={newCustomer}
        handleInputChange={handleInputChange}
        isFormValid={isFormValid}
        isClosing={isClosing}
      />
    </div>
  );
};

export default Customer;