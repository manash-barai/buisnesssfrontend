import React from "react";
import { Rnd } from "react-rnd";
import {
  FaUser,
  FaPhone,
  FaMapMarkerAlt,
  FaWhatsapp,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaShoppingCart,
  FaStickyNote,
} from "react-icons/fa";
import moment from "moment";

const CustomerModal = ({
  showModal,
  handleCloseModal,
  handleAddCustomer,
  newCustomer,
  handleInputChange,
  isFormValid,
  isClosing,
}) => {
  if (!showModal) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <Rnd
        
       default={{
          x: window.innerWidth / 2 - 300,
          y: window.innerHeight / 2 - 250,
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
              {newCustomer._id ? "Edit Customer" : "Add New Customer"}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={handleCloseModal}
                className="text-sm border border-white px-3 py-1 rounded hover:bg-white hover:text-app-primary-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCustomer}
                disabled={!isFormValid}
                className={`text-sm px-3 py-1 rounded transition ${
                  isFormValid
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Column 1 */}
              <div className="space-y-3">
                <div className="flex flex-col">
                  <label
                    htmlFor="name"
                    className="text-sm font-medium text-gray-700"
                  >
                    Customer Name
                  </label>
                  <div className="flex items-center border rounded px-3 py-2 mt-1">
                    <FaUser className="text-gray-400 mr-3" />
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={newCustomer.name}
                      onChange={handleInputChange}
                      placeholder="Customer Name"
                      className="w-full outline-none"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col">
                  <label
                    htmlFor="phone"
                    className="text-sm font-medium text-gray-700"
                  >
                    Phone Number
                  </label>
                  <div className="flex items-center border rounded px-3 py-2 mt-1">
                    <FaPhone className="text-gray-400 mr-3" />
                    <input
                      type="text"
                      id="phone"
                      name="phone"
                      value={newCustomer.phone}
                      onChange={handleInputChange}
                      placeholder="Phone Number"
                      className="w-full outline-none"
                      required
                    />
                  </div>
                </div>

                <div className=" flex-col hidden">
                  <label
                    htmlFor="whatsApp"
                    className="text-sm font-medium text-gray-700"
                  >
                    WhatsApp Number
                  </label>
                  <div className="flex items-center border rounded px-3 py-2 mt-1">
                    <FaWhatsapp className="text-gray-400 mr-3" />
                    <input
                      type="text"
                      id="whatsApp"
                      name="whatsApp"
                      value={newCustomer.phone}
                      onChange={handleInputChange}
                      placeholder="WhatsApp Number"
                      className="w-full outline-none"
                    />
                  </div>
                </div>
              </div>
              <div>

             
              <div className="flex flex-col">
                <label
                  htmlFor="address"
                  className="text-sm font-medium text-gray-700"
                >
                  Address
                </label>
                <div className="flex items-center border rounded px-3 py-2 mt-1">
                  <FaMapMarkerAlt className="text-gray-400 mr-3" />
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={newCustomer.address}
                    onChange={handleInputChange}
                    placeholder="Address"
                    className="w-full outline-none"
                    required
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
                    value={newCustomer.notes || ""}
                    onChange={handleInputChange}
                    placeholder="Additional Notes"
                    className="w-full outline-none h-20 resize-none"
                  />
                </div>
              </div>
               </div>
              {/* Column 2 */}
              {/* <div className="space-y-3">
                <div className="flex flex-col">
                  <label htmlFor="lastPayment" className="text-sm font-medium text-gray-700">Last Payment Amount</label>
                  <div className="flex items-center border rounded px-3 py-2 mt-1 bg-gray-100">
                    <FaMoneyBillWave className="text-gray-400 mr-3 " />
                    <input
                      type="number"
                      id="lastPayment"
                      name="lastPayment"
                      value={newCustomer.lastPayment || ''}
                      onChange={handleInputChange}
                      placeholder="Last Payment Amount"
                      className="w-full outline-none"
                      disabled
                    />
                  </div>
                </div>

                <div className="flex flex-col">
                  <label htmlFor="lastPaymentDate" className="text-sm font-medium text-gray-700">Last Payment Date</label>
                  <div className="flex items-center border rounded px-3 py-2 mt-1 bg-gray-100">
                    <FaCalendarAlt className="text-gray-400 mr-3" />
                    <input
                      type="date"
                      id="lastPaymentDate"
                      name="lastPaymentDate"
                      value={newCustomer.lastPaymentDate ? moment(newCustomer.lastPaymentDate).format('YYYY-MM-DD') : ''}
                      onChange={handleInputChange}
                      className="w-full outline-none"
                      disabled
                    />
                  </div>
                </div>

                <div className="flex flex-col ">
                  <label htmlFor="totalDue" className="text-sm font-medium text-gray-700">Total Due Amount</label>
                  <div className="flex items-center border rounded px-3 py-2 mt-1 bg-gray-100">
                    <FaMoneyBillWave className="text-gray-400 mr-3" />
                    <input
                      type="number"
                      id="totalDue"
                      name="totalDue"
                      value={newCustomer.totalDue || ''}
                      onChange={handleInputChange}
                      placeholder="Total Due Amount"
                      className="w-full outline-none"
                      disabled
                    />
                  </div>
                </div>

                <div className="flex flex-col">
                  <label htmlFor="lastShop" className="text-sm font-medium text-gray-700">Last Shop Amount</label>
                  <div className="flex items-center border rounded px-3 py-2 mt-1 bg-gray-100">
                    <FaShoppingCart className="text-gray-400 mr-3" />
                    <input
                      type="number"
                      id="lastShop"
                      name="lastShop"
                      value={newCustomer.lastShop || ''}
                      onChange={handleInputChange}
                      placeholder="Last Shop Amount"
                      className="w-full outline-none"
                      disabled
                    />
                  </div>
                </div>
              </div> */}
            </div>

            {/* Notes (full width) */}
          </div>
        </div>
      </Rnd>
    </div>
  );
};

export default CustomerModal;
