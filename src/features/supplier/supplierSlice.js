import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import supplierService from '../../services/supplierService';

// Async Thunks
export const getAllSuppliers = createAsyncThunk(
  'supplier/getAll',
  async (filters, thunkAPI) => {
   
    try {
      return await supplierService.getAllSuppliers(filters);
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

export const createSupplier = createAsyncThunk(
  'supplier/create',
  async (supplierData, thunkAPI) => {
    try {
      return await supplierService.createSupplier(supplierData);
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

export const getSupplierById = createAsyncThunk(
  'supplier/getById',
  async (id, thunkAPI) => {
    try {
      return await supplierService.getSupplierById(id);
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

export const updateSupplierById = createAsyncThunk(
  'supplier/updateById',
  async ({ id, supplierData }, thunkAPI) => {
    try {
      return await supplierService.updateSupplierById(id, supplierData);
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

export const deleteSupplierById = createAsyncThunk(
  'supplier/deleteById',
  async (id, thunkAPI) => {
    try {
      return await supplierService.deleteSupplierById(id);
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
  totalSupplier: 0,
  loading: false,
  error: null,
};

const supplierSlice = createSlice({
  name: 'supplier',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAllSuppliers.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllSuppliers.fulfilled, (state, action) => {
        state.loading = false;

        // 1. Process incoming data (with optional field mapping)
        const newData = action.payload?.suppliers?.map((supplier) => ({
          ...supplier,
          // Add custom property if needed
          Price_PerUnitSpecial: supplier.pricePerUnit || 0,
        })) || [];

        // 2. Merge existing data with new data
        const mergedData = [...state.data, ...newData];

        // 3. De-duplicate using Map (ensures unique records by _id)
        state.data = Array.from(
          new Map(mergedData.map(item => [item._id, item])).values()
        );

        // 4. Update pagination metadata
        state.currentPage = action.payload?.currentPage || 1;
        state.totalPages = action.payload?.totalPages || 0;
        state.totalSuppliers = action.payload?.totalSuppliers || 0;
      })
      .addCase(getAllSuppliers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createSupplier.pending, (state) => {
        state.loading = true;
      })
      .addCase(createSupplier.fulfilled, (state, action) => {
        state.loading = false;
        state.data.push(action.payload);
      })
      .addCase(createSupplier.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getSupplierById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getSupplierById.fulfilled, (state, action) => {
        state.loading = false;
        state.data = [action.payload];
      })
      .addCase(getSupplierById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateSupplierById.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateSupplierById.fulfilled, (state, action) => {
        state.loading = false;
        state.data = state.data.map((item) =>
          item._id === action.payload._id ? action.payload : item
        );
      })
      .addCase(updateSupplierById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteSupplierById.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteSupplierById.fulfilled, (state, action) => {
        state.loading = false;
        state.data = state.data.filter((item) => item._id !== action.payload._id);
      })
      .addCase(deleteSupplierById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default supplierSlice.reducer;