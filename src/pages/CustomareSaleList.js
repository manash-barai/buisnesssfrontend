import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { getCustomerSaleList } from '../features/customer/customerSlice';
import { useSalePaymentMutation } from '../features/api/apiSlice';
import DataTable from '../components/DataTable';
import {clearcustomareSaleLists} from '../features/customer/customerSlice'
import { FaCalendarAlt, FaFileInvoice, FaRupeeSign, FaHistory, FaArrowDown, FaTimes, FaMoneyBillWave, FaStickyNote, FaCheckCircle } from 'react-icons/fa';

const CustomerSaleList = () => {
    const dispatch = useDispatch();
    const { customerId } = useParams();
    const { name } = useParams();


    // Redux State
    const { customareSaleList, loading, error } = useSelector((state) => state.customer);
    const { currentPage, totalPages, data, totalDue } = customareSaleList;
    // Local State for Payment Form
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [rdAmount, setRdAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('CASH');
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]); // Default Today
    const [paymentNotes, setPaymentNotes] = useState('');

    // API Mutation
    const [salePayment, { isLoading: isPaymentLoading, isSuccess: isPaymentSuccess, isError: isPaymentError, error: paymentError }] = useSalePaymentMutation();

    // Fetch Data & Handle Payment Success
    useEffect(() => {
        // Fetch list on mount or page change or after successful payment
        dispatch(getCustomerSaleList({ customerId, page: currentPage, limit: 10 }));

        // If payment was successful, close modal and reset form
        if (isPaymentSuccess) {
            setShowPaymentModal(false);
            setPaymentAmount('');
            setRdAmount('');
            setPaymentNotes('');
            setPaymentMethod('CASH');
        }
    }, [dispatch, customerId, currentPage, isPaymentSuccess]);

    const handlePaymentSubmit = async (e) => {
        e.preventDefault();

        const finalPaymentAmount = Number(paymentAmount) || 0;
        const finalRdAmount = Number(rdAmount) || 0;

        if (finalPaymentAmount + finalRdAmount <= 0) {
            // You could set an error state here to show a message in the UI
            alert("The total payment (Amount + RD) must be greater than zero.");
            return;
        }

        // Construct Payload exactly as requested
        // 1️⃣ Grab the exact current time (e.g., "16:45:30.000Z")
        const currentTime = new Date().toISOString().split('T')[1];

        // 2️⃣ Combine the date from your React state ("YYYY-MM-DD") with the time
        const exactDateTime = `${paymentDate}T${currentTime}`;

        // 3️⃣ Create your payload with the new exact string
        const payload = {
            customer: customerId,
            amount: finalPaymentAmount,
            rd: finalRdAmount,
            method: paymentMethod,
            paymentDate: exactDateTime, // 🔥 Changed this line!
            notes: paymentNotes
        };
        console.log("payload", payload);
        dispatch(clearcustomareSaleLists());
        try {
            // Passing customerId as the second arg if your mutation definition needs it for the URL 
            // Assuming your mutation is defined like: query: (data) => ({ url: `salePayment/${data.customer}`, method: 'POST', body: data })
            await salePayment(payload).unwrap();
            await dispatch(getCustomerSaleList({ customerId, page: 1, limit: 10 }));
        } catch (err) {
            console.log('Failed to make payment: ', err);
        }
    };



    // Columns Definition
    const columns = useMemo(
        () => [
            {
                Header: () => <div className="flex items-center gap-2"><FaCalendarAlt /> Date</div>,
                accessor: 'date',
                Cell: ({ value }) => (
                    <div className="text-gray-600 text-sm">
                        {new Date(value).toLocaleDateString()} <br />
                        <span className="text-xs text-gray-400">{new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                ),
            },
            {
                Header: () => <div className="flex items-center gap-2"><FaFileInvoice /> Description</div>,
                accessor: 'label',
                Cell: ({ row }) => (
                    <div className='bg-yellow-500 500 text-xs text-zinc-800'>
                        {/* <span className="font-semibold block">{row.original.label}</span> */}
                        {/* {row.original.refId && (
                            <span className="text-xs text-gray-400">Ref: {row.original.refId.slice(-6)}</span>
                        )} */}
                        {/* Show notes if available for payments */}
                      { row.original?.notes}
                    </div>
                )
            },
            {
                Header: () => <div className="text-green-600 font-bold">Debit ( Pay )</div>,
                id: 'debit',
                accessor: (row) => row,
                Cell: ({ value }) => {
                    if (value.type !== 'CREDIT') {
                        return <span className="text-green-600 font-bold">+ ₹{value.amount}</span>;
                    }
                    return <span className="text-gray-300">-</span>;
                }
            },
            {
                Header: () => <div className="text-red-500 font-bold">Credit ( Sale )</div>,
                id: 'credit',
                accessor: (row) => row,
                Cell: ({ value }) => {
                    if (value.type === 'CREDIT') {
                        return <span className="text-red-500 font-bold">- ₹{value.amount}</span>;
                    }
                    return <span className="text-gray-300">-</span>;
                }
            },
            {
                Header: () => <div className="flex items-center gap-2"><FaHistory /> Balance</div>,
                accessor: 'balance',
                Cell: ({ value }) => (
                    <span className={`font-bold ${value > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        ₹{value}
                    </span>
                )
            },
        ],
        []
    );

    return (
        <div className="container mx-auto p-4 max-w-5xl relative min-h-screen">

            {/* --- FLOATING PAYMENT BUTTON (Left Side) --- */}
            <button
                onClick={() => setShowPaymentModal(true)}
                className="fixed left-0 top-1/2 transform -translate-y-1/2 bg-green-600 hover:bg-green-700 text-white p-4 rounded-r-lg shadow-xl z-40 flex flex-col items-center gap-2 transition-all duration-300 hover:pl-6"
                title="Add Payment"
            >
                <FaRupeeSign size={24} />
                <span className="vertical-text text-xs font-bold tracking-widest writing-mode-vertical" style={{ writingMode: 'vertical-rl' }}>PAY</span>
            </button>


            {/* --- TOP SUMMARY CARD --- */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6 border-l-4 border-blue-500 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2 capitalize">
                        {name || 'Customer Ledger'}
                    </h1>

                </div>
                <div className="text-right">
                    <p className="text-gray-500 text-sm font-semibold uppercase tracking-wide">Total Due</p>
                    <h2 className={`text-4xl font-extrabold ${totalDue > 0 ? 'text-red-500' : 'text-green-500'}`}>
                        ₹ {totalDue}
                    </h2>
                </div>
            </div>

            {/* --- PAYMENT MODAL (Centered) --- */}
            {showPaymentModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all scale-100">

                        {/* Modal Header */}
                        <div className="bg-green-600 p-4 flex justify-between items-center text-white">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <FaMoneyBillWave /> Receive Payment
                            </h3>
                            <button onClick={() => setShowPaymentModal(false)} className="hover:bg-green-700 p-2 rounded-full">
                                <FaTimes />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6">
                            <form onSubmit={handlePaymentSubmit} className="space-y-4">

                                {/* Amount & RD Row */}
                                <div className="flex gap-4">
                                    <div className="w-1/2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">₹</div>
                                            <input
                                                type="number"
                                                value={paymentAmount}
                                                onChange={(e) => setPaymentAmount(e.target.value)}
                                                className="pl-8 w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 outline-none"
                                                placeholder="0.00"
                                                
                                            />
                                        </div>
                                    </div>
                                    <div className="w-1/2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">RD No.</label>
                                        <input
                                            type="number"
                                            value={rdAmount}
                                            onChange={(e) => setRdAmount(e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="RD"
                                        />
                                    </div>
                                </div>

                                {/* Date & Method Row */}
                                <div className="flex gap-4">
                                    <div className="w-1/2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                        <input
                                            type="date"
                                            value={paymentDate}
                                            onChange={(e) => setPaymentDate(e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                    <div className="w-1/2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Method</label>
                                        <select
                                            value={paymentMethod}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                        >
                                            <option value="CASH">CASH</option>
                                            <option value="ONLINE">ONLINE</option>
                                            <option value="CHEQUE">CHEQUE</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Notes */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                                        <FaStickyNote className="text-gray-400" /> Notes
                                    </label>
                                    <textarea
                                        rows="2"
                                        value={paymentNotes}
                                        onChange={(e) => setPaymentNotes(e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="Add payment remarks..."
                                    ></textarea>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={isPaymentLoading}
                                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition duration-200 flex items-center justify-center gap-2 shadow-lg mt-2"
                                >
                                    {isPaymentLoading ? 'Processing...' : <><FaCheckCircle /> Confirm Payment</>}
                                </button>

                                {isPaymentError && (
                                    <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded">
                                        {paymentError.data?.message || 'Payment Failed'}
                                    </p>
                                )}
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* --- DATA TABLE --- */}
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                { error ? (
                    <div className="p-10 text-center text-red-500">Error: {error}</div>
                ) : (
                    <DataTable columns={columns} data={data}

                        currentPage={currentPage}
                        totalPages={totalPages}
                        isLoading={loading}
                        onLoadMore={(nextPage) => {

                            dispatch(getCustomerSaleList({ customerId, page: nextPage, limit: 10 }));
                        }}

                    />
                )}
            </div>


        </div>
    );
};

export default CustomerSaleList;