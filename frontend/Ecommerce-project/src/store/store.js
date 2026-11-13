import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/auth/authSlice.js';
import usersReducer from './slices/users/usersSlice.js';
import productsReducer from './slices/products/productsSlice.js';
import cartReducer from './slices/cart/cartSlice.js';
import ordersReducer from './slices/orders/ordersSlice.js';

// Global Redux Store
export const store = configureStore({
  reducer: {
    auth: authReducer,
    users: usersReducer,
    products: productsReducer,
    cart: cartReducer,
    orders: ordersReducer,
  },
});

// Sirf logged in user session aur current shopping cart session persist karenge
// Baqi saara data (Products, Users, Orders) MongoDB database se aayega
const persistSession = () => {
  const { auth, cart } = store.getState();

  if (auth.user) {
    localStorage.setItem('loggedInUser', JSON.stringify(auth.user));
  } else {
    localStorage.removeItem('loggedInUser');
  }

  // Cart browser session me persist rehta hai checkout se pehle
  localStorage.setItem('YourOrders', JSON.stringify(cart.items));

  // Purane localStorage keys saaf kar dein
  localStorage.removeItem('users');
  localStorage.removeItem('productList');
  localStorage.removeItem('deletedProductIds');
  localStorage.removeItem('OrderHistory');
  localStorage.removeItem('productListSeeded');
};

store.subscribe(persistSession);
persistSession();

export default store;
