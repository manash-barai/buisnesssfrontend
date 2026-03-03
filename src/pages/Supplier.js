import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  getAllSuppliers,
  createSupplier,
  deleteSupplierById,
  updateSupplierById
} from '../features/supplier/supplierSlice';
import { FaEdit, FaTrash, FaPlus, FaUser, FaPhone, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import DataTable from '../components/DataTable';
import SupplierModal from '../components/SupplierModal';
import { FaLongArrowAltRight } from "react-icons/fa";

const Supplier = () => {
  const dispatch = useDispatch();
  const { data: suppliers = [], loading, error, currentPage, totalPages } = useSelector((state) => state.supplier);
  const [isClosing, setIsClosing] = useState(false);
  const [supplierUpdateId, setSupplierUpdateId] = useState(null);
  const [newSupplier, setNewSupplier] = useState({ name: '', contactPerson: '', phone: '', email: '', address: '' });
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    dispatch(getAllSuppliers({ page: currentPage, limit: 10 }));
  }, [dispatch]);
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSupplier({ ...newSupplier, [name]: value });
  };

  const handleAddSupplier = () => {
    if (supplierUpdateId) {
      dispatch(updateSupplierById({ id: supplierUpdateId, supplierData: newSupplier }));
      setSupplierUpdateId(null);
      setNewSupplier({ name: '', phone: '', address: '' });
      setShowModal(false);
    } else {
      dispatch(createSupplier(newSupplier));
      setNewSupplier({ name: '', phone: '', address: '' });
      setShowModal(false);
    }
  };

  const handleDelete = (id) => {
    dispatch(deleteSupplierById(id));
  };

  const handleUpdate = (supplier) => {
    setSupplierUpdateId(supplier._id);
    setNewSupplier({ name: supplier.name, contactPerson: supplier.contactPerson, phone: supplier.phone, email: supplier.email, address: supplier.address });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setIsClosing(true);
    setNewSupplier({ name: '', contactPerson: '', phone: '', email: '', address: '' });
    setSupplierUpdateId(null);
    setTimeout(() => {
      setShowModal(false);
      setIsClosing(false);
    }, 200);
  };

  const columns = React.useMemo(
    () => [
      { Header: <div className="flex items-center gap-2"><FaUser /> Name</div>, accessor: 'name', ThClass: "justify-start" },

      { Header: <div className="flex items-center gap-2"><FaPhone /> Phone</div>, accessor: 'phone', ThClass: "justify-start" },

      { Header: <div className="flex items-center gap-2"><FaPhone /> Due </div>, accessor: 'totalDue', ThClass: "justify-start" },


      { Header: <div className="flex items-center gap-2"><FaMapMarkerAlt /> Address</div>, accessor: 'address', ThClass: "justify-start" },
      {
        Header: 'Update',
        accessor: 'Update',
        ThClass: "justify-center",
        Cell: ({ row }) => (
          <div className="flex gap-2 justify-center ">
            <button onClick={() => handleUpdate(row.original)} className="text-app-primary-600 hover:text-app-primary-800">
              <FaEdit />
            </button>
          </div>
        )
      },
      {
        Header: 'Delete',
        accessor: 'Delete',
        ThClass: "justify-center",
        Cell: ({ row }) => (
          <div className="flex gap-2 justify-center ">
            <button onClick={() => handleDelete(row.original._id)} className="text-app-primary-600 hover:text-app-primary-800">
              <FaTrash />
            </button>
          </div>
        ),
      },
      {
        Header: 'Details',
        accessor: 'Details',
        ThClass: "justify-center",
        Cell: ({ row }) => (
          <div className="flex gap-2 justify-center ">
            <button className="text-app-primary-600 hover:text-app-primary-800">
              <FaLongArrowAltRight />
            </button>
          </div>
        ),
      }
    ],
    [handleDelete]
  );

  const isFormValid = newSupplier.name && newSupplier.phone && newSupplier.address;

  return (
    <div className="container mx-auto p-6 bg-white">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-semibold text-gray-800">Suppliers</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-app-primary-600 text-white px-4 py-2 rounded hover:bg-app-primary-800 transition"
        >
          <FaPlus /> Add Supplier
        </button>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : error ? (
        <p className="text-center text-app-primary-500">Error: {error}</p>
      ) : (
        <DataTable columns={columns} data={suppliers}
          currentPage={currentPage}
          totalPages={totalPages}
          isLoading={loading}
          onLoadMore={(nextPage) => {

            dispatch(getAllSuppliers({ page: nextPage, limit: 10 }));
          }}
        />
      )}

      <SupplierModal
        showModal={showModal}
        handleCloseModal={handleCloseModal}
        handleAddSupplier={handleAddSupplier}
        newSupplier={newSupplier}
        handleInputChange={handleInputChange}
        isFormValid={isFormValid}
        isClosing={isClosing}
      />

    </div>
  );
};

export default Supplier;
