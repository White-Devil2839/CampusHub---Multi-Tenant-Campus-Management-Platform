import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import '../styles/auth.css';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const id = searchParams.get('id');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.post('/auth/reset-password', { token, id, password });
            setMessage(data.message);
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2 className="auth-title">Reset Password</h2>
                {message && <div style={{ color: 'green', marginBottom: '1rem' }}>{message}</div>}
                {error && <div className="auth-error">{error}</div>}
                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="label">New Password</label>
                        <input
                            type="password"
                            className="input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary btn-full-width">Update Password</button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
