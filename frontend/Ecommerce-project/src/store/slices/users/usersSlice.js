import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../../api/api.js';

// Fetch users from MongoDB
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/users');
      return response.data?.data || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Add user to MongoDB
export const addUserAsync = createAsyncThunk(
  'users/addUserAsync',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post('/users/register', userData);
      return response.data?.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Delete user from MongoDB
export const deleteUserAsync = createAsyncThunk(
  'users/deleteUserAsync',
  async (identifier, { rejectWithValue }) => {
    try {
      await api.delete(`/users/${identifier}`);
      return identifier;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const initialState = {
  items: [],
  loading: false,
  error: null,
};

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setUsers: (state, action) => {
      state.items = action.payload || [];
    },
    addUser: (state, action) => {
      state.items.push(action.payload);
    },
    deleteUser: (state, action) => {
      const { email, role, _id } = action.payload || {};
      state.items = state.items.filter(
        (item) => !(item.email === email || (item._id && item._id === _id))
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addUserAsync.fulfilled, (state, action) => {
        if (action.payload) {
          state.items.push(action.payload);
        }
      })
      .addCase(deleteUserAsync.fulfilled, (state, action) => {
        const id = action.payload;
        state.items = state.items.filter(
          (user) => user.email !== id && user._id !== id
        );
      });
  },
});

export const { setUsers, addUser, deleteUser } = usersSlice.actions;
export default usersSlice.reducer;
