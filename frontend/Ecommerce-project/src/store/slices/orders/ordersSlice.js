import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../../api/api.js';

// Fetch orders from MongoDB
export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async (userId, { rejectWithValue }) => {
    try {
      const url = userId ? `/orders?userId=${encodeURIComponent(userId)}` : '/orders';
      const response = await api.get(url);
      return response.data?.data || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Create order in MongoDB
export const createOrderAsync = createAsyncThunk(
  'orders/createOrderAsync',
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await api.post('/orders', orderData);
      return response.data?.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Update order status in MongoDB
export const updateOrderStatusAsync = createAsyncThunk(
  'orders/updateOrderStatusAsync',
  async ({ orderId, status }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/orders/${orderId}/status`, { status });
      return response.data?.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Cancel order in MongoDB
export const cancelOrderAsync = createAsyncThunk(
  'orders/cancelOrderAsync',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await api.put(`/orders/${orderId}/cancel`);
      return response.data?.data;
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

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    setOrders: (state, action) => {
      state.items = action.payload || [];
    },
    createOrder: (state, action) => {
      const payload = action.payload || {};
      const newOrder = {
        orderId: payload.orderId || Date.now(),
        ...payload,
        status: payload.status || 'Pending',
      };
      state.items.unshift(newOrder);
    },
    updateOrderStatus: (state, action) => {
      const data = action.payload || {};
      const order = state.items.find(
        (item) => String(item.orderId ?? item._id ?? item.id) === String(data.orderId)
      );

      if (!order) return;

      order.status = data.status;
      if (String(data.status).toLowerCase() === 'delivered') {
        order.paymentStatus = 'Paid';
      }
    },
    cancelOrder: (state, action) => {
      const order = state.items.find(
        (item) => String(item.orderId ?? item._id ?? item.id) === String(action.payload)
      );

      if (order) {
        order.status = 'Cancelled';
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createOrderAsync.fulfilled, (state, action) => {
        if (action.payload) {
          state.items.unshift(action.payload);
        }
      })
      .addCase(updateOrderStatusAsync.fulfilled, (state, action) => {
        const updated = action.payload;
        if (updated) {
          state.items = state.items.map((order) =>
            String(order.orderId ?? order._id) === String(updated.orderId ?? updated._id)
              ? { ...order, ...updated }
              : order
          );
        }
      })
      .addCase(cancelOrderAsync.fulfilled, (state, action) => {
        const updated = action.payload;
        if (updated) {
          state.items = state.items.map((order) =>
            String(order.orderId ?? order._id) === String(updated.orderId ?? updated._id)
              ? { ...order, ...updated }
              : order
          );
        }
      });
  },
});

export const { setOrders, createOrder, updateOrderStatus, cancelOrder } = ordersSlice.actions;
export default ordersSlice.reducer;
