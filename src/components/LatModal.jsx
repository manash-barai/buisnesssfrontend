import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Rnd } from "react-rnd";
import {
  FaUser,
  FaStickyNote,
  FaBox,
  FaWeightHanging,
  FaTruck,
  FaBoxes,
} from "react-icons/fa";
import { getAllSuppliers } from "../features/supplier/supplierSlice";

const LatModal = ({
  showModal,
  handleCloseModal,
  handleAddLat,
  newLat,
  handleInputChange,
  isFormValid,
  isClosing,
  editMode,
}) => {
  const dispatch = useDispatch();
  const { data: suppliers } = useSelector((state) => state.supplier);
  const [operation, setOperation] = useState("increase");
  const [value, setValue] = useState("");
  const [fieldToUpdate, setFieldToUpdate] = useState("pendingQuantity");

  useEffect(() => {
    if (showModal && !editMode) {
      dispatch(getAllSuppliers({ limit: 100 })); // Fetch a large number of suppliers
    }
    if (editMode) {
      if (newLat.unit === "KG") {
        setFieldToUpdate("pendingQuantity");
      } else if (newLat.unit === "BAG") {
        setFieldToUpdate("pendingBag");
      } else if (newLat.unit === "Tray") {
        setFieldToUpdate("tray");
      }
    }
  }, [dispatch, showModal, editMode, newLat.unit]);

  if (!showModal) {
    return null;
  }

  const handleSave = () => {
    const payload = {
      ...newLat,
      operation,
      value,
      fieldToUpdate,
    };
    handleAddLat(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <Rnd
        default={{
          x: window.innerWidth / 2 - 300,
          y: window.innerHeight / 2 - 350,
          width: 600,
        }}
        bounds="window"
        dragHandleClassName="drag-handle"
        enableResizing={true}
        className="bg-transparent flex items-center justify-center"
      >
        <div
          className={`bg-white rounded-lg shadow-lg flex flex-col ${
            isClosing ? "animate-slideFadeOut" : "animate-slideFadeIn"
          } w-full h-full`}
        >
          {/* Header */}
          <div className="drag-handle cursor-move bg-primary-600 text-white flex justify-between items-center px-4 py-2 rounded-t-lg">
            <h2 className="text-lg font-semibold">
              {newLat.latNumber ? `Lat: ${newLat.latNumber}` : "Add New Lat"}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={handleCloseModal}
                className="text-sm border border-white px-3 py-1 rounded hover:bg-white hover:text-app-primary-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={editMode ? !value : !isFormValid}
                className={`text-sm px-3 py-1 rounded transition ${
                  (editMode ? value : isFormValid)
                    ? "bg-white text-app-primary-600 hover:bg-app-primary-100"
                    : "bg-gray-300 text-gray-600 cursor-not-allowed"
                }`}
              >
                Save
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="flex-1 p-4 space-y-3 overflow-auto">
            {editMode ? (
              <div className="space-y-3">
                <p className="text-lg font-semibold">
                  Pending Quantity: {newLat.pendingQuantity}
                </p>

                {newLat.unit === "KG" && (
                  <>
                    <p className="text-md">Pending Bag: {newLat.pendingBag}</p>
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="fieldToUpdate"
                          value="pendingQuantity"
                          checked={fieldToUpdate === "pendingQuantity"}
                          onChange={() => setFieldToUpdate("pendingQuantity")}
                          className="form-radio"
                        />
                        <span className="ml-2">Update Quantity</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="fieldToUpdate"
                          value="pendingBag"
                          checked={fieldToUpdate === "pendingBag"}
                          onChange={() => setFieldToUpdate("pendingBag")}
                          className="form-radio"
                        />
                        <span className="ml-2">Update Bag</span>
                      </label>
                    </div>
                  </>
                )}

                {newLat.unit === "BAG" && (
                  <p className="text-md">Pending Bag: {newLat.pendingBag}</p>
                )}

                {newLat.unit === "Tray" && (
                  <p className="text-md">Tray: {newLat.tray}</p>
                )}

                <div className="flex items-center space-x-4 pt-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="operation"
                      value="increase"
                      checked={operation === "increase"}
                      onChange={() => setOperation("increase")}
                      className="form-radio"
                    />
                    <span className="ml-2">Increase</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="operation"
                      value="decrease"
                      checked={operation === "decrease"}
                      onChange={() => setOperation("decrease")}
                      className="form-radio"
                    />
                    <span className="ml-2">Decrease</span>
                  </label>
                </div>

                <div className="flex flex-col">
                  <label
                    htmlFor="value"
                    className="text-sm font-medium text-gray-700"
                  >
                    Value
                  </label>
                  <div className="flex items-center border rounded px-3 py-2 mt-1">
                    <input
                      type="number"
                      id="value"
                      name="value"
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      placeholder="Enter value"
                      className="w-full outline-none"
                      required
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Form for adding a new lat */}
                <div className="space-y-3">
                  <div className="flex flex-col">
                    <label
                      htmlFor="name"
                      className="text-sm font-medium text-gray-700"
                    >
                      Full Name
                    </label>
                    <div className="flex items-center border rounded px-3 py-2 mt-1">
                      <FaUser className="text-gray-400 mr-3" />
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={newLat.name}
                        onChange={handleInputChange}
                        placeholder="Full Name"
                        className="w-full outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <label
                      htmlFor="supplier"
                      className="text-sm font-medium text-gray-700"
                    >
                      Supplier
                    </label>
                    <div className="flex items-center border rounded px-3 py-2 mt-1">
                      <FaTruck className="text-gray-400 mr-3" />
                      <select
                        id="supplier"
                        name="supplier"
                        value={newLat.supplier}
                        onChange={handleInputChange}
                        className="w-full outline-none"
                      >
                        <option value="">Select Supplier</option>
                        {suppliers.map((supplier) => (
                          <option key={supplier._id} value={supplier._id}>
                            {supplier.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <label
                      htmlFor="unit"
                      className="text-sm font-medium text-gray-700"
                    >
                      Unit
                    </label>
                    <div className="flex items-center border rounded px-3 py-2 mt-1">
                      <FaBox className="text-gray-400 mr-3" />
                      <select
                        id="unit"
                        name="unit"
                        value={newLat.unit}
                        onChange={handleInputChange}
                        className="w-full outline-none"
                        disabled={editMode}
                      >
                        <option value="">Select Unit</option>
                        <option value="KG">KG</option>
                        <option value="BAG">BAG</option>
                      </select>
                    </div>
                  </div>

                  {newLat.unit === "KG" && (
                    <>
                      <div className="flex flex-col">
                        <label
                          htmlFor="tray"
                          className="text-sm font-medium text-gray-700"
                        >
                          Tray
                        </label>
                        <div className="flex items-center border rounded px-3 py-2 mt-1">
                          <FaBoxes className="text-gray-400 mr-3" />
                          <input
                            type="number"
                            id="tray"
                            name="tray"
                            value={newLat.tray}
                            onChange={handleInputChange}
                            placeholder="Number of Trays"
                            className="w-full outline-none"
                          />
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <label
                          htmlFor="peti"
                          className="text-sm font-medium text-gray-700"
                        >
                          Peti
                        </label>
                        <div className="flex items-center border rounded px-3 py-2 mt-1">
                          <FaBox className="text-gray-400 mr-3" />
                          <input
                            type="number"
                            id="peti"
                            name="peti"
                            value={newLat.peti}
                            onChange={handleInputChange}
                            placeholder="Number of Peti"
                            className="w-full outline-none"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
                <div className="space-y-3">
                  <div className="flex flex-col">
                    <label
                      htmlFor="pendingBag"
                      className="text-sm font-medium text-gray-700"
                    >
                      Pending Bag
                    </label>
                    <div className="flex items-center border rounded px-3 py-2 mt-1">
                      <FaBox className="text-gray-400 mr-3" />
                      <input
                        type="number"
                        id="pendingBag"
                        name="pendingBag"
                        value={newLat.pendingBag}
                        onChange={handleInputChange}
                        placeholder="Pending Bag"
                        className="w-full outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <label
                      htmlFor="pendingQuantity"
                      className="text-sm font-medium text-gray-700"
                    >
                      Pending Quantity
                    </label>
                    <div className="flex items-center border rounded px-3 py-2 mt-1">
                      <FaWeightHanging className="text-gray-400 mr-3" />
                      <input
                        type="number"
                        id="pendingQuantity"
                        name="pendingQuantity"
                        value={newLat.pendingQuantity}
                        onChange={handleInputChange}
                        placeholder="Pending Quantity"
                        className="w-full outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <label
                      htmlFor="notes"
                      className="text-sm font-medium text-gray-700"
                    >
                      Additional Notes
                    </label>
                    <div className="flex items-start border rounded px-3 py-2 mt-1">
                      <FaStickyNote className="text-gray-400 mr-3 mt-2" />
                      <textarea
                        id="notes"
                        name="notes"
                        value={newLat.notes || ""}
                        onChange={handleInputChange}
                        placeholder="Additional Notes"
                        className="w-full outline-none h-20 resize-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Rnd>
    </div>
  );
};

export default LatModal;
