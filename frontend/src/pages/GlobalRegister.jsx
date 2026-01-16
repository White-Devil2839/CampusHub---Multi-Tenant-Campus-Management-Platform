import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/auth.css';

const GlobalRegister = () => {
    const [institutionCode, setInstitutionCode] = useState('');
    const navigate = useNavigate();

    const handleStudentJoin = (e) => {
        e.preventDefault();
        if (institutionCode.trim()) {
            navigate(`/${institutionCode}/register`);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2 className="auth-title">Join CampusHub</h2>
                <p className="auth-subtitle">Create an account to get started</p>

                <div className="auth-section">
                    <h3>For Students / Members</h3>
                    <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
                        Enter your Institution Code to join your campus.
                    </p>
                    <form onSubmit={handleStudentJoin} className="flex gap-2">
                        <input 
                            className="input" 
                            placeholder="Institution Code (e.g. 1234u6)"
                            value={institutionCode}
                            onChange={(e) => setInstitutionCode(e.target.value)}
                            required
                        />
                        <button type="submit" className="btn btn-secondary">Go</button>
                    </form>
                </div>

                <div className="divider">or</div>

                <div className="auth-section">
                    <h3>For Administrators</h3>
                    <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
                        Want to set up CampusHub for your university or club?
                    </p>
                    <Link to="/institution/signup" className="btn btn-primary btn-full-width">
                        Register New Institution
                    </Link>
                </div>

                <div className="auth-footer">
                    <p>Already have an account? <Link to="/login" className="auth-link">Login here</Link></p>
                </div>
            </div>
        </div>
    );
};

export default GlobalRegister;
