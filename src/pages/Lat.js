import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  getAllLats,
  createLat,
  updateLatById
} from '../features/lat/latSlice';
import { FaEdit, FaPlus, FaUser, FaBox, FaWeightHanging, FaTruck } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import DataTable from '../components/DataTable';
import LatModal from '../components/LatModal';

const Lat = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { data: lats = [], loading, error, currentPage, totalPages } = useSelector((state) => state.lat);
  const [isClosing, setIsClosing] = useState(false);
  const [latUpdateId, setLatUpdateId] = useState(null);
  const [newLat, setNewLat] = useState({
    name: '',
    pendingBag: '',
    pendingQuantity: '',
    supplier: '',
    unit: '',
    tray: '',
    peti: '',
    notes: ''
  });
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    dispatch(getAllLats({}));
  }, [dispatch]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewLat({ ...newLat, [name]: value });
  };

  const handleAddLat = (latData) => {
    if (editMode) {
      const { operation, value, fieldToUpdate } = latData;
      const updateData = {
        [operation]: {
          field: fieldToUpdate,
          value: Number(value)
        }
      };
      dispatch(updateLatById({ id: latUpdateId, latData: updateData }));
    } else {
      dispatch(createLat(latData));
    }
    handleCloseModal();
  };

  const handleUpdate = (lat) => {
    setLatUpdateId(lat._id);
    setNewLat({
      _id: lat._id,
      latNumber: lat.latNumber,
      name: lat.name || '',
      pendingBag: lat.pendingBag || '',
      pendingQuantity: lat.pendingQuantity || '',
      supplier: lat.supplier?._id || '',
      unit: lat.unit || '',
      tray: lat.tray || '',
      peti: lat.peti || '',
      notes: lat.notes || ''
    });
    setShowModal(true);
    setEditMode(true);
  };

  const handleCloseModal = () => {
    setIsClosing(true);
    setNewLat({
      name: '',
      pendingBag: '',
      pendingQuantity: '',
      supplier: '',
      unit: '',
      tray: '',
      peti: '',
      notes: ''
    });
    setLatUpdateId(null);
    setTimeout(() => {
      setShowModal(false);
      setIsClosing(false);
      setEditMode(false);
    }, 200);
  };

  const columns = React.useMemo(
    () => [
      { Header: <div className="flex items-center gap-2"><FaUser /> Lat Number</div>, accessor: 'latNumber', ThClass: "justify-start" },
      { Header: <div className="flex items-center gap-2"><FaTruck /> Supplier</div>, accessor: 'supplier.name', ThClass: "justify-start" },
      { Header: <div className="flex items-center gap-2"><FaBox /> Unit</div>, accessor: 'unit', ThClass: "justify-start" },
      { Header: <div className="flex items-center gap-2"><FaBox /> Pending Bag</div>, accessor: 'pendingBag', ThClass: "justify-start" },
      { Header: <div className="flex items-center gap-2"><FaWeightHanging /> Pending Quantity</div>, accessor: 'pendingQuantity', ThClass: "justify-start" },
      { Header: 'Trays', accessor: 'tray' },
      { Header: 'Peti', accessor: 'peti' },
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
    ],
    [handleUpdate, navigate]
  );

  const isFormValid = newLat.name && newLat.supplier && newLat.unit;

  return (
    <div className="container mx-auto p-6 bg-white">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-semibold text-gray-800">Lats</h1>
        
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : error ? (
        <p className="text-center text-app-primary-500">Error: {error}</p>
      ) : (
        <DataTable columns={columns} data={lats}
          currentPage={currentPage}
          totalPages={totalPages}
          isLoading={loading}
          onLoadMore={(nextPage) => {
            dispatch(getAllLats({ page: nextPage, limit: 10 }));
          }}
        />
      )}

      <LatModal
        showModal={showModal}
        handleCloseModal={handleCloseModal}
        handleAddLat={handleAddLat}
        newLat={newLat}
        handleInputChange={handleInputChange}
        isFormValid={isFormValid}
        isClosing={isClosing}
        editMode={editMode}
      />
    </div>
  );
};

export default Lat;
