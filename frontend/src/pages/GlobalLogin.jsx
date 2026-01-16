import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import api from '../utils/api';
import '../styles/auth.css';

const GlobalLogin = () => {
    const { loginSuccess } = React.useContext(AuthContext);
    const [roleSelection, setRoleSelection] = useState(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        try {
            const { data } = await api.post('/auth/login', { email, password });
            
            if (data.success) {
                loginSuccess(data);
                
                if (data.redirect) {
                    navigate(data.redirect);
                } else {
                    if (data.role === 'ADMIN') {
                        navigate(`/${data.institutionCode}/admin`);
                    } else {
                        navigate(`/${data.institutionCode}/dashboard`);
                    }
                }
            } else {
                setError('Login failed. Please try again.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const resetSelection = () => {
        setRoleSelection(null);
        setError('');
        setEmail('');
        setPassword('');
    };

    if (!roleSelection) {
        return (
            <div className="auth-container">
                <div className="auth-card">
                    <h2 className="auth-title">Log in to CampusHub</h2>
                    <p className="auth-subtitle">
                        Select your account type to continue
                    </p>

                    <div className="flex flex-col gap-4">
                        <button
                            onClick={() => setRoleSelection('institution')}
                            className="btn btn-primary btn-full-width"
                        >
                            Institution Admin
                        </button>
                        <button
                            onClick={() => setRoleSelection('student')}
                            className="btn btn-secondary btn-full-width"
                        >
                            Student / Member
                        </button>
                    </div>
                    <div className="auth-footer">
                        <Link to="/" className="auth-link">
                            Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <button onClick={resetSelection} className="auth-link mb-4 block" style={{ textAlign: 'left' }}> 
                    &larr; Back
                </button>
                
                <h2 className="auth-title">
                    {roleSelection === 'institution' ? 'Institution Login' : 'Student Login'}
                </h2>
                
                {error && (
                    <div className="auth-error">
                        {error}
                    </div>
                )}
                
                <form className="auth-form" onSubmit={handleLogin}>
                    <div className="form-group">
                        <label htmlFor="email" className="label">
                            Email address
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                if (error) setError('');
                            }}
                            className="input"
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password" className="label">
                            Password
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                if (error) setError('');
                            }}
                            className="input"
                            disabled={loading}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-full-width"
                        disabled={loading}
                    >
                        {loading ? 'Signing in...' : 'Sign in'}
                    </button>
                </form>
                
                <div className="auth-footer">
                    <Link to="/forgot-password" className="auth-link">
                        Forgot Password?
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default GlobalLogin;
