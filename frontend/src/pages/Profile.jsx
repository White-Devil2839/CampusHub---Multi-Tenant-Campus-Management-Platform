import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import Card from '../components/Card';
import Button from '../components/Button';
import AuthContext from '../context/AuthContext';

import '../styles/dashboard.css';

const Profile = () => {
  const { institutionCode } = useParams();
  const [memberships, setMemberships] = useState([]);
  const [registrations, setRegistrations] = useState([]);

  useEffect(() => {
    fetchData();
  }, [institutionCode]);

  const fetchData = async () => {
    try {
      const memRes = await api.get(`/${institutionCode}/me/memberships`);
      setMemberships(memRes.data);
      const regRes = await api.get(`/${institutionCode}/me/event-registrations`);
      setRegistrations(regRes.data);
    } catch (error) {
      console.error('Error fetching profile data', error);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="section-container">
        <h1 className="dashboard-title">My Profile</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="section-container">
          <h2 className="section-title mb-4">My Club Memberships</h2>
          {memberships.length === 0 ? (
            <p className="text-gray-500">No memberships yet.</p>
          ) : (
            <div className="flex flex-col">
              {memberships.map((mem) => (
                <div key={mem._id} className="list-item">
                  <span className="font-medium text-lg">{mem.clubId.name}</span>
                  <span className={`status-badge ${mem.status === 'APPROVED' ? 'status-active' : mem.status === 'REJECTED' ? 'badge-danger' : 'status-pending'}`}>
                    {mem.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="section-container">
          <h2 className="section-title mb-4">Registered Events</h2>
          {registrations.length === 0 ? (
            <p className="text-gray-500">No event registrations yet.</p>
          ) : (
            <div className="flex flex-col">
              {registrations.map((reg) => (
                <div key={reg._id} className="list-item">
                  <div className="item-info">
                      <h4>{reg.eventId.title}</h4>
                      <p>{new Date(reg.eventId.date).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Change Password Section */}
          <ChangePassword />

          {/* Delete Account Section */}
          <DeleteAccount />
      </div>
    </div>
  );
};

const ChangePassword = () => {
  const [passData, setPassData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setPassData({ ...passData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (passData.newPassword !== passData.confirmPassword) {
      return setError("New passwords don't match");
    }

    try {
      await api.put('/auth/password', {
        currentPassword: passData.currentPassword,
        newPassword: passData.newPassword
      });
      setMessage('Password updated successfully');
      setPassData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update password');
    }
  };

  return (
    <div className="section-container">
      <h2 className="section-title mb-4">Change Password</h2>
      {message && <div className="bg-green-100 text-green-700 p-3 rounded mb-4 text-sm font-medium">{message}</div>}
      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm font-medium">{error}</div>}
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
           <label className="label">Current Password</label>
           <input
             type="password"
             name="currentPassword"
             className="input"
             value={passData.currentPassword}
             onChange={handleChange}
             required
           />
        </div>
        <div>
           <label className="label">New Password</label>
           <input
             type="password"
             name="newPassword"
             className="input border-gray-300"
             value={passData.newPassword}
             onChange={handleChange}
             required
             minLength={6}
           />
        </div>
        <div>
           <label className="label">Confirm New Password</label>
           <input
             type="password"
             name="confirmPassword"
             className="input"
             value={passData.confirmPassword}
             onChange={handleChange}
             required
             minLength={6}
           />
        </div>
        <Button type="submit" variant="primary">Update Password</Button>
      </form>
    </div>
  );
};

const DeleteAccount = () => {
    const { institutionCode } = useParams();
    const { logout } = useContext(AuthContext);
    const [confirming, setConfirming] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleDelete = async (e) => {
        e.preventDefault();
        try {
            await api.delete(`/${institutionCode}/users/me`, {
                data: { password }
            });
            logout();
            navigate(`/${institutionCode}/login`);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete account');
        }
    };

    return (
        <div className="section-container border-red-200 bg-red-50">
            <h2 className="section-title text-red-700 mb-4">Danger Zone</h2>
            
            {!confirming ? (
                <div>
                    <p className="text-gray-600 mb-4">
                        Once you delete your account, there is no going back. Please be certain.
                    </p>
                    <Button variant="danger" onClick={() => setConfirming(true)}>
                        Delete Account
                    </Button>
                </div>
            ) : (
                <form onSubmit={handleDelete} className="flex flex-col gap-4">
                    <p className="text-red-800 font-medium">
                        Please enter your password to confirm deletion.
                    </p>
                    {error && <div className="bg-red-100 text-red-700 p-2 rounded text-sm">{error}</div>}
                    <div>
                        <label className="label text-red-900">Password</label>
                        <input
                            type="password"
                            className="input border-red-300 focus:border-red-500 focus:ring-red-200"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="flex gap-4">
                        <Button type="submit" variant="danger">
                            Confirm Delete
                        </Button>
                        <Button 
                            type="button" 
                            variant="secondary" 
                            onClick={() => {
                                setConfirming(false);
                                setPassword('');
                                setError('');
                            }}
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default Profile;
