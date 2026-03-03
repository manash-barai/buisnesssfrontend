import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import purchaseService from '../../services/purchaseService';

// Async Thunks
export const getAllPurchases = createAsyncThunk(
  'purchase/getAll',
  async (filters, thunkAPI) => {
    try {
      return await purchaseService.getAllPurchases(filters);
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

export const createPurchase = createAsyncThunk(
  'purchase/create',
  async (purchaseData, thunkAPI) => {
    try {
      return await purchaseService.createPurchase(purchaseData);
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

export const getPurchaseById = createAsyncThunk(
  'purchase/getById',
  async (id, thunkAPI) => {
    try {
      return await purchaseService.getPurchaseById(id);
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

export const updatePurchaseById = createAsyncThunk(
  'purchase/updateById',
  async ({ id, purchaseData }, thunkAPI) => {
    try {
      return await purchaseService.updatePurchaseById(id, purchaseData);
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

export const deletePurchaseById = createAsyncThunk(
  'purchase/deleteById',
  async (id, thunkAPI) => {
    try {
      return await purchaseService.deletePurchaseById(id);
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
  currentPage: 1,
  totalPages: 1,
  limit: 10,
  totalPurchases: 0,
  loading: false,
  error: null,
};

const purchaseSlice = createSlice({
  name: 'purchase',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAllPurchases.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllPurchases.fulfilled, (state, action) => {
        state.loading = false;

        const newData = action.payload?.purchases.map((value) => ({
          ...value,
          Price_PerUnitSpecial: value.Price_PerUnit,
        })) || [];

        // 🔥 Always merge with existing data
        const mergedData = [...state.data, ...newData];

        // 🔥 Remove duplicates based on _id
        state.data = Array.from(
          new Map(mergedData.map(item => [item._id, item])).values()
        );

        state.currentPage = action.payload.currentPage;
        state.totalPages = action.payload.totalPages;
        state.totalPurchases = action.payload.totalPurchases;
      })

      .addCase(getAllPurchases.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createPurchase.pending, (state) => {
        state.loading = true;
      })
      .addCase(createPurchase.fulfilled, (state, action) => {
        state.loading = false;
        state.data.unshift(action.payload[0]);
      })

      .addCase(createPurchase.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getPurchaseById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getPurchaseById.fulfilled, (state, action) => {
        state.loading = false;
        state.data = [action.payload];
      })
      .addCase(getPurchaseById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updatePurchaseById.pending, (state) => {
        state.loading = true;
      })
      .addCase(updatePurchaseById.fulfilled, (state, action) => {
        state.loading = false;
        state.data = state.data.map((item) =>
          item._id === action.payload._doc._id ? action.payload._doc : item
        );
      })
      .addCase(updatePurchaseById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deletePurchaseById.pending, (state) => {
        state.loading = true;
      })
      .addCase(deletePurchaseById.fulfilled, (state, action) => {
        state.loading = false;
        state.data = state.data.filter((item) => item._id !== action.payload._id);
      })
      .addCase(deletePurchaseById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default purchaseSlice.reducer;