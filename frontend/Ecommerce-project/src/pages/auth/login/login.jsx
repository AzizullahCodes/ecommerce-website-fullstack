import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { setUser } from '../../../store/slices/auth/authSlice.js';
import { showError, showSuccess } from '../../../utils/sweetAlert.js';
import api from '../../../api/api.js';
import './login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const users = useSelector((state) => state.users.items);

  const handleLogin = async (e) => {
    e.preventDefault();

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      await showError('Missing details', 'Email & password are required');
      return;
    }

    setLoading(true);

    try {
      // 1. MongoDB API Call
      const res = await api.post('/users/login', {
        email: cleanEmail,
        password,
      });

      const userData = res.data?.data;

      // Save in Redux
      dispatch(setUser(userData));

      // Save in Cookie
      Cookies.set('myApp_login', JSON.stringify(userData), {
        expires: 7,
        path: '/',
      });

      await showSuccess('Logged in', 'You have logged in successfully');

      navigate(
        userData.role === 'admin'
          ? '/adminDashboard'
          : '/userDashboard'
      );
    } catch (apiError) {
      // Fallback: Agar offline ho ya local Redux store check karna ho
      const foundUser = users.find(
        (item) =>
          item.email?.toLowerCase() === cleanEmail &&
          item.password === password
      );

      if (foundUser) {
        const userData = {
          name: foundUser.name,
          email: foundUser.email,
          role: foundUser.role,
        };
        dispatch(setUser(userData));
        Cookies.set('myApp_login', JSON.stringify(userData), {
          expires: 7,
          path: '/',
        });
        await showSuccess('Logged in', 'You have logged in successfully');
        navigate(
          foundUser.role === 'admin'
            ? '/adminDashboard'
            : '/userDashboard'
        );
      } else {
        const msg = apiError.response?.data?.message || 'Invalid email or password';
        await showError('Login failed', msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <form className="signup-card" onSubmit={handleLogin}>
        <h1>Login Now</h1>

        <label className="field">
          Email
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </label>

        <label className="field">
          Password
          <div className="password-input-wrapper">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              title={showPassword ? 'Hide password' : 'Show password'}
            >
              <i className={showPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'}></i>
            </button>
          </div>
        </label>

        <button type="submit" className="signup-btn" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <p className="auth-switch">
          New here? <Link to="/">Create an account</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
