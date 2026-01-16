import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import '../styles/auth.css';

const InstitutionSignup = () => {
    const [formData, setFormData] = useState({
        name: '',
        emailDomain: '',
        adminName: '',
        adminEmail: '',
        adminPassword: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError(''); // Clear error on input change
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            const { data } = await api.post('/institutions/register', formData);
            setSuccess({
                institutionCode: data.institutionCode,
                message: 'Institution registered successfully!'
            });
        } catch (err) {
            const message = err.response?.data?.message || 'Registration failed. Please try again.';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    // Success state - show the institution code prominently
    if (success) {
        return (
            <div className="auth-container">
                <div className="auth-card">
                    <div className="success-state">
                        <div className="success-icon">✓</div>
                        <h2 className="auth-title">Registration Successful!</h2>
                        <p className="auth-subtitle">Your institution has been created</p>
                        
                        <div className="institution-code-display">
                            <label>Your Institution Code</label>
                            <div className="code-box">{success.institutionCode}</div>
                            <p className="code-hint">Share this code with students so they can register</p>
                        </div>
                        
                        <p className="email-notice">
                            📧 We've also sent this code to your email address.
                        </p>
                        
                        <button 
                            onClick={() => navigate('/login')} 
                            className="btn btn-primary btn-full-width"
                        >
                            Continue to Login
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <Link to="/" className="auth-link mb-4 block" style={{ textAlign: 'left', textDecoration: 'none' }}>
                    &larr; Back to Home
                </Link>
                <h2 className="auth-title">Register Institution</h2>
                <p className="auth-subtitle">Create a new institution workspace</p>
                
                {error && <div className="auth-error">{error}</div>}
                
                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="label">Institution Name</label>
                        <input 
                            name="name" 
                            className="input" 
                            placeholder="e.g., MIT, Stanford University"
                            value={formData.name}
                            onChange={handleChange} 
                            required 
                            disabled={loading}
                        />
                    </div>
                    <div className="form-group">
                        <label className="label">Email Domain (Optional)</label>
                        <input 
                            name="emailDomain" 
                            className="input" 
                            placeholder="e.g., mit.edu"
                            value={formData.emailDomain}
                            onChange={handleChange}
                            disabled={loading}
                        />
                        <span className="input-hint">Students must use this email domain to register</span>
                    </div>
                    <div className="form-group">
                        <label className="label">Admin Name</label>
                        <input 
                            name="adminName" 
                            className="input" 
                            placeholder="Your full name"
                            value={formData.adminName}
                            onChange={handleChange} 
                            required 
                            disabled={loading}
                        />
                    </div>
                    <div className="form-group">
                        <label className="label">Admin Email</label>
                        <input 
                            name="adminEmail" 
                            type="email" 
                            className="input" 
                            placeholder="admin@example.com"
                            value={formData.adminEmail}
                            onChange={handleChange} 
                            required 
                            disabled={loading}
                        />
                    </div>
                    <div className="form-group">
                        <label className="label">Password</label>
                        <input 
                            name="adminPassword" 
                            type="password" 
                            className="input" 
                            placeholder="Create a strong password"
                            value={formData.adminPassword}
                            onChange={handleChange} 
                            required 
                            disabled={loading}
                            minLength={8}
                        />
                        <span className="input-hint">Minimum 8 characters</span>
                    </div>
                    <button 
                        type="submit" 
                        className="btn btn-primary btn-full-width"
                        disabled={loading}
                    >
                        {loading ? 'Creating Institution...' : 'Register Institution'}
                    </button>
                </form>
                
                <div className="auth-footer">
                    Already have an institution? <Link to="/login" className="auth-link">Login here</Link>
                </div>
            </div>
        </div>
    );
};

export default InstitutionSignup;
