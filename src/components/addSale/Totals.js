
// src/components/addSale/Totals.js

import React from 'react';

/**
 * This component displays the final totals for the sale.
 * - It shows the grand total, total due, and customer's total due.
 * - It has an input for the total payment.
 */
const Totals = ({
  // Data and state from the parent component
  discountTotal,
  totalPayment,
  totalDue,
  customerTotalDue,
  finalTotalDue,

  // Functions to handle changes
  setDiscountTotal,
  handleTotalPaymentChange,
}) => {
  const totalDueColor = finalTotalDue < 0 ? 'text-green-800' : 'text-red-800';
  const totalDueFontWeight = finalTotalDue < 0 ? 'font-bold' : 'font-bold';

  return (
    <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
      <h3 className="text-md font-semibold text-gray-700 mb-3">Final Totals & Payment</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-600">Total Payment</label>
          <input
            type="number"
            value={totalPayment}
            onChange={handleTotalPaymentChange}
            className="w-1/2 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            step="0.01"
          />
        </div>
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-600">R/D </label>
          <input
            type="number"
            value={discountTotal}
            onChange={setDiscountTotal}
            className="w-1/2 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            step="0.01"
          />
        </div>
        <hr className="my-2"/>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">Old value</span>
          <span className="text-md font-bold text-gray-800">₹ {(customerTotalDue).toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-red-600">Sale Due</span>
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
