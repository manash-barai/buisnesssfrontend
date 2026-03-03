import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getSaleById, updateSaleById } from '../features/sale/saleSlice';
import { FaSave, FaArrowLeft } from 'react-icons/fa';

const ReturnSale = () => {
  const { id: saleId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { saleDetails, loading, error } = useSelector((state) => state.sale);

  const [formData, setFormData] = useState({
    customer: '',
    products: [],
    notes: '',
    saleDate: '',
    discountTotal: 0,
    totalAmount: 0,
    payment: 0,
    SaleDue: 0,
    totalDue: 0,
    previousAmount:0
  });

  // Fetch sale
  useEffect(() => {
    if (saleId) dispatch(getSaleById(saleId));
  }, [dispatch, saleId]);

  // Set initial formData
  useEffect(() => {
    if (!saleDetails) return;

    setFormData({
      customer: saleDetails.customer?._id,
      products: saleDetails.products.map((p) => ({
        product: p.product?._id,
        latId: p.latId?._id, // 🔥 MUST SEND TO BACKEND
        originalQty: p.quantity, // 🔥 Needed to compute returned quantity
        quantity: p.quantity,
        returnedQty: 0, // auto calculate
        unitPrice: p.unitPrice,
        discount: p.discount,
        totalAmount: p.totalAmount,
        paidAmountOnline: 0,
        paidAmountOffline: 0,
        dueAmount: p.totalAmount,
        totalBag: p.totalBag,
        
      })),
      notes: saleDetails.notes,
      saleDate: saleDetails.saleDate?.split('T')[0],
      discountTotal: saleDetails.discountTotal,
      totalAmount: saleDetails.totalAmount,
      payment: saleDetails.paidAmount,
      SaleDue: saleDetails.dueAmount,
      totalDue: saleDetails.customer?.totalDue || 0,
      previousAmount:saleDetails.totalAmount
    });
  }, [saleDetails]);

  // QUANTITY CHANGE
  const handleQuantityChange = (index, value) => {
    const updated = [...formData.products];
    const qty = Number(value);

    const originalQty = updated[index].originalQty;
    const returnedQty = originalQty - qty > 0 ? originalQty - qty : 0;

    updated[index].quantity = qty;
    updated[index].returnedQty = returnedQty;

    updated[index].totalAmount = qty * updated[index].unitPrice;
    updated[index].dueAmount = updated[index].totalAmount;

    setFormData({ ...formData, products: updated });
  };

  // MON → KG
  const handleMonChange = (index, monValue) => {
    const mon = Number(monValue);
    if (isNaN(mon)) return;

    const kg = mon * 40;
    handleQuantityChange(index, kg);
  };

  // BAG CHANGE
  const handleBagChange = (index, value) => {
    const updated = [...formData.products];
    updated[index].totalBag = value;
    setFormData({ ...formData, products: updated });
  };

  // RECALCULATE totals
  useEffect(() => {
    const totalAmount = formData.products.reduce((s, p) => s + p.totalAmount, 0);
    const totalDue = formData.products.reduce((s, p) => s + p.dueAmount, 0);

    setFormData((prev) => ({
      ...prev,
      totalAmount,
      SaleDue: totalDue,
    }));
  }, [formData.products]);

  // SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();
    await dispatch(updateSaleById({ id: saleId, saleData: formData }));
    navigate('/sales');
  };

  if (loading) return <p className="text-center py-8">Loading...</p>;
  if (error) return <p className="text-center text-red-600 py-8">{error}</p>;
  if (!saleDetails) return <p className="text-center py-8">No sale found</p>;

  return (
    <div className="container mx-auto p-4 bg-white shadow-md rounded-lg">

      {/* Page Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Return / Edit Sale</h1>
        <button onClick={() => navigate('/sales')}
          className="flex items-center gap-2 bg-gray-200 px-4 py-2 rounded-lg"
        >
          <FaArrowLeft /> Back
        </button>
      </div>

      {/* FORM */}
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Customer Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label>Customer</label>
            <input
              type="text"
              value={saleDetails.customer?.name}
              disabled
              className="w-full border px-3 py-2 bg-gray-100"
            />
          </div>

          <div>
            <label>Sale Date</label>
            <input
              type="date"
              value={formData.saleDate}
              disabled
              className="w-full border px-3 py-2 bg-gray-100"
            />
          </div>
        </div>

        {/* PRODUCTS */}
        <div className="border p-4 rounded-lg bg-gray-50 space-y-4">
          <h2 className="text-xl font-semibold">Products</h2>

          {formData.products.map((item, index) => {
            const latData = saleDetails.products[index].latId;
            return (
              <div key={index} className="border-b pb-4 mb-4">

                {/* GRID ROW */}
                <div className="grid grid-cols-2 md:grid-cols-8 gap-4">

                  {/* Product Name */}
                  <div>
                    <label className="font-bold">Product</label>
                    <input
                      type="text"
                      value={saleDetails.products[index].product?.name}
                      disabled
                      className="w-full border px-3 py-2 bg-gray-100 font-bold"
                    />
                  </div>

                  {/* Quantity KG */}
                  <div>
                    <label>Quantity ({latData?.unit === 'KG' ? 'KG' : latData?.unit === 'bag' ? 'BAG' : latData?.unit === 'tray'?"Tray":""})</label>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        handleQuantityChange(index, e.target.value)
                      }
                      className="w-full border px-3 py-2 rounded"
                    />
                  </div>

                  {/* Quantity MON */}
                  {latData?.unit === 'KG' && (
                    <div>
                      <label>Quantity (Mon)</label>
                      <input
                        type="number"
                        value={item.quantity ? item.quantity / 40 : ''}
                        onChange={(e) => handleMonChange(index, e.target.value)}
                        className="w-full border px-3 py-2 rounded"
                        placeholder="1 Mon = 40 KG"
                      />
                    </div>
                  )}

                  {/* Unit Price */}
                  <div>
                    <label>Unit Price</label>
                    <input
                      type="text"
                      value={item.unitPrice}
                      disabled
                      className="w-full border px-3 py-2 bg-gray-100"
                    />
                  </div>

                  {/* Bags */}
                  {latData?.unit === 'KG' && <div>
                    <label>Total Bags</label>
                    <input
                      type="text"
                      value={item.totalBag}
                      onChange={(e) => handleBagChange(index, e.target.value)}
                      className="w-full border px-3 py-2 rounded"
                    />
                  </div>}
                  {latData?.unit === 'bag' && <div>
                    <label>Total KG</label>
                    <input
                      type="text"
                      value={item.quantity * 50}
                      disabled
                      className="w-full border px-3 py-2 rounded"
                    />
                  </div>}

                  {/* Total Amount */}
                  <div>
                    <label>Total Amount</label>
                    <input
                      type="number"
                      value={item.totalAmount}
                      disabled
                      className="w-full border px-3 py-2 bg-gray-100"
                    />
                  </div>

                  {/* Due Amount */}
                  <div>
                    <label>Due Amount</label>
                    <input
                      type="number"
                      value={item.dueAmount}
                      disabled
                      className="w-full border px-3 py-2 bg-gray-100"
                    />
                  </div>
                </div>

                {/* LOT INFO */}
                <div className="bg-red-100 px-2 py-1 mt-2 rounded">
                  {latData?.latNumber && (
                    <p className="text-sm italic">
                      Lot: {latData.latNumber}, Pending: {latData.pendingQuantity}{latData?.unit === 'KG' ? 'KG' : latData?.unit === 'bag' ? ' BAG' : latData?.unit === 'tray' ? ' Tray' : ''} (
                      {latData?.unit === 'KG'
                        ? `${(latData.pendingQuantity / 40).toFixed(2)} mon`
                        : latData?.unit === 'bag'
                          ? `${latData.pendingQuantity * 50} KG`
                          : latData?.unit === 'tray'
                            ? `${(latData.pendingQuantity / 7).toFixed(2)} peti`
                            : ''
                      }
                      )
                    </p>
                  )}
                </div>

                {/* RETURN QTY DISPLAY */}
                <p className="text-blue-600 text-sm mt-1 font-semibold">
                  Returned Qty: {item.quantity} {latData?.unit === 'KG' ? "Kg" : latData?.unit === 'bag' ? 'Bag' : latData?.unit === 'tray' ? 'Tray' : ''}
                </p>
              </div>
            );
          })}
        </div>

        {/* SUMMARY */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label>Total Amount</label>
            <input
              type="number"
              value={formData.totalAmount}
              disabled
              className="w-full border px-3 py-2 bg-gray-100"
            />
          </div>

          <div>
            <label>Total Due</label>
            <input
              type="number"
              value={formData.SaleDue}
              disabled
              className="w-full border px-3 py-2 bg-gray-100"
            />
          </div>
        </div>

        {/* NOTES */}
        <div>
          <label>Notes</label>
          <textarea
            value={formData.notes}
            disabled
            className="w-full border px-3 py-2 bg-gray-100"
          ></textarea>
        </div>

        {/* SUBMIT */}
        <button
          type="submit"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          <FaSave /> Update Sale
        </button>

      </form>
    </div>
  );
};

export default ReturnSale;
