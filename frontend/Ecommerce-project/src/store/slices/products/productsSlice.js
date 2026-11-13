import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import defaultProducts from '../../../data/defaultProducts.js';
import api from '../../../api/api.js';

// Fetch products from MongoDB
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/products');
      let products = response.data?.data || [];

      // Agar MongoDB empty ho to default products seed kar dein
      if (products.length === 0) {
        const seedRes = await api.post('/products/seed', { products: defaultProducts });
        products = seedRes.data?.data || defaultProducts;
      }

      return products;
    } catch (error) {
      console.warn('MongoDB fetch error, falling back to local catalog:', error.message);
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Add product to MongoDB
export const addProductAsync = createAsyncThunk(
  'products/addProductAsync',
  async (productData, { rejectWithValue }) => {
    try {
      const response = await api.post('/products', productData);
      return response.data?.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Update product in MongoDB
export const updateProductAsync = createAsyncThunk(
  'products/updateProductAsync',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/products/${id}`, data);
      return response.data?.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Delete product in MongoDB
export const deleteProductAsync = createAsyncThunk(
  'products/deleteProductAsync',
  async (productId, { rejectWithValue }) => {
    try {
      await api.delete(`/products/${productId}`);
      return productId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Restore default products in MongoDB
export const restoreDefaultProductsAsync = createAsyncThunk(
  'products/restoreDefaultProductsAsync',
  async (_, { rejectWithValue }) => {
    try {
      const seedRes = await api.post('/products/seed', { products: defaultProducts });
      return seedRes.data?.data || defaultProducts;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const initialState = {
  items: defaultProducts,
  deletedIds: [],
  loading: false,
  error: null,
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setProducts: (state, action) => {
      state.items = action.payload;
    },
    addProduct: (state, action) => {
      state.items.push(action.payload);
    },
    updateProduct: (state, action) => {
      const payload = action.payload;
      state.items = state.items.map((product) =>
        product.productId === payload?.productId || product._id === payload?._id ? { ...product, ...payload } : product
      );
    },
    deleteProduct: (state, action) => {
      const id = action.payload;
      state.items = state.items.filter(
        (product) => product.productId !== id && product._id !== id && product.id !== id
      );
    },
    restoreDefaultProducts: (state) => {
      state.items = defaultProducts;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add Product Async
      .addCase(addProductAsync.fulfilled, (state, action) => {
        if (action.payload) {
          state.items.unshift(action.payload);
        }
      })
      // Update Product Async
      .addCase(updateProductAsync.fulfilled, (state, action) => {
        const updated = action.payload;
        if (updated) {
          state.items = state.items.map((item) =>
            item.productId === updated.productId || item._id === updated._id ? updated : item
          );
        }
      })
      // Delete Product Async
      .addCase(deleteProductAsync.fulfilled, (state, action) => {
        const id = action.payload;
        state.items = state.items.filter(
          (product) => product.productId !== id && product._id !== id
        );
      })
      // Restore Defaults
      .addCase(restoreDefaultProductsAsync.fulfilled, (state, action) => {
        state.items = action.payload;
      });
  },
});

export const {
  setProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  restoreDefaultProducts,
} = productsSlice.actions;

export default productsSlice.reducer;
