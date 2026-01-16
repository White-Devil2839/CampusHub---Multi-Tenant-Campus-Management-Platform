import React, { useContext } from 'react';
import { Navigate, Outlet, useParams } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const ProtectedRoute = () => {
    const { user, loading } = useContext(AuthContext);
    const { institutionCode } = useParams();

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!user) {
        return <Navigate to={`/${institutionCode ? institutionCode : ''}/login`} replace />;
    }

    // Optional: Check if user belongs to this institution (for multi-tenant safety)
    if (institutionCode && user.institutionCode && user.institutionCode !== institutionCode) {
         // Redirect to their own dashboard or show unauthorized
         // For now, let's redirect them to their own dashboard
         return <Navigate to={`/${user.institutionCode}/dashboard`} replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
