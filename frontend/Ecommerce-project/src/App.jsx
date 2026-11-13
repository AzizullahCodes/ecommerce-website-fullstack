import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import AppRoutes from './utils/routes/routes';
import { fetchProducts } from './store/slices/products/productsSlice';
import { fetchOrders } from './store/slices/orders/ordersSlice';
import { fetchUsers } from './store/slices/users/usersSlice';

const App = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    // MongoDB se products fetch karo
    dispatch(fetchProducts());

    // User session ke mutabiq orders aur admin users fetch karo
    if (user?.email) {
      if (user.role === 'admin') {
        dispatch(fetchOrders());
        dispatch(fetchUsers());
      } else {
        dispatch(fetchOrders(user.email));
      }
    }
  }, [dispatch, user]);

  return (
    <div>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </div>
  );
};

export default App;
