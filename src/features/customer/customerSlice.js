import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import customerService from '../../services/customerService';

// Async Thunks
export const getAllCustomers = createAsyncThunk(
  'customer/getAll',
  async (filter, thunkAPI) => {
    try {
      return await customerService.getAllCustomers(filter);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const createCustomer = createAsyncThunk(
  'customer/create',
  async (customerData, thunkAPI) => {
    try {
      return await customerService.createCustomer(customerData);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const getCustomerById = createAsyncThunk(
  'customer/getById',
  async (id, thunkAPI) => {
    try {
      return await customerService.getCustomerById(id);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const updateCustomerById = createAsyncThunk(
  'customer/updateById',
  async ({ id, customerData }, thunkAPI) => {
    try {
      return await customerService.updateCustomerById(id, customerData);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const deleteCustomerById = createAsyncThunk(
  'customer/deleteById',
  async (id, thunkAPI) => {
    try {
      return await customerService.deleteCustomerById(id);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const getCustomerSaleList = createAsyncThunk(
  'customer/getSaleList',
  async ({ customerId, page, limit = 10 }, thunkAPI) => {
    try {
      return await customerService.getCustomerSaleList({ customerId, page, limit });
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const initialState = {
  data: [],
  customareSaleList: {
    data: [],
    currentPage: 1,
    totalPages: 1,
    limit: 10,
    totalSaleLists: 0,
  },
  currentPage: 1,
  totalPages: 1,
  limit: 10,
  totalCustomares: 0,
  totalDue: 0,
  pagination: {},
  loading: false,
  error: null,
};

const customerSlice = createSlice({
  name: 'customer',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAllCustomers.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllCustomers.fulfilled, (state, action) => {
        state.loading = false;

        // 1. Extract the array from the payload (default to empty array)
        const newData = action.payload?.customers || [];

        // 2. Merge with existing data in state
        const mergedData = [...state.data, ...newData];

        // 3. Remove duplicates based on _id (Map trick)
        state.data = Array.from(
          new Map(mergedData.map(item => [item._id, item])).values()
        );

        // 4. Store the metadata for the UI
        state.currentPage = action.payload.currentPage;
        state.totalPages = action.payload.totalPages;
        state.totalCustomers = action.payload.totalCustomers;
      })
      .addCase(getAllCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createCustomer.pending, (state) => {
        state.loading = true;
      })
      .addCase(createCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.data.push(action.payload);
      })
      .addCase(createCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getCustomerById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCustomerById.fulfilled, (state, action) => {
        state.loading = false;
        state.data = [action.payload];
      })
      .addCase(getCustomerById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateCustomerById.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateCustomerById.fulfilled, (state, action) => {
        state.loading = false;
        state.data = state.data.map((item) =>
          item._id === action.payload._id ? action.payload : item
        );
      })
      .addCase(updateCustomerById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteCustomerById.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteCustomerById.fulfilled, (state, action) => {
        state.loading = false;
        state.data = state.data.filter((item) => item._id !== action.payload._id);
      })
      .addCase(deleteCustomerById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getCustomerSaleList.pending, (state) => {
        state.loading = true;
      })
      .addCase(getCustomerSaleList.fulfilled, (state, action) => {
        state.loading = false;

        // 1. Extract ledger array (default to empty if null)
        const newLedger = action.payload?.ledger || [];

        // 2. Merge with existing ledger data for pagination/infinite scroll
        const mergedLedger = [...state.customareSaleList.data, ...newLedger];

        // 3. Remove duplicates based on refId (since ledger items use refId)
        state.customareSaleList.data = Array.from(
          new Map(mergedLedger.map(item => [item.refId, item])).values()
        );

        // 4. Update state with top-level payload keys
        state.customareSaleList.totalDue = action.payload.totalDue;
        state.customareSaleList.currentPage = action.payload.currentPage;
        state.customareSaleList.totalPages = action.payload.totalPages;
        state.customareSaleList.totalSaleLists = action.payload.totalRecords; // total length of ledger
        state.customareSaleList.openingBalance = action.payload.openingBalance;
      })
      .addCase(getCustomerSaleList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default customerSlice.reducer;