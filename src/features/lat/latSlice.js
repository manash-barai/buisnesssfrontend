import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import latService from '../../services/latService';

// Async Thunks
export const getAllLats = createAsyncThunk(
  'lat/getAll',
  async (filter, thunkAPI) => {
    try {
      return await latService.getAllLats(filter);
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

export const createLat = createAsyncThunk(
  'lat/create',
  async (latData, thunkAPI) => {
    try {
      return await latService.createLat(latData);
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

export const getLatById = createAsyncThunk(
  'lat/getById',
  async (id, thunkAPI) => {
    try {
      return await latService.getLatById(id);
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

export const updateLatById = createAsyncThunk(
  'lat/updateById',
  async ({ id, latData }, thunkAPI) => {
    try {
      return await latService.updateLatById(id, latData);
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

export const deleteLatById = createAsyncThunk(
  'lat/deleteById',
  async (id, thunkAPI) => {
    try {
      return await latService.deleteLatById(id);
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
  totalLats: 0,
  pagination: {},
  loading: false,
  error: null,
};

const latSlice = createSlice({
  name: 'lat',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAllLats.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllLats.fulfilled, (state, action) => {
        state.loading = false;
        const newData = action.payload?.lats || [];
        const mergedData = [...state.data, ...newData];
        state.data = Array.from(
          new Map(mergedData.map(item => [item._id, item])).values()
        );
        state.currentPage = action.payload.currentPage;
        state.totalPages = action.payload.totalPages;
        state.totalLats = action.payload.totalLats;
      })
      .addCase(getAllLats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createLat.pending, (state) => {
        state.loading = true;
      })
      .addCase(createLat.fulfilled, (state, action) => {
        state.loading = false;
        state.data.push(action.payload);
      })
      .addCase(createLat.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(getLatById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getLatById.fulfilled, (state, action) => {
        state.loading = false;
        state.data = [action.payload];
      })
      .addCase(getLatById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateLatById.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateLatById.fulfilled, (state, action) => {
        state.loading = false;
        state.data = state.data.map((item) =>
          item._id === action.payload._id ? action.payload : item
        );
      })
      .addCase(updateLatById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteLatById.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteLatById.fulfilled, (state, action) => {
        state.loading = false;
        state.data = state.data.filter((item) => item._id !== action.payload._id);
      })
      .addCase(deleteLatById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default latSlice.reducer;
