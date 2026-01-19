import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Decoded token payload + extra info
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        // Check expiry
        if (decoded.exp * 1000 < Date.now()) {
          logout();
        } else {
            // We can also merge with stored userInfo if we have extra fields not in token
            const storedInfo = localStorage.getItem('userInfo');
            const parsedInfo = storedInfo ? JSON.parse(storedInfo) : {};
            setUser({ ...decoded, ...parsedInfo });
        }
      } catch (error) {
        console.error("Invalid token", error);
        logout();
      }
    }
    setLoading(false);
  }, []);

  const loginSuccess = (data) => {
      // data: { token, role, institutionCode, name, ... }
      localStorage.setItem('token', data.token);
      
      const userInfo = {
          role: data.role,
          institutionCode: data.institutionCode,
          name: data.name // Store name for display in dashboard
      };
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
      
      const decoded = jwtDecode(data.token);
      setUser({ ...decoded, ...userInfo });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('user'); // Clean legacy
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loginSuccess, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
