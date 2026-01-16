import React, { useState, useContext } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import api from '../utils/api';
import Card from '../components/Card';
import Button from '../components/Button';

import '../styles/auth.css';

const Register = () => {
  const { institutionCode } = useParams();
  const navigate = useNavigate();
  const { loginSuccess } = useContext(AuthContext);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Password validation
  const passwordChecks = {
    length: formData.password.length >= 8,
    uppercase: /[A-Z]/.test(formData.password),
    lowercase: /[a-z]/.test(formData.password),
    number: /\d/.test(formData.password),
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(''); // Clear error on input change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
        const { data } = await api.post(`/${institutionCode}/auth/register`, formData);
        
        if (data.success) {
            loginSuccess(data);
             if (data.redirect) {
                navigate(data.redirect);
            } else {
                 navigate(`/${institutionCode}/dashboard`);
            }
        } else {
             setError('Registration failed. Please try again.');
        }
    } catch (err) {
        const message = err.response?.data?.message || 'Registration failed. Please try again.';
        setError(message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <Card className="auth-card">
        <Link to={`/${institutionCode}/login`} className="auth-link mb-4 block" style={{ textAlign: 'left', textDecoration: 'none' }}>
          &larr; Back to Login
        </Link>
        <h2 className="auth-title">Create Account</h2>
        <p className="auth-subtitle">Join {institutionCode}</p>
        
        {error && <div className="auth-error">{error}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="label">Full Name</label>
            <input
              type="text"
              name="name"
              className="input"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label className="label">Email</label>
            <input
              type="email"
              name="email"
              className="input"
              placeholder="your.email@example.com"
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
              placeholder="Create a strong password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
            />
            {formData.password && (
              <div className="password-requirements">
                <p>Password must have:</p>
                <ul>
                  <li className={passwordChecks.length ? 'valid' : ''}>At least 8 characters</li>
                  <li className={passwordChecks.uppercase ? 'valid' : ''}>One uppercase letter</li>
                  <li className={passwordChecks.lowercase ? 'valid' : ''}>One lowercase letter</li>
                  <li className={passwordChecks.number ? 'valid' : ''}>One number</li>
                </ul>
              </div>
            )}
          </div>
          <Button type="submit" className="btn-full-width" disabled={loading}>
            {loading ? 'Creating Account...' : 'Register'}
          </Button>
        </form>
        
        <div className="auth-footer">
          Already have an account? <Link to={`/${institutionCode}/login`} className="auth-link">Login here</Link>
        </div>
      </Card>
    </div>
  );
};

export default Register;
