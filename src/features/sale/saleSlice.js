import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import saleService from '../../services/saleService';

// Async Thunks
export const getAllSales = createAsyncThunk(
  'sale/getAll',
  async (filters, thunkAPI) => {
    try {
      return await saleService.getAllSales(filters);
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

export const createSale = createAsyncThunk(
  'sales',
  async (saleData, thunkAPI) => {
    try {
      return await saleService.createSale(saleData);
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

export const getSaleById = createAsyncThunk(
  'sale/getById',
  async (id, thunkAPI) => {
    try {
      return await saleService.getSaleById(id);
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

export const updateSaleById = createAsyncThunk(
  'sale/updateById',
  async ({ id, saleData }, thunkAPI) => {
    try {
      return await saleService.updateSaleById(id, saleData);
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

export const deleteSaleById = createAsyncThunk(
  'sale/deleteById',
  async (id, thunkAPI) => {
    try {
      return await saleService.deleteSaleById(id);
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

export const getSalesByCustomer = createAsyncThunk(
  'sale/getByCustomer',
  async (customerId, thunkAPI) => {
    try {
      return await saleService.getSalesByCustomer(customerId);
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
  totalSale: 0,
  saleDetails: null,
  salesByCustomer: [],
  loading: false,
  error: null,
};

const saleSlice = createSlice({
  name: 'sale',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAllSales.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllSales.fulfilled, (state, action) => {
        state.loading = false;

        // 1. Extract sales from payload and add any custom fields (like Price_PerUnitSpecial)
        const newData = action.payload?.sales?.map((sale) => ({
          ...sale,
          // Add custom property if needed, otherwise just return the sale object
          Price_PerUnitSpecial: sale.pricePerUnit || 0,
        })) || [];

        // 2. Merge existing state data with the incoming new data
        const mergedData = [...state.data, ...newData];

        // 3. Remove duplicates based on _id using a Map
        // This keeps the latest version of the object if the IDs match
        state.data = Array.from(
          new Map(mergedData.map(item => [item._id, item])).values()
        );

        // 4. Update pagination metadata
        state.currentPage = action.payload.currentPage;
        state.totalPages = action.payload.totalPages;
        state.totalSales = action.payload.totalSales; // Ensure this matches your service return key
      })
      .addCase(getAllSales.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createSale.pending, (state) => {
        state.loading = true;
      })
      .addCase(createSale.fulfilled, (state, action) => {
        state.loading = false;
        state.data.push(action.payload);
      })
      .addCase(createSale.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getSaleById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getSaleById.fulfilled, (state, action) => {
        state.loading = false;
        state.saleDetails = action.payload;
      })
      .addCase(getSaleById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateSaleById.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateSaleById.fulfilled, (state, action) => {
        state.loading = false;
        state.data = state.data.map((item) =>
          item._id === action.payload._id ? action.payload : item
        );
      })
      .addCase(updateSaleById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteSaleById.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteSaleById.fulfilled, (state, action) => {
        state.loading = false;
        state.data = state.data.filter((item) => item._id !== action.payload._id);
      })
      .addCase(deleteSaleById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getSalesByCustomer.pending, (state) => {
        state.loading = true;
      })
      .addCase(getSalesByCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.salesByCustomer = action.payload;
      })
      .addCase(getSalesByCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default saleSlice.reducer;