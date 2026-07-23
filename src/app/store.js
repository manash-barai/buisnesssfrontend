import { configureStore } from '@reduxjs/toolkit';
import { apiSlice } from '../features/api/apiSlice';
import activityLogReducer from '../features/activityLog/activityLogSlice';
import customerReducer from '../features/customer/customerSlice';
import productReducer from '../features/product/productSlice';
import purchaseReducer from '../features/purchase/purchaseSlice';
import returnReducer from '../features/return/returnSlice';
import saleReducer from '../features/sale/saleSlice';
import supplierReducer from '../features/supplier/supplierSlice';
import userReducer from '../features/user/userSlice';
import latReducer from '../features/lat/latSlice';

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    activityLog: activityLogReducer,
    customer: customerReducer,
    product: productReducer,
    purchase: purchaseReducer,
    return: returnReducer,
    sale: saleReducer,
    purchase: purchaseReducer,
    supplier: supplierReducer,
    user: userReducer,
    lat: latReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});
