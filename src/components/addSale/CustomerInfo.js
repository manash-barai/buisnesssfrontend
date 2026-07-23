// src/components/addSale/CustomerInfo.js

import React from 'react';

/**
 * This component handles everything related to the customer.
 * - It shows a dropdown of existing customers.
 * - It allows you to search for a customer.
 * - It allows you to create a new customer if they don't exist.
 * - It shows the selected customer's total due amount and sales history.
 */
const CustomerInfo = ({
  // Data and state from the parent component (AddSale.js)
  customers,
  customerId,
  customerSearch,
  selectedCustomer,
  isSearchingCustomer,
  customerTotalDue,
  showSalesHistory,
  billNumberFilter,
  dateFilter,
  customerNotFound,

  // Functions to update the state in the parent component
  setCustomerId,
  setCustomerSearch,
  setSelectedCustomer,
  setIsSearchingCustomer,
  setShowSalesHistory,
  setBillNumberFilter,
  setDateFilter,
  setCustomerNotFound,
  handleOpenCustomerModal,
  disabled
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
      <div className='flex justify-between items-center mb-3'>
        <label className="block text-md font-semibold text-gray-700">
          Customer
        </label>
       {!disabled &&  <button onClick={handleOpenCustomerModal} type='button' className='bg-blue-600 text-white shadow-sm px-3 py-1 rounded-md text-sm font-medium hover:bg-blue-700' >
          New Customer
        </button>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        {/* Customer Selection Column */}
        <div className="relative">
          {!isSearchingCustomer ? (
            <select
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
              onClick={() => setIsSearchingCustomer(true)}
              onChange={(e) => {
                const customer = customers.find((c) => c._id === e.target.value);
                setCustomerId(customer._id);
                setSelectedCustomer(customer);
                setCustomerSearch(customer.name);
                setCustomerNotFound(false);
              }}
              value={customerId}
            >
              <option value="">Select a customer</option>
              {customers.map((customer) => (
                <option key={customer._id} value={customer._id}>
                  {customer.name}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              placeholder="Search for a customer..."
              value={customerSearch}
              disabled={disabled}
              onChange={(e) => {
                const keyword = e.target.value;
                setCustomerSearch(keyword);
                setSelectedCustomer(null);
                setCustomerId('');
                if (keyword && customers.filter((c) => c.name.toLowerCase().includes(keyword.toLowerCase())).length === 0) {
                  setCustomerNotFound(true);
                } else {
                  setCustomerNotFound(false);
                }
              }}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
            />
          )}

          {isSearchingCustomer && !selectedCustomer && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
              <ul className="max-h-48 overflow-y-auto">
                {customers
                  .filter((customer) => !customerSearch || customer.name.toLowerCase().includes(customerSearch.toLowerCase()))
                  .map((customer) => (
                    <li
                      key={customer._id}
                      onClick={() => {
                        setCustomerId(customer._id);
                        setSelectedCustomer(customer);
                        setCustomerSearch(customer.name);
                        setCustomerNotFound(false);
                        setIsSearchingCustomer(false);
                      }}
                      className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                    >
                      {customer.name}
                    </li>
                  ))}
              </ul>
            </div>
          )}
        </div>

        {/* Customer Details Column */}
        {selectedCustomer && (
          <div className="p-3 bg-gray-100 rounded-md">
            <p className="text-md font-semibold">Total Due: {customerTotalDue}</p>
            {!disabled && <button
              onClick={() => setShowSalesHistory(!showSalesHistory)}
              className="text-blue-500 hover:underline mt-1 text-sm"
            >
              {showSalesHistory ? 'Hide' : 'More'}
            </button>}
          </div>
        )}
      </div>

      
      {showSalesHistory && selectedCustomer && (
        <div className="mt-4" style={{ maxHeight: '300px', overflowY: 'auto' }}>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              placeholder="Filter by Bill Number"
              value={billNumberFilter}
              onChange={(e) => setBillNumberFilter(e.target.value)}
              className="w-full p-1.5 border border-gray-300 rounded-md text-sm"
            />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full p-1.5 border border-gray-300 rounded-md text-sm"
            />
          </div>
          <table className="min-w-full bg-white text-sm">
            <thead className="bg-gray-700 text-white">
              <tr>
                <th className="w-1/3 text-left py-2 px-3 uppercase font-semibold text-xs">Bill No.</th>
                <th className="w-1/3 text-left py-2 px-3 uppercase font-semibold text-xs">Date</th>
                <th className="text-left py-2 px-3 uppercase font-semibold text-xs">Total</th>
                <th className="text-left py-2 px-3 uppercase font-semibold text-xs">Due</th>
              </tr>
            </thead>
            <tbody className="text-gray-600">
              {selectedCustomer?.sales
                ?.filter(
                  (sale) =>
                    (!billNumberFilter || sale.billNumber.includes(billNumberFilter)) &&
                    (!dateFilter || new Date(sale.saleDate).toLocaleDateString() === new Date(dateFilter).toLocaleDateString())
                )
                .map((sale) => (
                  <tr key={sale._id}>
                    <td className="w-1/3 text-left py-2 px-3">{sale.billNumber}</td>
                    <td className="w-1/3 text-left py-2 px-3">{new Date(sale.saleDate).toLocaleDateString()}</td>
                    <td className="text-left py-2 px-3">{sale.totalAmount}</td>
                    <td className="text-left py-2 px-3">{sale.dueAmount}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CustomerInfo;
