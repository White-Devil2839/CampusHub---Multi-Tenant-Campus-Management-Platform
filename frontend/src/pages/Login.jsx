import React, { useState, useContext } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import api from '../utils/api';
import Card from '../components/Card';
import Button from '../components/Button';

import '../styles/auth.css';

const Login = () => {
  const { institutionCode } = useParams();
  const navigate = useNavigate();
  const { loginSuccess } = useContext(AuthContext);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(''); // Clear error on input change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
        const { data } = await api.post(`/${institutionCode}/auth/login`, formData);
        
        if (data.success) {
            loginSuccess(data);
            if (data.redirect) {
                navigate(data.redirect);
            } else {
                 navigate(`/${institutionCode}/dashboard`);
            }
        } else {
             setError('Login failed. Please try again.');
        }
    } catch (err) {
        setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <Card className="auth-card">
        <Link to="/" className="auth-link mb-4 block" style={{ textAlign: 'left', textDecoration: 'none' }}>
            &larr; Back to Home
        </Link>
        <h2 className="auth-title">Welcome Back</h2>
        <p className="auth-subtitle">Login to {institutionCode}</p>
        
        {error && <div className="auth-error">{error}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="label">Email</label>
            <input
              type="email"
              name="email"
              className="input"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label className="label">Password</label>
            <input
              type="password"
              name="password"
              className="input"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          <Button type="submit" className="btn-full-width" disabled={loading}>
            {loading ? 'Signing in...' : 'Login'}
          </Button>
        </form>
        
        <div className="auth-footer">
          <Link to="/forgot-password" className="auth-link text-sm mb-2 block">Forgot Password?</Link>
          <p>Don't have an account? <Link to={`/${institutionCode}/register`} className="auth-link">Register here</Link></p>
        </div>
      </Card>
    </div>
  );
};

export default Login;
