// src/components/addSale/Totals.js

import React from 'react';

const Totals = ({
  discountTotal,
  totalPayment,
  totalDue,
  customerTotalDue,
  finalTotalDue,
  setDiscountTotal,
  handleTotalPaymentChange,
  disabled = false, // Default to false
}) => {
  const totalDueColor = finalTotalDue < 0 ? 'text-green-800' : 'text-red-800';
  const totalDueFontWeight = finalTotalDue < 0 ? 'font-bold' : 'font-bold';

  return (
    <div className={`bg-white p-4 rounded-lg shadow-md border border-gray-200 ${disabled ? 'opacity-70' : ''}`}>
      <h3 className="text-md font-semibold text-gray-700 mb-3">Final Totals & Payment</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-600">Total Payment</label>
          <input
            type="number"
            value={totalPayment}
            onChange={handleTotalPaymentChange}
            className="w-1/2 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-100"
            step="0.01"
            disabled={disabled}
          />
        </div>
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-600">R/D </label>
          <input
            type="number"
            value={discountTotal}
            onChange={setDiscountTotal}
            className="w-1/2 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm disabled:bg-gray-100"
            step="0.01"
            disabled={disabled}
          />
        </div>
        <hr className="my-2"/>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">Old value</span>
          <span className="text-md font-bold text-gray-800">₹ {(customerTotalDue).toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-red-600">Sale Amount</span>
          <span className="text-md font-bold text-red-800">₹ {(totalDue).toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className={`text-sm font-medium ${totalDueColor.replace('800', '600')}`}>Total Due</span>
          <span className={`text-md ${totalDueFontWeight} ${totalDueColor}`}>₹ {Number(finalTotalDue).toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default Totals;