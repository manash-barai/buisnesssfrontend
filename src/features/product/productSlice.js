import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import productService from '../../services/productService';

// Async Thunks
export const getAllProducts = createAsyncThunk(
  'product/getAll',
  async (filters, thunkAPI) => {
    try {
      return await productService.getAllProducts(filters);
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

export const createProduct = createAsyncThunk(
  'product/create',
  async (productData, thunkAPI) => {
    try {
      return await productService.createProduct(productData);
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

export const getProductById = createAsyncThunk(
  'product/getById',
  async (id, thunkAPI) => {
    try {
      return await productService.getProductById(id);
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

export const updateProductById = createAsyncThunk(
  'product/updateById',
  async ({ id, productData }, thunkAPI) => {
    try {
      return await productService.updateProductById(id, productData);
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

export const deleteProductById = createAsyncThunk(
  'product/deleteById',
  async (id, thunkAPI) => {
    try {
      return await productService.deleteProductById(id);
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

export const adjustProductStock = createAsyncThunk(
  'product/adjustStock',
  async ({ id, stockData }, thunkAPI) => {
    try {
      return await productService.adjustProductStock(id, stockData);
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
  currentPage:1, 
  totalPages:1,
  limit: 10,
  totalProducts: 0,
  loading: false,
  error: null,
};

const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAllProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload?.products;
        state.currentPage=action.payload?.currentPage;
        state.totalPages=action.payload?.totalPages;
        state.totalProducts=action.payload?.totalProducts;

      })
      .addCase(getAllProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.data.push(action.payload);
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getProductById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.data = [action.payload];
      })
      .addCase(getProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateProductById.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.data = state.data.map((item) =>
          item._id === action.payload._doc._id ? action.payload._doc : item
        );
      })
      .addCase(updateProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteProductById.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.data = state.data.filter((item) => item._id !== action.payload._id);
      })
      .addCase(deleteProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(adjustProductStock.pending, (state) => {
        state.loading = true;
      })
      .addCase(adjustProductStock.fulfilled, (state, action) => {
        state.loading = false;
        state.data = state.data.map((item) =>
          item._id === action.payload._id ? action.payload : item
        );
      })
      .addCase(adjustProductStock.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default productSlice.reducer;