
// src/components/addSale/SaleItem.js

import React from 'react';
import { FaTrash, FaTimes } from 'react-icons/fa';

/**
 * This component represents a single item in the sale.
 * - It has a dropdown to select a product.
 * - It shows available lots for the selected product.
 * - You can enter the quantity and price.
 * - It calculates the total amount for the item.
 */
const SaleItem = ({
  // Data and state for this specific item
  item,
  index,
  products,
  lastList,
  saleItems,

  // Functions to handle changes and actions
  handleItemChangeBlur,
  handleItemChange,
  handleProductChange,
  handleLotClick,
  handleRemoveLot,
  handleRemoveItem,
}) => {

  
  return (
    <div key={index} className="bg-white p-4 rounded-lg shadow-md border border-gray-200 relative">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-md font-semibold text-gray-700">Item #{index + 1}</h3>
        {/* Show a remove button if there is more than one item */}
        {saleItems.length > 1 && (
          <button
            type="button"
            onClick={() => handleRemoveItem(index)}
            className="text-red-500 hover:text-red-700 transition-colors p-1 rounded-full hover:bg-red-50"
          >
            <FaTrash size={14} />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">Product</label>
          <select
            name="product"
            value={item.product}
            onChange={(e) => handleProductChange(index, e)}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
            required
          >
            {!item.product && <option value="">Select a product</option>}
            {products.map((product) => (
              <option key={product._id} value={product._id}>
                {product.name} ({product.unitCategory})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* This part shows the available lots for the selected product. */}
      {lastList.index === index && lastList.lat.length > 0 && (
        <div className="p-3 mb-3 bg-blue-50 rounded-md border border-blue-200">
          <label className="block text-sm font-medium text-gray-600 mb-2">Available Lots</label>
          <div className="flex gap-2">
            {lastList?.lat?.map((lot, lotIndex) => (
              <button
                key={lot._id}
                type="button"
                onClick={() => handleLotClick(lot._id, index)}
                className="p-2 border border-gray-300 rounded-md hover:border-blue-500 hover:bg-white text-left text-sm transition-all shadow-sm"
              >
                <div className="font-semibold text-gray-700">{lot.latNumber}</div>
                <div className="text-xs text-gray-500 mt-1">{lot.supplier}</div>
                <div className="text-xs text-gray-500">{new Date(lot.date).toLocaleDateString()}</div>
                <div className="mt-1 text-xs font-bold text-blue-600">
                  {lot.pendingQuantity + ' ' + (lot.unit || '')}{lot.unit === 'KG' && `/ ${lot.pendingQuantity / 40} mon`} {lot.pendingBags && <> {lot.unit === 'KG' ? `(${lot.pendingBags} bags)` : lot.unit === 'bag' ? `(${lot.pendingQuantity * 50} kg)` : ''}</>}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* This part shows the selected lot and the rest of the item form. */}
      {item.lot._id && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2 p-2 bg-green-50 rounded-md border border-green-200">
            <div className="text-sm">
              <span className="font-semibold text-green-800">Lot:</span>{" "}
              {item.lot.latNumber} ({item.lot.supplier})

              <span className="ml-3 text-green-700">
                Available: {item.lot.pendingQuantity} {item.productDetails?.unitCategory}
                {" / "}

                {/* KG */}
                {item.productDetails?.unitCategory === "KG" && (
                  <>
                    {item.lot.pendingQuantity / 40} mon /{" "}
                    <span className="capitalize">
                      {item.lot.pendingBags} bags
                    </span>
                  </>
                )}

                {/* bag */}
                {item.productDetails?.unitCategory === "bag" && (
                  <span className="capitalize">
                    {item.lot.pendingQuantity * 50} kg
                  </span>
                )}

                {/* tray */}
                {item.productDetails?.unitCategory === "tray" && (
                  <span className="capitalize">
                    {item.lot.pendingQuantity / 7} peti
                  </span>
                )}
              </span>
            </div>

            <button
              type="button"
              onClick={() => handleRemoveLot(index)}
              className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
              title="Remove lot"
            >
              <FaTimes size={12} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* Different quantity inputs based on the product's unit category. */}
            {item.productDetails?.unitCategory === 'KG' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Quantity (kg)</label>
                  <input
                    type="text"
                    name="quantity"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, e)}
                    onBlur={(e) => handleItemChangeBlur(index, e)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    required
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Quantity (mon)</label>
                  <div className="flex">
                    <input
                      type="text"
                      name="displayQuantity"
                      value={item.displayQuantity}
                      onChange={(e) => handleItemChange(index, e)}
                      className="w-full p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <span className="inline-flex items-center px-2 text-sm text-gray-600 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md">
                      mon
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Total Bags</label>
                  <input
                    type="text"
                    name="totalBags"
                    value={item.totalBags}
                    onChange={(e) => handleItemChange(index, e)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </>
            )}

            {item.productDetails?.unitCategory === 'bag' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Quantity (bag)</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    name="quantity"
                    value={item.quantity}
                    onChange={(e) => {

                      if (/^\d*\.?\d*$/.test(e.target.value)) handleItemChange(index, e)

                    }}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    required
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Quantity (kg)</label>
                  <div className="flex">
                    <input
                      type="text"
                      inputMode='decimal'
                      name="bagQuantity"
                      value={item.bagQuantity}
                      onChange={(e) => {
                        if (/^\d*\.?\d*$/.test(e.target.value)) handleItemChange(index, e)
                      }}
                      className="w-full p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"

                    />
                    <span className="inline-flex items-center px-2 text-sm text-gray-600 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md">
                      bag
                    </span>
                  </div>
                </div>
              </>
            )}

            {item.productDetails?.unitCategory === 'tray' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Quantity (peti)</label>
                  <div className="flex">
                    <input
                      type="number"
                      name="displayQuantity"
                      value={item.displayQuantity}
                      onChange={(e) => handleItemChange(index, e)}
                      className="w-full p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <span className="inline-flex items-center px-2 text-sm text-gray-600 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md">
                      peti
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Quantity (tray)</label>
                  <input
                    type="number"
                    name="quantity"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, e)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    required
                  />
                </div>

              </>
            )}

            {/* Different unit price inputs based on the product's unit category. */}
            {item.productDetails?.unitCategory === 'KG' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Unit Price (mon)</label>
                  <input
                    type="text"
                    name="unitPriceMon"
                    value={item.unitPriceMon}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Allow only numbers and decimal points
                      if (/^\d*\.?\d*$/.test(value)) {
                        handleItemChange(index, e);
                      }
                    }}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />

                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Unit Price (KG)</label>
                  <input
                    type="text"
                    name="unitPriceKG"
                    value={item.unitPriceKG}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Allow only numbers and decimal points
                      if (/^\d*\.?\d*$/.test(value)) {
                        handleItemChange(index, e);
                      }
                    }}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />

                </div>
              </>
            )}

            {item.productDetails?.unitCategory === 'bag' && (
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Unit Price (bag)</label>
                <input
                  type="number"
                  name="unitPriceBag"
                  value={item.unitPriceBag}
                  onChange={(e) => handleItemChange(index, e)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  step="0.01"
                />
              </div>
            )}

            {item.productDetails?.unitCategory === 'tray' && (
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Unit Price (tray)</label>
                <input
                  type="text"
                  name="unitPricePeti"
                  value={item.unitPricePeti}
                  onChange={(e) => handleItemChange(index, e)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            )}

            {/* Display the calculated total amount and due amount for the item. */}
            <div className="p-2 rounded-md bg-gray-50 border border-gray-200 text-center">
              <label className="block text-xs font-medium text-gray-600 mb-1">Amount</label>
              <div className="font-bold text-md text-gray-800">₹ {item.totalAmount || '0.00'}</div>
            </div>

            <div className="p-2 rounded-md bg-red-50 border border-red-200 text-center">
              <label className="block text-xs font-medium text-red-600 mb-1">Due</label>
              <div className="font-bold text-md text-red-800">₹ {item.dueAmount || '0.00'}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SaleItem;
