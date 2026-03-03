import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  getAllUsers,
  createUser,
  deleteUserById,
  updateUserById
} from '../features/user/userSlice';
import { FaEdit, FaTrash, FaPlus, FaPhone, FaWhatsapp, FaUser, FaUserTie, FaEnvelope, FaLock } from 'react-icons/fa';
import DataTable from '../components/DataTable';
import UserModal from '../components/UserModal';

const User = () => {
  const dispatch = useDispatch();
  const { data: users = [], loading, error } = useSelector((state) => state.user);
  const [isClosing, setIsClosing] = useState(false);
  const [userUpdateId, setUserUpdateId] = useState(null);
  const [newUser, setNewUser] = useState({ name: '', role: 'staff', phone: '', whatsapp: '', email: '', password: '', address: '' });
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    dispatch(getAllUsers());
  }, [dispatch]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser({ ...newUser, [name]: value });
  };

  const handleAddUser = () => {
    if (userUpdateId) {
      dispatch(updateUserById({ id: userUpdateId, userData: newUser }));
    } else {
      dispatch(createUser(newUser));
    }
    setNewUser({ name: '', role: 'staff', phone: '', whatsapp: '', email: '', password: '', address: '' });
    setShowModal(false);
    setUserUpdateId(null);
  };

  const handleDelete = (id) => {
    dispatch(deleteUserById(id));
  };

  const handleUpdate = (user) => {
    setUserUpdateId(user._id);
    setNewUser({ name: user.name, role: user.role, phone: user.phone, whatsapp: user.whatsapp, email: user.email, address: user.address, password: '' });
    setShowModal(true);
  };

  const handleBlockToggle = (user) => {
    const updatedUser = { ...user, block: !user.block };
    dispatch(updateUserById({ id: user._id, userData: updatedUser }));
  };

  const handleCloseModal = () => {
    setIsClosing(true);
    setNewUser({ name: '', role: 'staff', phone: '', whatsapp: '', email: '', password: '', address: '' });
    setUserUpdateId(null);
    setTimeout(() => {
      setShowModal(false);
      setIsClosing(false);
    }, 200);
  };

  const columns = React.useMemo(
    () => [
      { Header: <div className="flex items-center gap-2"><FaUser /> Name</div>, accessor: 'name', ThClass: "justify-start" },
      { Header: <div className="flex items-center gap-2"><FaUserTie /> Role</div>, accessor: 'role', ThClass: "justify-start" },
      { Header: <div className="flex items-center gap-2"><FaPhone /> Phone</div>, accessor: 'phone', ThClass: "justify-start",
        Cell: ({ value }) => (
          value ? (
            <a href={`tel:${value}`} className="flex items-center gap-2 text-blue-600 hover:underline">
              <FaPhone /> {value}
            </a>
          ) : null
        )
      },
      { Header: <div className="flex items-center gap-2"><FaWhatsapp /> WhatsApp</div>, accessor: 'whatsapp', ThClass: "justify-start",
        Cell: ({ value }) => (
          value ? (
            <a href={`https://wa.me/${value}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-green-600 hover:underline">
              <FaWhatsapp /> {value}
            </a>
          ) : null
        )
      },
      { Header: <div className="flex items-center gap-2"><FaEnvelope /> Email</div>, accessor: 'email', ThClass: "justify-start" },
      {
        Header: <div className="flex items-center gap-2"><FaLock /> Block</div>,
        accessor: 'block',
        ThClass: "justify-center",
        Cell: ({ row }) => (
          <div className="flex justify-center">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={row.original.block}
                onChange={() => handleBlockToggle(row.original)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
            </label>
          </div>
        ),
      },
      {
        Header: 'Update',
        accessor: 'Update',
        ThClass: "justify-center",
        Cell: ({ row }) => (
          <div className="flex gap-2 justify-center">
            <button onClick={() => handleUpdate(row.original)} className="text-primary-600 hover:text-primary-800">
              <FaEdit />
            </button>
          </div>
        ),
      },
      {
        Header: 'Delete',
        accessor: 'Delete',
        ThClass: "justify-center",
        Cell: ({ row }) => (
          <div className="flex gap-2 justify-center">
            <button onClick={() => handleDelete(row.original._id)} className="text-primary-600 hover:text-primary-800">
              <FaTrash />
            </button>
          </div>
        ),
      },
    ],
    [handleDelete]
  );

  const isFormValid = newUser.name && newUser.role && newUser.phone && newUser.email && newUser.address && (userUpdateId ? true : newUser.password);

  return (
    <div className="container mx-auto p-6 bg-white">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-semibold text-gray-800">Users</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-800 transition"
        >
          <FaPlus /> Add User
        </button>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : error ? (
        <p className="text-center text-app-primary-500">Error: {error}</p>
      ) : (
        <DataTable columns={columns} data={users} />
      )}

      <UserModal
        showModal={showModal}
        handleCloseModal={handleCloseModal}
        handleAddUser={handleAddUser}
        newUser={newUser}
        handleInputChange={handleInputChange}
        isFormValid={isFormValid}
        isClosing={isClosing}
        users={users}
        setNewUser={setNewUser}
        setUserUpdateId={setUserUpdateId}
        userUpdateId={userUpdateId}
      />
    </div>
  );
};

export default User;
